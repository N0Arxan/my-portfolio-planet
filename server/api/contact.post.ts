import { useDb } from '../utils/db';
import { logContactAttempt, logSecurityEvent } from '../utils/logger';

// Rate limiting: track attempts per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_ATTEMPTS = 5; // Max 5 submissions per hour per IP

// Validation constants
const VALIDATION_RULES = {
    name: { minLength: 2, maxLength: 100, pattern: /^[a-zA-Z\s'-]+$/ },
    email: { minLength: 5, maxLength: 255, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    message: { minLength: 10, maxLength: 2000 }
};

// Spam detection keywords (simple example)
const SPAM_KEYWORDS = ['viagra', 'casino', 'lottery', 'crypto', 'bitcoin'];

interface ContactRequest {
    name: string;
    email: string;
    message: string;
    honey_pot_field?: string;
}

interface ValidationErrors {
    [key: string]: string;
}

/**
 * Validates contact form input
 */
function validateInput(body: ContactRequest): ValidationErrors {
    const errors: ValidationErrors = {};

    // Name validation
    if (!body.name?.trim()) {
        errors.name = 'Name is required';
    } else if (body.name.length < VALIDATION_RULES.name.minLength) {
        errors.name = `Name must be at least ${VALIDATION_RULES.name.minLength} characters`;
    } else if (body.name.length > VALIDATION_RULES.name.maxLength) {
        errors.name = `Name must not exceed ${VALIDATION_RULES.name.maxLength} characters`;
    } else if (!VALIDATION_RULES.name.pattern.test(body.name)) {
        errors.name = 'Name contains invalid characters';
    }

    // Email validation
    if (!body.email?.trim()) {
        errors.email = 'Email is required';
    } else if (body.email.length < VALIDATION_RULES.email.minLength) {
        errors.email = 'Email is invalid';
    } else if (body.email.length > VALIDATION_RULES.email.maxLength) {
        errors.email = `Email must not exceed ${VALIDATION_RULES.email.maxLength} characters`;
    } else if (!VALIDATION_RULES.email.pattern.test(body.email)) {
        errors.email = 'Email format is invalid';
    }

    // Message validation
    if (!body.message?.trim()) {
        errors.message = 'Message is required';
    } else if (body.message.length < VALIDATION_RULES.message.minLength) {
        errors.message = `Message must be at least ${VALIDATION_RULES.message.minLength} characters`;
    } else if (body.message.length > VALIDATION_RULES.message.maxLength) {
        errors.message = `Message must not exceed ${VALIDATION_RULES.message.maxLength} characters`;
    }

    return errors;
}

/**
 * Detects spam content
 */
function isSpam(message: string, email: string): boolean {
    const lowerMessage = message.toLowerCase();
    const lowerEmail = email.toLowerCase();
    
    // Check for spam keywords
    for (const keyword of SPAM_KEYWORDS) {
        if (lowerMessage.includes(keyword) || lowerEmail.includes(keyword)) {
            return true;
        }
    }
    
    // Check for excessive links
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlPattern);
    if (urls && urls.length > 2) {
        return true;
    }
    
    return false;
}

/**
 * Rate limiting check
 */
function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
        // New window or expired - reset
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (record.count >= MAX_ATTEMPTS) {
        return false; // Rate limit exceeded
    }

    // Increment count
    record.count++;
    return true;
}

/**
 * Clean up old rate limit entries (run periodically)
 */
function cleanupRateLimits() {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
        if (now > record.resetTime) {
            rateLimitMap.delete(ip);
        }
    }
}

// Cleanup every 10 minutes
setInterval(cleanupRateLimits, 10 * 60 * 1000);

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
        .substring(0, 2000); // Hard limit
}

export default defineEventHandler(async (event) => {
    try {
        // Get IP address for rate limiting
        const ip = event.node.req.headers['x-forwarded-for']?.toString().split(',')[0] || 
                   event.node.req.socket.remoteAddress || 
                   'unknown';

        // Check rate limit
        if (!checkRateLimit(ip)) {
            logSecurityEvent({ ip, event: 'rate_limit', details: 'Max submissions exceeded' });
            logContactAttempt({ ip, success: false, reason: 'rate_limited', rateLimited: true });
            
            throw createError({
                statusCode: 429,
                statusMessage: 'Too Many Requests',
                message: 'You have exceeded the maximum number of submissions. Please try again later.'
            });
        }

        const body = await readBody<ContactRequest>(event);

        // Honeypot check (silent block)
        if (body.honey_pot_field) {
            logSecurityEvent({ ip, event: 'honeypot_triggered', details: 'Bot detected' });
            logContactAttempt({ ip, success: false, reason: 'honeypot' });
            return { success: true };
        }

        // Validate input
        const errors = validateInput(body);
        if (Object.keys(errors).length > 0) {
            logContactAttempt({ ip, success: false, reason: 'validation_failed', email: body.email });
            
            throw createError({
                statusCode: 422,
                statusMessage: 'Validation Failed',
                data: { errors }
            });
        }

        // Spam detection
        if (isSpam(body.message, body.email)) {
            // Silent block - return success but don't save
            logSecurityEvent({ ip, event: 'spam_detected', details: 'Spam keywords or excessive URLs' });
            logContactAttempt({ ip, success: false, reason: 'spam', email: body.email, spam: true });
            console.warn(`Spam detected from IP: ${ip}`);
            return { success: true };
        }

        // Sanitize inputs
        const sanitizedName = sanitizeInput(body.name);
        const sanitizedEmail = sanitizeInput(body.email);
        const sanitizedMessage = sanitizeInput(body.message);

        // Save to database
        const db = useDb();
        
        // Check for duplicate submissions (same email within last hour)
        const duplicateCheck = db.prepare(
            "SELECT id FROM contacts WHERE email = ? AND created_at > datetime('now', '-1 hour')"
        ).get(sanitizedEmail);

        if (duplicateCheck) {
            logContactAttempt({ ip, success: false, reason: 'duplicate', email: sanitizedEmail, duplicate: true });
            
            throw createError({
                statusCode: 429,
                statusMessage: 'Duplicate Submission',
                message: 'You have already submitted a message recently. Please wait before submitting again.'
            });
        }

        // Insert with timestamp
        const stmt = db.prepare(
            "INSERT INTO contacts (name, email, message, ip_address, created_at) VALUES (?, ?, ?, ?, datetime('now'))"
        );
        stmt.run(sanitizedName, sanitizedEmail, sanitizedMessage, ip);

        // Log successful submission
        logContactAttempt({ ip, success: true, email: sanitizedEmail });

        return { success: true, message: 'Your message has been received. Thank you!' };
        
    } catch (error: any) {
        // Log error for monitoring
        console.error('Contact form error:', {
            message: error.message,
            statusCode: error.statusCode,
            timestamp: new Date().toISOString()
        });

        // Re-throw if it's already a createError
        if (error.statusCode) {
            throw error;
        }

        // Generic error for unexpected issues
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'An unexpected error occurred. Please try again later.'
        });
    }
});
