const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Anthropic = require('@anthropic-ai/sdk');
const db = require('./db');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// File upload configuration
const upload = multer({ dest: 'uploads/' });

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ============ CHATBOT API ============

// Search knowledge base
async function searchKnowledgeBase(query) {
  try {
    const result = await db.query(`
      SELECT id, category, question, answer, keywords
      FROM knowledge_base
      WHERE is_active = TRUE
      AND (
        question ILIKE $1 
        OR answer ILIKE $1
        OR $2 = ANY(keywords)
      )
      ORDER BY 
        CASE 
          WHEN question ILIKE $1 THEN 1
          WHEN $2 = ANY(keywords) THEN 2
          ELSE 3
        END
      LIMIT 5
    `, [`%${query}%`, query.toLowerCase()]);
    
    return result.rows;
  } catch (error) {
    console.error('Knowledge base search error:', error);
    return [];
  }
}

// Build context from knowledge base
function buildContext(kbResults) {
  if (kbResults.length === 0) {
    return "No specific information found in the knowledge base.";
  }
  
  return kbResults.map((item, index) => 
    `[${index + 1}] Category: ${item.category}\nQ: ${item.question}\nA: ${item.answer}`
  ).join('\n\n');
}

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Search knowledge base
    const kbResults = await searchKnowledgeBase(message);
    const context = buildContext(kbResults);

    // Build conversation history for Claude
    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    messages.push({
      role: 'user',
      content: message
    });

    // System prompt for CEAT chatbot
    const systemPrompt = `You are a helpful customer support assistant for CEAT Tyres, one of India's leading tyre manufacturers. Your role is to assist customers with information about CEAT products, services, and general tyre-related queries.

KNOWLEDGE BASE:
${context}

GUIDELINES:
1. Use the knowledge base information above to answer questions accurately
2. If the answer is in the knowledge base, cite it naturally in your response
3. Be friendly, professional, and concise
4. If you don't have specific information, acknowledge it honestly and suggest contacting CEAT customer service
5. For product recommendations, consider the customer's vehicle type and usage
6. Always prioritize customer safety when discussing tyre-related matters
7. Use simple language that customers can easily understand
8. Respond in the same language as the customer's query

Common CEAT product categories:
- Two-wheeler tyres
- Car & SUV tyres  
- Truck & Bus tyres
- Farm tyres
- Specialty tyres

If asked about pricing, availability, or dealers, guide customers to:
- Visit: www.ceat.com
- Call: CEAT customer care
- Find nearest dealer using the dealer locator on CEAT website`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages
    });

    const botResponse = response.content[0].text;

    // Store conversation in database
    const matchedKbId = kbResults.length > 0 ? kbResults[0].id : null;
    await db.query(`
      INSERT INTO conversations (session_id, user_message, bot_response, matched_kb_id, confidence_score)
      VALUES ($1, $2, $3, $4, $5)
    `, [sessionId || 'anonymous', message, botResponse, matchedKbId, 0.8]);

    res.json({
      response: botResponse,
      sessionId: sessionId || 'anonymous',
      sources: kbResults.length > 0 ? kbResults.slice(0, 2) : []
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Sorry, I encountered an error. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Feedback endpoint
app.post('/api/feedback', async (req, res) => {
  try {
    const { conversationId, feedback } = req.body;
    
    await db.query(`
      UPDATE conversations 
      SET feedback = $1 
      WHERE id = $2
    `, [feedback, conversationId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// ============ ADMIN API - KNOWLEDGE BASE MANAGEMENT ============

// Login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await db.query(
      'SELECT * FROM admin_users WHERE username = $1 AND is_active = TRUE',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    await db.query(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all knowledge base entries
app.get('/api/admin/knowledge-base', authenticateToken, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM knowledge_base WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (search) {
      query += ` AND (question ILIKE $${paramCount} OR answer ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY updated_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    const countResult = await db.query('SELECT COUNT(*) FROM knowledge_base WHERE 1=1');

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get KB error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge base' });
  }
});

// Add single KB entry
app.post('/api/admin/knowledge-base', authenticateToken, async (req, res) => {
  try {
    const { category, question, answer, keywords } = req.body;

    const result = await db.query(`
      INSERT INTO knowledge_base (category, question, answer, keywords, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [category, question, answer, keywords || [], req.user.username]);

    await db.query(`
      INSERT INTO update_logs (update_type, updated_by, changes_count, update_notes)
      VALUES ('knowledge_base', $1, 1, 'Added new entry')
    `, [req.user.username]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Add KB error:', error);
    res.status(500).json({ error: 'Failed to add entry' });
  }
});

// Update KB entry
app.put('/api/admin/knowledge-base/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, question, answer, keywords, is_active } = req.body;

    const result = await db.query(`
      UPDATE knowledge_base
      SET category = $1, question = $2, answer = $3, keywords = $4, 
          is_active = $5, version = version + 1
      WHERE id = $6
      RETURNING *
    `, [category, question, answer, keywords, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update KB error:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Delete KB entry
app.delete('/api/admin/knowledge-base/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM knowledge_base WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete KB error:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// Bulk upload CSV
app.post('/api/admin/knowledge-base/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          let insertCount = 0;

          for (const row of results) {
            const keywords = row.keywords ? row.keywords.split(',').map(k => k.trim()) : [];
            
            await db.query(`
              INSERT INTO knowledge_base (category, question, answer, keywords, created_by)
              VALUES ($1, $2, $3, $4, $5)
            `, [row.category, row.question, row.answer, keywords, req.user.username]);
            
            insertCount++;
          }

          await db.query(`
            INSERT INTO update_logs (update_type, updated_by, changes_count, file_name, update_notes)
            VALUES ('bulk_upload', $1, $2, $3, 'CSV bulk upload')
          `, [req.user.username, insertCount, req.file.originalname]);

          // Clean up uploaded file
          fs.unlinkSync(filePath);

          res.json({ 
            success: true, 
            message: `Successfully uploaded ${insertCount} entries` 
          });
        } catch (error) {
          console.error('Bulk insert error:', error);
          res.status(500).json({ error: 'Failed to process CSV data' });
        }
      });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get categories
app.get('/api/admin/categories', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM knowledge_base
      WHERE is_active = TRUE
      GROUP BY category
      ORDER BY category
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get analytics
app.get('/api/admin/analytics', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const totalConversations = await db.query(`
      SELECT COUNT(*) as count FROM conversations
      WHERE created_at >= $1 AND created_at <= $2
    `, [startDate, endDate]);

    const feedbackStats = await db.query(`
      SELECT feedback, COUNT(*) as count
      FROM conversations
      WHERE feedback IS NOT NULL
        AND created_at >= $1 AND created_at <= $2
      GROUP BY feedback
    `, [startDate, endDate]);

    const topQuestions = await db.query(`
      SELECT user_message, COUNT(*) as count
      FROM conversations
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY user_message
      ORDER BY count DESC
      LIMIT 10
    `, [startDate, endDate]);

    res.json({
      totalConversations: parseInt(totalConversations.rows[0].count),
      feedbackStats: feedbackStats.rows,
      topQuestions: topQuestions.rows
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ============ PRODUCT MANAGEMENT ============

// Get all products
app.get('/api/admin/products', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM products 
      WHERE is_active = TRUE 
      ORDER BY category, product_name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add product
app.post('/api/admin/products', authenticateToken, async (req, res) => {
  try {
    const { 
      product_name, category, subcategory, description, 
      specifications, price_range, features, image_url 
    } = req.body;

    const result = await db.query(`
      INSERT INTO products 
      (product_name, category, subcategory, description, specifications, price_range, features, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [product_name, category, subcategory, description, specifications, price_range, features, image_url]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`CEAT Chatbot Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
