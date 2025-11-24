# Data Directory Structure

This directory contains persistent data and logs for the application.

## Structure

```
data/
├── database/              # SQLite database files
│   └── contacts.sqlite   # Contact form submissions
└── logs/                 # Application logs
    ├── contact.log       # Contact form submission attempts
    ├── security.log      # Security events (rate limits, spam, etc.)
    ├── error.log         # Application errors
    └── access.log        # Page visits (optional)
```

## Log Files

### contact.log
Records all contact form submission attempts with:
- Timestamp
- Success/failure status
- Anonymized IP (e.g., `192.168.xxx.xxx`)
- Email domain only (e.g., `gmail.com` not full email)
- Failure reason (validation, spam, rate limit, duplicate)

**Privacy**: Full emails and personal data are NOT logged, only stored in the database.

### security.log
Tracks security events:
- Rate limiting violations
- Spam detection
- Honeypot triggers
- Suspicious activity

### error.log
Application errors and exceptions for debugging.

### Log Rotation
- Logs automatically rotate when they exceed 10MB
- Old logs are timestamped and archived
- Example: `contact.log` → `contact-2025-11-24T20-30-00.log`

## Privacy & GDPR Compliance

**What we log:**
- ✅ Anonymized IP addresses (last 2 octets hidden)
- ✅ Email domains (not full addresses)
- ✅ Timestamps
- ✅ Success/failure status

**What we DON'T log:**
- ❌ Full email addresses in logs
- ❌ Message content
- ❌ Personal names
- ❌ Full IP addresses

**Data retention:**
- Logs can be manually cleaned as needed
- Recommended: Delete logs older than 90 days for privacy

## Database Volume Mapping

When running with Docker, this directory is mounted to `/app/server/database` inside the container, ensuring that contact form data persists across container restarts.

### Docker Volume Configuration

```yaml
volumes:
  - ./data/database:/app/server/database
```

## Backup Recommendation

To backup your contact data:

```bash
# Copy the SQLite database
cp data/database/contacts.sqlite data/database/contacts.backup.sqlite

# Or create a dated backup
cp data/database/contacts.sqlite data/database/contacts-$(date +%Y%m%d).sqlite
```

## Security Notes

- The `data/` directory is excluded from Git (see `.gitignore`)
- Database files contain user-submitted contact information
- Ensure proper file permissions (755 for directories, 644 for files)
- IP addresses are logged for rate limiting and security purposes

## Size Management

The database will grow over time. To check the size:

```bash
du -sh data/database/contacts.sqlite
```

To clean old entries (optional):

```bash
# Connect to SQLite
sqlite3 data/database/contacts.sqlite

# Delete entries older than 1 year
DELETE FROM contacts WHERE created_at < datetime('now', '-1 year');

# Optimize database
VACUUM;
.quit
```
