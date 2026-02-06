# CEAT Tyre Chatbot - Complete System

A production-ready AI-powered customer support chatbot for CEAT Tyres with admin dashboard for weekly knowledge base updates.

## 🚀 Features

### Customer-Facing Chatbot
- AI-powered responses using Claude Sonnet 4
- Real-time chat interface
- Knowledge base integration
- Quick question suggestions
- Conversation history
- Source attribution

### Admin Dashboard
- **Knowledge Base Management**
  - Add, edit, delete entries
  - Search and filter by category
  - Bulk CSV upload
  - Weekly updates capability
  - Version tracking
- **Analytics Dashboard**
  - Conversation statistics
  - Popular questions tracking
  - Feedback analysis
- **User Management**
  - Role-based access (Admin, Editor, Viewer)
  - Secure authentication

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- Anthropic API Key ([Get one here](https://console.anthropic.com))

## 🛠️ Installation

### 1. Database Setup

```bash
# Create database
createdb ceat_chatbot

# Run schema
psql -d ceat_chatbot -f database/schema.sql

# Insert sample data
psql -d ceat_chatbot -f database/seed_data.sql
```

### 2. Create Admin User

You'll need to create an admin user with a properly hashed password. Run this Node.js script:

```javascript
// create-admin.js
const bcrypt = require('bcrypt');

async function createAdmin() {
    const password = 'your_secure_password'; // Change this!
    const hash = await bcrypt.hash(password, 10);
    console.log('Password hash:', hash);
}

createAdmin();
```

Then insert the admin user:

```sql
INSERT INTO admin_users (username, email, password_hash, full_name, role)
VALUES (
    'admin',
    'admin@ceat.com',
    'YOUR_GENERATED_HASH_HERE',
    'CEAT Administrator',
    'admin'
);
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your credentials:
# - Database connection details
# - Anthropic API key
# - JWT secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
nano .env

# Start server
npm start

# For development with auto-reload:
npm run dev
```

### 4. Frontend Setup

The frontend files are standalone HTML files. You can:

**Option A: Open directly in browser**
```bash
# Open customer chatbot
open frontend/customer-chatbot.html

# Open admin dashboard
open frontend/admin-dashboard.html
```

**Option B: Serve with simple HTTP server**
```bash
cd frontend
python3 -m http.server 8000

# Then visit:
# Customer chatbot: http://localhost:8000/customer-chatbot.html
# Admin dashboard: http://localhost:8000/admin-dashboard.html
```

## 📊 Database Schema

### Main Tables
- **knowledge_base** - FAQ and support content
- **products** - CEAT product information
- **conversations** - Chat history and analytics
- **update_logs** - Track knowledge base updates
- **admin_users** - Dashboard user management

## 🔑 API Endpoints

### Public Endpoints
- `POST /api/chat` - Send message to chatbot
- `POST /api/feedback` - Submit feedback

### Admin Endpoints (require authentication)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/knowledge-base` - List KB entries
- `POST /api/admin/knowledge-base` - Add KB entry
- `PUT /api/admin/knowledge-base/:id` - Update KB entry
- `DELETE /api/admin/knowledge-base/:id` - Delete KB entry
- `POST /api/admin/knowledge-base/upload` - Bulk CSV upload
- `GET /api/admin/categories` - Get all categories
- `GET /api/admin/analytics` - Get analytics data

## 📝 Weekly Knowledge Base Update Process

### Method 1: Using Admin Dashboard

1. Login to admin dashboard
2. Navigate to "Knowledge Base" tab
3. Click "Upload CSV" button
4. Select your prepared CSV file
5. System automatically imports and logs changes

### Method 2: Using CSV Upload

Prepare a CSV file with this format:

```csv
category,question,answer,keywords
"Product Information","What is CEAT?","CEAT is one of India's leading tyre manufacturers...","ceat,about,company"
"Technical Support","How to check pressure?","To check tyre pressure: 1) Find recommended PSI...","pressure,check,maintenance"
```

**CSV Template Download:** Click "Download Template" button in the admin dashboard.

### Method 3: Manual Entry

1. Click "+ Add New Entry"
2. Fill in:
   - Category (e.g., "Product Information", "Technical Support")
   - Question
   - Answer
   - Keywords (comma-separated)
3. Click "Add Entry"

## 🎯 Usage Examples

### Customer Queries the Bot Can Handle

- Product information ("What types of tyres does CEAT make?")
- Technical support ("How do I check tyre pressure?")
- Warranty questions ("What warranty does CEAT provide?")
- Dealer location ("Where can I find a dealer?")
- Pricing information ("How much do CEAT tyres cost?")
- Tyre specifications ("What does 205/55 R16 mean?")
- Safety advice ("When should I replace my tyres?")

### Admin Tasks

**Weekly Update Workflow:**
1. Prepare updated information in CSV
2. Login to dashboard
3. Upload CSV file
4. Review imported entries
5. Edit if needed
6. System automatically logs update

## 🔒 Security Best Practices

1. **Change Default Credentials**
   - Update admin password immediately
   - Use strong, unique passwords

2. **Environment Variables**
   - Never commit .env file
   - Use strong JWT secret (32+ characters)
   - Rotate API keys regularly

3. **Database**
   - Use strong PostgreSQL password
   - Enable SSL in production
   - Regular backups

4. **API**
   - Enable CORS only for your domains
   - Use HTTPS in production
   - Implement rate limiting (already configured)

## 🚀 Production Deployment

### Backend Deployment (Example: Ubuntu Server)

```bash
# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start server.js --name ceat-chatbot

# Enable auto-restart on system reboot
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/ceat-chatbot

# Add configuration:
server {
    listen 80;
    server_name api.ceat-chatbot.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/ceat-chatbot /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### Frontend Deployment

Deploy the HTML files to any static hosting:
- AWS S3 + CloudFront
- Netlify
- Vercel
- GitHub Pages

Update the API_URL in both HTML files to point to your production API.

## 📈 Monitoring & Analytics

### Built-in Analytics
- Total conversations
- Feedback statistics
- Top questions
- Category distribution

### Recommended Additional Tools
- **Database:** pg_stat_statements for query performance
- **Application:** PM2 monitoring dashboard
- **Logs:** Winston or Morgan for structured logging
- **Errors:** Sentry for error tracking

## 🔧 Customization

### Adding New Categories

1. Simply create entries with new category names
2. System automatically tracks categories
3. Categories appear in dropdown filters

### Modifying System Prompt

Edit the `systemPrompt` variable in `backend/server.js`:

```javascript
const systemPrompt = `You are a helpful customer support assistant for CEAT Tyres...
// Customize guidelines here
`;
```

### Changing AI Model

Update the model parameter in the chat endpoint:

```javascript
model: 'claude-sonnet-4-20250514', // or claude-opus-4-20250514 for more capability
```

## 🐛 Troubleshooting

### "Connection refused" error
- Check if PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database credentials in .env

### "Unauthorized" error in admin
- Check JWT token is valid
- Verify admin user exists in database
- Check JWT_SECRET matches between requests

### Chatbot not responding
- Verify Anthropic API key is valid
- Check API key has sufficient credits
- Review server logs: `pm2 logs ceat-chatbot`

### CSV upload fails
- Ensure CSV follows template format
- Check for special characters in content
- Verify file encoding is UTF-8

## 📞 Support

For questions or issues:
1. Check this README
2. Review server logs
3. Check database logs
4. Contact your development team

## 📄 License

Proprietary - CEAT Limited

## 🔄 Version History

- **v1.0.0** - Initial release
  - Customer chatbot
  - Admin dashboard
  - Knowledge base management
  - CSV bulk upload
  - Basic analytics

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Advanced analytics dashboard
- [ ] Customer feedback sentiment analysis
- [ ] Integration with CRM system
- [ ] Mobile app (iOS/Android)
- [ ] WhatsApp integration
- [ ] Auto-suggest question improvements based on failed queries
