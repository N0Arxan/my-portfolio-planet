import { logPageVisit } from '../utils/logger';

export default defineEventHandler((event) => {
    // Get request details
    const ip = event.node.req.headers['x-forwarded-for']?.toString().split(',')[0] || 
               event.node.req.socket.remoteAddress || 
               'unknown';
    
    const path = event.node.req.url || '/';
    const userAgent = event.node.req.headers['user-agent'];
    const referer = event.node.req.headers['referer'];
    const method = event.node.req.method;

    // Only log actual page requests (not API calls or static assets)
    if (!path.startsWith('/api/') && 
        !path.startsWith('/_nuxt/') && 
        !path.includes('.') && // Skip files with extensions
        method === 'GET') {
        
        logPageVisit({
            ip,
            path,
            userAgent,
            referer,
            method
        });
    }
});
