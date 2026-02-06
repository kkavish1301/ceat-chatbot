# CEAT Chatbot - Deployment Checklist

## 📋 Pre-Deployment

### 1. Code Preparation
- [ ] Review all code files
- [ ] Update API URLs in frontend files (change from localhost)
- [ ] Customize branding (logos, colors, company name)
- [ ] Review and update system prompts in server.js
- [ ] Remove any test/debug code
- [ ] Add production error handling

### 2. Environment Configuration
- [ ] Create production .env file
- [ ] Generate strong JWT secret (32+ chars)
- [ ] Obtain Anthropic API key
- [ ] Set NODE_ENV=production
- [ ] Configure database credentials
- [ ] Set appropriate CORS origins

### 3. Database Setup
- [ ] Provision PostgreSQL database
- [ ] Run schema.sql
- [ ] Create admin user with strong password
- [ ] Load initial knowledge base
- [ ] Set up automated backups
- [ ] Enable SSL connections
- [ ] Configure connection pooling

### 4. Security Hardening
- [ ] Change all default passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure CORS properly
- [ ] Review and limit API permissions
- [ ] Set up IP whitelisting for admin (optional)

## 🚀 Deployment Steps

### Backend Deployment

#### Option A: Traditional Server (Ubuntu)

```bash
# 1. Install dependencies
sudo apt update
sudo apt install nodejs npm postgresql nginx

# 2. Clone/upload your code
cd /var/www
sudo mkdir ceat-chatbot
sudo chown $USER:$USER ceat-chatbot
cd ceat-chatbot

# 3. Install Node packages
cd backend
npm install --production

# 4. Set up environment
nano .env
# Add all production values

# 5. Set up PM2
sudo npm install -g pm2
pm2 start server.js --name ceat-chatbot
pm2 startup
pm2 save

# 6. Configure Nginx
sudo nano /etc/nginx/sites-available/ceat-api
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 7. Enable site
sudo ln -s /etc/nginx/sites-available/ceat-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 8. Set up SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

#### Option B: Cloud Platform (Heroku, AWS, etc.)

**Heroku:**
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

heroku login
heroku create ceat-chatbot-api
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set ANTHROPIC_API_KEY=your_key
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

git push heroku main
```

### Frontend Deployment

#### Option A: Static Hosting (Netlify)

```bash
# 1. Update API_URL in both HTML files
# Change: const API_URL = 'http://localhost:3001/api';
# To: const API_URL = 'https://api.your-domain.com/api';

# 2. Deploy to Netlify
# - Drag and drop frontend folder to Netlify
# - Or use Netlify CLI:
npm install -g netlify-cli
cd frontend
netlify deploy --prod
```

#### Option B: AWS S3 + CloudFront

```bash
# 1. Create S3 bucket
aws s3 mb s3://ceat-chatbot-frontend

# 2. Upload files
aws s3 sync frontend/ s3://ceat-chatbot-frontend/ --acl public-read

# 3. Enable static website hosting
aws s3 website s3://ceat-chatbot-frontend/ --index-document customer-chatbot.html

# 4. Set up CloudFront for HTTPS and caching
```

#### Option C: Same Server as Backend

```nginx
# Add to Nginx configuration
server {
    listen 80;
    server_name chatbot.your-domain.com;
    root /var/www/ceat-chatbot/frontend;
    index customer-chatbot.html;

    location / {
        try_files $uri $uri/ =404;
    }
}

server {
    listen 80;
    server_name admin.your-domain.com;
    root /var/www/ceat-chatbot/frontend;
    index admin-dashboard.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## ✅ Post-Deployment Verification

### 1. Smoke Tests
- [ ] Backend health check: GET https://api.your-domain.com/health
- [ ] Admin login works
- [ ] Can add/edit/delete KB entries
- [ ] CSV upload works
- [ ] Customer chatbot loads
- [ ] Chatbot responds to questions
- [ ] Knowledge base search works
- [ ] Conversations are logged

### 2. Performance Tests
- [ ] API response time < 2 seconds
- [ ] Database queries optimized
- [ ] Frontend loads quickly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Works on different browsers

### 3. Security Tests
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting working
- [ ] Authentication required for admin
- [ ] Passwords hashed in database
- [ ] No sensitive data in logs
- [ ] SQL injection prevention works

## 📊 Monitoring Setup

### 1. Application Monitoring
```bash
# PM2 Monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View logs
pm2 logs ceat-chatbot
pm2 monit
```

### 2. Database Monitoring
```sql
-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Monitor slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

### 3. External Monitoring (Optional)
- [ ] Set up UptimeRobot for uptime monitoring
- [ ] Configure Sentry for error tracking
- [ ] Set up Google Analytics (if needed)
- [ ] Configure CloudWatch (AWS) or similar

## 🔄 Maintenance Schedule

### Daily
- [ ] Check application logs
- [ ] Monitor API usage
- [ ] Check Claude API credits

### Weekly
- [ ] Update knowledge base
- [ ] Review conversation analytics
- [ ] Check database size
- [ ] Review feedback

### Monthly
- [ ] Database backup verification
- [ ] Security updates
- [ ] Performance optimization
- [ ] Cost review

### Quarterly
- [ ] Rotate JWT secrets
- [ ] Update dependencies
- [ ] Security audit
- [ ] Feature review

## 🆘 Rollback Plan

### If deployment fails:

```bash
# Backend rollback
pm2 delete ceat-chatbot
cd /var/www/ceat-chatbot/backend
git checkout [previous-version]
npm install
pm2 start server.js --name ceat-chatbot

# Database rollback
psql -d ceat_chatbot < backup_YYYYMMDD.sql

# Frontend rollback (Netlify)
netlify rollback
```

## 📞 Support Contacts

- **Backend Issues**: [Your DevOps Team]
- **Database Issues**: [Your DBA]
- **Anthropic API Issues**: support@anthropic.com
- **Domain/DNS Issues**: [Your Domain Registrar]

## 🎯 Success Criteria

Deployment is successful when:
- ✅ Customer chatbot responds to queries
- ✅ Admin can login and manage KB
- ✅ All APIs return correct responses
- ✅ No errors in logs
- ✅ HTTPS working
- ✅ Database queries performant
- ✅ CSV upload works
- ✅ Analytics tracking conversations

---

**Remember:** Test everything in a staging environment first!
