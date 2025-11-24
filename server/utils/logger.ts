import fs from 'fs';
import path from 'path';

// Use absolute path - works in Docker and local
const LOG_DIR = process.env.LOG_DIR || path.resolve(process.cwd(), 'data/logs');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB per log file

// Ensure log directory exists
try {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
} catch (error) {
    console.error('Failed to create log directory:', error);
    // Continue anyway - logs will fail but app won't crash
}

interface LogEntry {
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    type: string;
    message: string;
    data?: Record<string, any>;
}

/**
 * Rotate log file if it exceeds max size
 */
function rotateLogIfNeeded(logPath: string): void {
    if (fs.existsSync(logPath)) {
        const stats = fs.statSync(logPath);
        if (stats.size > MAX_LOG_SIZE) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const rotatedPath = logPath.replace('.log', `-${timestamp}.log`);
            fs.renameSync(logPath, rotatedPath);
        }
    }
}

/**
 * Write log entry to file
 */
function writeLog(filename: string, entry: LogEntry): void {
    try {
        const logPath = path.join(LOG_DIR, filename);
        rotateLogIfNeeded(logPath);
        
        const logLine = JSON.stringify(entry) + '\n';
        fs.appendFileSync(logPath, logLine, 'utf8');
    } catch (error) {
        // Silently fail - don't crash the app if logging fails
        console.error('Failed to write log:', error);
    }
}

/**
 * Anonymize IP address (keep first 2 octets for IPv4, first 4 groups for IPv6)
 * NOTE: Set to false for local projects where full IP tracking is needed
 */
const ANONYMIZE_IPS = false; // Set to true for production/GDPR compliance

function anonymizeIP(ip: string): string {
    if (!ANONYMIZE_IPS) return ip; // Return full IP if anonymization is disabled
    
    if (ip.includes(':')) {
        // IPv6
        const parts = ip.split(':');
        return parts.slice(0, 4).join(':') + ':xxxx:xxxx:xxxx:xxxx';
    } else {
        // IPv4
        const parts = ip.split('.');
        return parts.slice(0, 2).join('.') + '.xxx.xxx';
    }
}

/**
 * Log contact form submission attempt
 */
export function logContactAttempt(data: {
    ip: string;
    success: boolean;
    reason?: string;
    email?: string;
    spam?: boolean;
    rateLimited?: boolean;
    duplicate?: boolean;
}): void {
    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: data.success ? 'info' : 'warn',
        type: 'contact_form',
        message: data.success ? 'Contact form submitted successfully' : 'Contact form submission failed',
        data: {
            ip: anonymizeIP(data.ip),
            success: data.success,
            reason: data.reason,
            email: data.email, // Full email address
            spam: data.spam,
            rateLimited: data.rateLimited,
            duplicate: data.duplicate
        }
    };
    
    writeLog('contact.log', entry);
}

/**
 * Log page visit (analytics with full details)
 */
export function logPageVisit(data: {
    ip: string;
    path: string;
    userAgent?: string;
    referer?: string;
    method?: string;
}): void {
    // Parse User-Agent for browser and platform info
    const ua = data.userAgent || '';
    const browser = extractBrowser(ua);
    const platform = extractPlatform(ua);
    
    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        type: 'page_visit',
        message: 'Page visited',
        data: {
            ip: anonymizeIP(data.ip),
            path: data.path,
            method: data.method || 'GET',
            browser: browser,
            platform: platform,
            userAgent: ua,
            referer: data.referer
        }
    };
    
    writeLog('access.log', entry);
}

/**
 * Extract browser from User-Agent
 */
function extractBrowser(ua: string): string {
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Unknown';
}

/**
 * Extract platform from User-Agent
 */
function extractPlatform(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS X') || ua.includes('Macintosh')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
}

/**
 * Log application errors
 */
export function logError(error: Error, context?: Record<string, any>): void {
    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        type: 'application_error',
        message: error.message,
        data: {
            stack: error.stack?.split('\n').slice(0, 5).join('\n'), // First 5 lines only
            ...context
        }
    };
    
    writeLog('error.log', entry);
}

/**
 * Log security events
 */
export function logSecurityEvent(data: {
    ip: string;
    event: 'rate_limit' | 'spam_detected' | 'honeypot_triggered' | 'suspicious_activity';
    details?: string;
}): void {
    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'warn',
        type: 'security',
        message: `Security event: ${data.event}`,
        data: {
            ip: anonymizeIP(data.ip),
            event: data.event,
            details: data.details
        }
    };
    
    writeLog('security.log', entry);
}
