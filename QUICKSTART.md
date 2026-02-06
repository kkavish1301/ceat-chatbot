# CEAT Chatbot - Quick Start Guide

## ⚡ Fast Setup (5 Minutes)

### Step 1: Database Setup (1 min)
```bash
# Create database
createdb ceat_chatbot

# Setup schema
psql -d ceat_chatbot -f database/schema.sql

# Load sample data
psql -d ceat_chatbot -f database/seed_data.sql
```

### Step 2: Create Admin User (1 min)
```bash
cd backend
npm install bcrypt
node create-admin.js

# Follow the prompts, then run the generated SQL command
```

### Step 3: Configure Environment (1 min)
```bash
# Copy example env file
cp .env.example .env

# Edit .env file:
nano .env

# Add:
# - Your database password
# - Your Anthropic API key (get from: https://console.anthropic.com)
# - A random JWT secret (generate with: openssl rand -hex 32)
```

### Step 4: Install & Start Backend (1 min)
```bash
npm install
npm start
```

You should see: `CEAT Chatbot Server running on port 3001`

### Step 5: Open Frontend (1 min)
```bash
# In a new terminal:
cd ../frontend

# Option A: Direct open
open customer-chatbot.html
open admin-dashboard.html

# Option B: Simple server
python3 -m http.server 8000
# Visit: http://localhost:8000/customer-chatbot.html
```

## 🎉 You're Ready!

### Test the Customer Chatbot
1. Open `customer-chatbot.html`
2. Click the chat button (bottom-right)
3. Ask: "What types of tyres does CEAT offer?"

### Test the Admin Dashboard
1. Open `admin-dashboard.html`
2. Login with the credentials you created
3. Try adding a new knowledge base entry

## 📤 Weekly Update Workflow

### Every week, your team should:

1. **Prepare CSV file** with new/updated information
   - Use template: `database/sample_knowledge_base.csv`
   - Format: category, question, answer, keywords

2. **Login to Admin Dashboard**
   - Go to admin-dashboard.html
   - Login with your credentials

3. **Upload CSV**
   - Click "Upload CSV" button
   - Select your prepared file
   - System imports automatically

4. **Verify Updates**
   - Check imported entries
   - Edit if needed
   - All changes are logged

## 🔍 Common Issues

**Can't connect to database?**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart if needed
sudo systemctl restart postgresql
```

**Backend won't start?**
```bash
# Check .env file exists and has correct values
cat .env

# Check port 3001 is available
lsof -i :3001
```

**Admin login fails?**
```bash
# Verify admin user exists
psql -d ceat_chatbot -c "SELECT * FROM admin_users;"
```

## 📊 Sample Questions for Testing

Try asking the chatbot:
- "What is CEAT?"
- "How do I check tyre pressure?"
- "What warranty does CEAT provide?"
- "Where can I find a dealer?"
- "When should I replace my tyres?"

## 🎯 Next Steps

1. ✅ Customize the knowledge base for your actual FAQ
2. ✅ Update the system prompt in server.js
3. ✅ Add your branding to frontend files
4. ✅ Set up weekly update schedule
5. ✅ Deploy to production (see README.md)

## 📞 Need Help?

Check the full README.md for:
- Detailed API documentation
- Production deployment guide
- Security best practices
- Troubleshooting guide
