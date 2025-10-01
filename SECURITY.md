# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please do **NOT** open a public issue.

Instead, please email us directly at: [security@yourdomain.com] (Please replace with your actual security contact)

We take all security vulnerabilities seriously and will respond within 48 hours.

## Security Measures

### Authentication

- **One-Time JWT**: Tokens are valid for 7 days but can only be used once
- **Token Invalidation**: Tokens are automatically invalidated after voting
- **Secure Token Generation**: Uses industry-standard JWT with strong secrets

### Database Security

- **Turso (libSQL)**: Encrypted connections with authentication tokens
- **Anonymized Data**: No link between user identity and vote
- **Prepared Statements**: Protection against SQL injection
- **Minimal Data Storage**: Only email and vote data stored

### Data Privacy (DSGVO/GDPR)

- **Email Only**: Minimal personal data collection
- **Anonymous Voting**: Votes cannot be traced back to users
- **No Tracking**: No cookies or analytics by default
- **Data Minimization**: Only essential data is stored
- **Right to Deletion**: Users can request data deletion

### API Security

- **Input Validation**: All inputs are validated server-side
- **Rate Limiting**: Should be implemented for production (see DEPLOYMENT.md)
- **HTTPS Only**: All connections should use HTTPS in production
- **CORS**: Configured to only allow specific origins

### Environment Variables

- **Secrets Management**: All sensitive data in environment variables
- **Never in Code**: No hardcoded secrets or tokens
- **Vercel Secrets**: Encrypted at rest in Vercel

### Dependencies

- **Regular Updates**: Dependencies are regularly checked and updated
- **Vulnerability Scanning**: Automated checks via npm audit
- **Minimal Dependencies**: Only necessary packages included

## Security Best Practices for Deployment

### JWT Secret

- Use a strong, random secret (minimum 32 characters)
- Rotate secrets every 90 days
- Never commit secrets to version control

```bash
# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database

- Use separate databases for development and production
- Enable automatic backups
- Rotate authentication tokens every 180 days
- Monitor for unusual access patterns

### Email (Resend)

- Use verified domains in production
- Restrict API key permissions to "Sending Access" only
- Monitor email logs for abuse
- Implement rate limiting on registration endpoint

### Vercel

- Enable Web Application Firewall (WAF) if available
- Use Vercel's DDoS protection
- Monitor function logs for suspicious activity
- Set appropriate timeout limits

## Recommended Additional Security Measures

### For Production Deployment

1. **Rate Limiting**
   ```typescript
   // Implement with @upstash/ratelimit
   // Limit: 5 registrations per IP per hour
   ```

2. **CAPTCHA**
   ```typescript
   // Add reCAPTCHA or hCaptcha to registration form
   ```

3. **Email Verification**
   ```typescript
   // Implement double opt-in for registration
   ```

4. **IP Blacklisting**
   ```typescript
   // Block known malicious IPs
   ```

5. **Content Security Policy**
   ```typescript
   // Add CSP headers to Next.js config
   ```

### Monitoring

- Set up error tracking (Sentry, LogRocket)
- Monitor API usage patterns
- Alert on unusual activity
- Regular security audits

## Security Checklist

### Development

- [ ] No secrets in code
- [ ] All inputs validated
- [ ] SQL injection protection (prepared statements)
- [ ] XSS protection (React's built-in escaping)
- [ ] CSRF protection (built into Next.js)

### Deployment

- [ ] HTTPS enforced
- [ ] Environment variables set correctly
- [ ] JWT secret is strong and unique
- [ ] Database authentication enabled
- [ ] Rate limiting implemented
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't include sensitive data

### Post-Deployment

- [ ] Monitor logs regularly
- [ ] Keep dependencies updated
- [ ] Rotate secrets regularly
- [ ] Test backup/restore procedures
- [ ] Audit access logs

## Known Limitations

### Current Implementation

1. **No Rate Limiting**: Must be added for production use
2. **No CAPTCHA**: Vulnerable to automated registration
3. **No Email Verification**: Single-step registration
4. **No Admin Interface**: Database access via CLI only

### Planned Improvements

- [ ] Rate limiting on all API endpoints
- [ ] CAPTCHA integration
- [ ] Double opt-in for registration
- [ ] Admin dashboard for monitoring
- [ ] Automated security scanning

## Security Updates

We regularly review and update security measures. Check this document for the latest recommendations.

Last updated: [Current Date]

## Compliance

### GDPR/DSGVO Compliance

This application is designed with GDPR compliance in mind:

- ✅ **Data Minimization**: Only email addresses stored
- ✅ **Purpose Limitation**: Data used only for voting authentication
- ✅ **Storage Limitation**: Data can be deleted on request
- ✅ **Transparency**: Clear privacy policy required (not included, must be added)
- ✅ **Security**: Encrypted connections and anonymized votes
- ⚠️ **Legal Basis**: Ensure you have legal basis for processing (e.g., legitimate interest)
- ⚠️ **Privacy Policy**: Must be added by the operator
- ⚠️ **Imprint/Impressum**: Must be added by the operator

### Additional Requirements

Operators must:

1. Add a privacy policy (Datenschutzerklärung)
2. Add an imprint (Impressum) - if in Germany
3. Inform users about data processing
4. Provide mechanism for data deletion requests
5. Document processing activities (GDPR Article 30)
6. Implement data breach notification procedures

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Initial assessment and acknowledgment
3. **Day 3-7**: Investigation and fix development
4. **Day 8-14**: Testing and validation
5. **Day 15**: Public disclosure (if applicable)

We aim to address critical vulnerabilities within 7 days.

## Security Hall of Fame

We appreciate security researchers who responsibly disclose vulnerabilities. Contributors will be listed here (with permission).

---

**Remember**: Security is an ongoing process. Stay vigilant and keep all systems updated.
