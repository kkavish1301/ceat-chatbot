# CEAT Chatbot - Project Structure

```
ceat-chatbot/
│
├── backend/                          # Node.js Backend Server
│   ├── server.js                     # Main Express server with all API endpoints
│   ├── db.js                         # PostgreSQL connection configuration
│   ├── package.json                  # Node.js dependencies
│   ├── .env.example                  # Environment variables template
│   └── create-admin.js               # Script to generate admin credentials
│
├── frontend/                         # Frontend Applications
│   ├── admin-dashboard.html          # Admin dashboard (React)
│   │                                 # Features:
│   │                                 # - Knowledge base CRUD operations
│   │                                 # - CSV bulk upload
│   │                                 # - Search and filtering
│   │                                 # - User authentication
│   │                                 # - Analytics (basic)
│   │
│   └── customer-chatbot.html         # Customer-facing chatbot (React)
│                                     # Features:
│                                     # - AI-powered chat interface
│                                     # - Real-time responses
│                                     # - Quick questions
│                                     # - Conversation history
│                                     # - Source attribution
│
├── database/                         # Database Files
│   ├── schema.sql                    # Complete database schema
│   │                                 # Tables:
│   │                                 # - knowledge_base
│   │                                 # - products
│   │                                 # - conversations
│   │                                 # - update_logs
│   │                                 # - admin_users
│   │
│   ├── seed_data.sql                 # Sample data and initial setup
│   └── sample_knowledge_base.csv     # CSV template for bulk uploads
│
├── README.md                         # Complete documentation
├── QUICKSTART.md                     # 5-minute setup guide
└── .gitignore                        # Git ignore patterns

```

## 📁 File Descriptions

### Backend Files

**server.js** (Main Server)
- Express.js application
- API endpoints for chat, admin, and analytics
- Claude AI integration
- Authentication middleware
- CSV processing
- Database operations

**db.js** (Database Connection)
- PostgreSQL connection pool
- Query helper functions
- Error handling

**package.json**
- Dependencies: express, pg, anthropic-sdk, bcrypt, jwt, multer, etc.
- Scripts for starting server

**create-admin.js**
- Interactive CLI tool to generate admin user credentials
- Bcrypt password hashing

### Frontend Files

**admin-dashboard.html**
- Complete React application in single file
- JWT-based authentication
- Knowledge base management interface
- CSV upload functionality
- Real-time search and filtering
- Responsive design with Tailwind CSS

**customer-chatbot.html**
- Complete React chatbot widget in single file
- Claude AI integration
- Beautiful UI with animations
- Message history
- Quick question suggestions
- Mobile responsive

### Database Files

**schema.sql**
- Complete database structure
- All tables with proper constraints
- Indexes for performance
- Triggers for auto-timestamps
- Comments and documentation

**seed_data.sql**
- Sample admin user (need to update password)
- 8 sample knowledge base entries
- Initial categories
- Update logs

**sample_knowledge_base.csv**
- Template for weekly uploads
- 8 sample entries covering different categories
- Proper CSV formatting examples

## 🔄 Data Flow

### Customer Interaction Flow
```
Customer → customer-chatbot.html → POST /api/chat → server.js
                                                      ↓
                                            Search knowledge_base
                                                      ↓
                                            Call Claude API with context
                                                      ↓
                                            Store in conversations table
                                                      ↓
Customer ← Response with answer and sources ← Return JSON
```

### Admin Update Flow
```
Admin → admin-dashboard.html → Login → JWT Token
                                          ↓
                        Upload CSV → POST /api/admin/knowledge-base/upload
                                          ↓
                                    Parse CSV → Insert to knowledge_base
                                          ↓
                                    Log in update_logs → Return success
```

## 🎨 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL 13+
- **AI**: Anthropic Claude Sonnet 4
- **Authentication**: JWT
- **File Upload**: Multer
- **Security**: Helmet, bcrypt, rate limiting

### Frontend
- **Framework**: React 18 (via CDN)
- **Styling**: Tailwind CSS (via CDN)
- **Build**: None (standalone HTML files)
- **State Management**: React hooks (useState, useEffect)

### Database
- **Type**: PostgreSQL
- **Features**: JSONB, Arrays, Full-text search, Triggers, Indexes

## 🔑 Key Features by Component

### Knowledge Base System
✅ CRUD operations
✅ Category management
✅ Keyword-based search
✅ Version tracking
✅ Bulk CSV import/export
✅ Weekly update workflow

### Chat System
✅ Context-aware responses
✅ Knowledge base integration
✅ Conversation history
✅ Source attribution
✅ Feedback collection
✅ Session management

### Admin Dashboard
✅ Secure authentication
✅ User role management
✅ Real-time search/filter
✅ Bulk operations
✅ Update logging
✅ Analytics tracking

### Security
✅ Password hashing (bcrypt)
✅ JWT authentication
✅ Rate limiting
✅ CORS protection
✅ SQL injection prevention
✅ XSS protection (Helmet)

## 📊 Database Schema Details

### knowledge_base
- Stores all FAQ and support content
- Supports categories, keywords, versioning
- Full-text search capabilities
- Active/inactive status

### conversations
- Tracks all customer interactions
- Links to matched knowledge base entries
- Stores confidence scores
- Captures feedback

### update_logs
- Audit trail for all changes
- Tracks who made updates
- Records file uploads
- Maintains change count

### admin_users
- User credentials (hashed)
- Role-based access control
- Login tracking
- Active/inactive status

## 🚀 Deployment Architecture

### Recommended Production Setup

```
Internet
   ↓
Nginx (Reverse Proxy)
   ↓
Node.js (PM2) → PostgreSQL
   ↓
Anthropic API
```

### Scalability Options
- Load balancer for multiple Node.js instances
- Read replicas for PostgreSQL
- Redis for caching frequently asked questions
- CDN for frontend static files

## 📈 Monitoring Points

- Database query performance
- API response times
- Claude API usage and costs
- Conversation success rates
- Knowledge base coverage gaps
- User feedback trends

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable PostgreSQL SSL
- [ ] Set up HTTPS (Let's Encrypt)
- [ ] Configure CORS for specific domains
- [ ] Enable database backups
- [ ] Monitor API key usage
- [ ] Regular security updates
- [ ] Log rotation
- [ ] Rate limiting tuning
