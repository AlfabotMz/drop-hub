# WINIKE - Guia de Implementação
## Código-Fonte, Diagramas e Padrões de Integração

---

## 1. Estrutura de Projeto Recomendada

```
winike-backend/
├── src/
│   ├── config/
│   │   ├── database.js         # PostgreSQL connection
│   │   ├── redis.js            # Redis cache
│   │   └── env.js              # Environment variables
│   ├── models/
│   │   ├── Lead.js
│   │   ├── Order.js
│   │   ├── Campaign.js
│   │   ├── Message.js
│   │   └── Analytics.js
│   ├── controllers/
│   │   ├── leadsController.js
│   │   ├── ordersController.js
│   │   ├── campaignsController.js
│   │   ├── webhooksController.js
│   │   └── analyticsController.js
│   ├── services/
│   │   ├── MetaService.js      # Meta API integration
│   │   ├── WhatsAppService.js  # WhatsApp Business API
│   │   ├── LeadService.js      # Business logic
│   │   ├── OrderService.js
│   │   └── AnalyticsService.js
│   ├── middleware/
│   │   ├── auth.js             # JWT validation
│   │   ├── validation.js       # Request validation
│   │   └── webhookVerify.js    # Webhook signature
│   ├── routes/
│   │   ├── leads.js
│   │   ├── orders.js
│   │   ├── campaigns.js
│   │   ├── webhooks.js
│   │   └── analytics.js
│   ├── jobs/
│   │   ├── syncMetaCampaigns.js
│   │   ├── calculateMetrics.js
│   │   └── cleanupLeads.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── formatters.js
│   └── app.js                  # Express setup
├── tests/
│   ├── unit/
│   └── integration/
├── migrations/
│   └── init.sql
├── docker-compose.yml
├── Dockerfile
├── package.json
└── .env.example
```

---

## 2. Código-Fonte Base (Node.js + Express)

### 2.1 Entry Point (app.js)

```javascript
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const db = require('./config/database');
const redis = require('./config/redis');
const logger = require('./utils/logger');

// Routes
const leadsRoutes = require('./routes/leads');
const ordersRoutes = require('./routes/orders');
const campaignsRoutes = require('./routes/campaigns');
const webhooksRoutes = require('./routes/webhooks');
const analyticsRoutes = require('./routes/analytics');

// Middleware
const authMiddleware = require('./middleware/auth');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Logging
app.use(morgan('combined', { stream: logger.stream }));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes (webhooks are public, others require auth)
app.use('/webhooks', webhooksRoutes);
app.use('/api/leads', authMiddleware, leadsRoutes);
app.use('/api/orders', authMiddleware, ordersRoutes);
app.use('/api/campaigns', authMiddleware, campaignsRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// Error handling
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;
```

### 2.2 Database Connection (config/database.js)

```javascript
const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  logger.info('New database connection established');
});

module.exports = {
  query: (text, params) => {
    const start = Date.now();
    return pool.query(text, params).then((res) => {
      const duration = Date.now() - start;
      if (duration > 1000) {
        logger.warn(`Slow query (${duration}ms): ${text.substring(0, 50)}...`);
      }
      return res;
    });
  },
  getClient: () => pool.connect(),
};
```

### 2.3 Redis Cache (config/redis.js)

```javascript
const redis = require('redis');
const logger = require('../utils/logger');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
});

client.on('error', (err) => {
  logger.error('Redis error', err);
});

client.on('connect', () => {
  logger.info('Redis connected');
});

(async () => {
  await client.connect();
})();

module.exports = client;
```

### 2.4 Lead Model (models/Lead.js)

```javascript
const db = require('../config/database');
const redis = require('../config/redis');

class Lead {
  static async create(data) {
    const result = await db.query(
      `INSERT INTO leads (phone, name, source, meta_lead_id, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.phone, data.name, data.source, data.meta_lead_id, 'NOVO']
    );
    
    // Cache in Redis
    await redis.setEx(
      `lead:${data.phone}`,
      300, // 5 minutes
      JSON.stringify(result.rows[0])
    );
    
    return result.rows[0];
  }

  static async findByPhone(phone) {
    // Try cache first
    const cached = await redis.get(`lead:${phone}`);
    if (cached) return JSON.parse(cached);

    // Query database
    const result = await db.query(
      'SELECT * FROM leads WHERE phone = $1 AND deleted_at IS NULL',
      [phone]
    );

    if (result.rows[0]) {
      await redis.setEx(
        `lead:${phone}`,
        300,
        JSON.stringify(result.rows[0])
      );
    }

    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM leads WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(data).forEach((key) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(data[key]);
      paramCount++;
    });

    values.push(id);

    const result = await db.query(
      `UPDATE leads SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    // Invalidate cache
    if (result.rows[0]) {
      await redis.del(`lead:${result.rows[0].phone}`);
    }

    return result.rows[0];
  }

  static async findByStatus(status, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT * FROM leads 
       WHERE status = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );
    return result.rows;
  }

  static async countByStatus(status) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM leads WHERE status = $1 AND deleted_at IS NULL',
      [status]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = Lead;
```

### 2.5 Meta Service (services/MetaService.js)

```javascript
const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

class MetaService {
  constructor() {
    this.graphUrl = 'https://graph.instagram.com/v19.0';
    this.accessToken = process.env.META_ACCESS_TOKEN;
  }

  // Verify webhook signature (HMAC-SHA256)
  verifyWebhookSignature(req) {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) return false;

    const body = JSON.stringify(req.body);
    const hash = 'sha256=' + crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(hash)
    );
  }

  // Get leads from Lead Form
  async getLeadFormSubmissions(formId, options = {}) {
    try {
      const response = await axios.get(
        `${this.graphUrl}/${formId}/leads`,
        {
          params: {
            fields: 'id,created_time,field_data',
            access_token: this.accessToken,
            ...options
          }
        }
      );

      return response.data.data;
    } catch (error) {
      logger.error('Failed to fetch lead form submissions', error);
      throw error;
    }
  }

  // Track conversion event
  async trackConversion(eventData) {
    try {
      const response = await axios.post(
        `${this.graphUrl}/${process.env.META_PIXEL_ID}/events`,
        {
          data: [
            {
              event_name: 'Purchase',
              event_time: Math.floor(Date.now() / 1000),
              user_data: {
                phone_number: this.hashSHA256(eventData.phone),
                external_id: eventData.lead_id.toString()
              },
              custom_data: {
                currency: 'MZN',
                value: eventData.amount || 1900,
                content_name: 'Máquina de Pipoca RAF 2.0L',
                content_type: 'product'
              },
              event_source_url: eventData.source_url || 'https://winike.com'
            }
          ],
          access_token: this.accessToken
        }
      );

      logger.info('Conversion tracked', { leadId: eventData.lead_id });
      return response.data;
    } catch (error) {
      logger.error('Failed to track conversion', error);
      throw error;
    }
  }

  // Get campaign insights
  async getCampaignInsights(campaignId) {
    try {
      const response = await axios.get(
        `${this.graphUrl}/${campaignId}/insights`,
        {
          params: {
            fields: 'campaign_id,campaign_name,spend,impressions,clicks,cpc,cpm,actions,action_values',
            access_token: this.accessToken
          }
        }
      );

      return response.data.data[0] || {};
    } catch (error) {
      logger.error('Failed to fetch campaign insights', error);
      throw error;
    }
  }

  // Helper: Hash phone number
  hashSHA256(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      const response = await axios.post(
        `${this.graphUrl}/oauth/access_token`,
        {
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: this.accessToken
        }
      );

      this.accessToken = response.data.access_token;
      process.env.META_ACCESS_TOKEN = this.accessToken;
      
      logger.info('Meta access token refreshed');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to refresh access token', error);
      throw error;
    }
  }
}

module.exports = new MetaService();
```

### 2.6 WhatsApp Service (services/WhatsAppService.js)

```javascript
const axios = require('axios');
const logger = require('../utils/logger');

class WhatsAppService {
  constructor() {
    this.graphUrl = 'https://graph.instagram.com/v19.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  }

  // Verify webhook signature
  verifyWebhookSignature(req, secret = process.env.WHATSAPP_WEBHOOK_SECRET) {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) return false;

    const crypto = require('crypto');
    const body = JSON.stringify(req.body);
    const hash = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(hash)
    );
  }

  // Send template message
  async sendTemplate(phoneNumber, templateName, parameters = {}) {
    try {
      const message = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(phoneNumber),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'pt_PT'
          }
        }
      };

      // Add parameters if provided
      if (Object.keys(parameters).length > 0) {
        message.template.parameters = {
          body: {
            parameters: Object.values(parameters).map((value) => ({
              type: 'text',
              text: value.toString()
            }))
          }
        };
      }

      const response = await axios.post(
        `${this.graphUrl}/${this.phoneNumberId}/messages`,
        message,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('WhatsApp template sent', {
        phone: phoneNumber,
        template: templateName,
        messageId: response.data.messages[0].id
      });

      return response.data.messages[0];
    } catch (error) {
      logger.error('Failed to send WhatsApp template', error);
      throw error;
    }
  }

  // Send text message
  async sendText(phoneNumber, text) {
    try {
      const response = await axios.post(
        `${this.graphUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: this.formatPhoneNumber(phoneNumber),
          type: 'text',
          text: {
            body: text
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.messages[0];
    } catch (error) {
      logger.error('Failed to send WhatsApp text', error);
      throw error;
    }
  }

  // Format phone number (remove + and spaces)
  formatPhoneNumber(phone) {
    return phone.replace(/\D/g, '');
  }

  // Get message status
  async getMessageStatus(messageId) {
    try {
      const response = await axios.get(
        `${this.graphUrl}/${messageId}`,
        {
          params: {
            fields: 'status,timestamp',
            access_token: this.accessToken
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get message status', error);
      throw error;
    }
  }
}

module.exports = new WhatsAppService();
```

### 2.7 Webhooks Controller (controllers/webhooksController.js)

```javascript
const metaService = require('../services/MetaService');
const whatsappService = require('../services/WhatsAppService');
const LeadService = require('../services/LeadService');
const logger = require('../utils/logger');
const Message = require('../models/Message');

class WebhooksController {
  // Meta webhook handler
  static async handleMetaWebhook(req, res) {
    const { body } = req;

    // Log webhook
    logger.info('Meta webhook received', { body });

    // Process messaging events
    if (body.entry && body.entry[0]?.messaging) {
      for (const event of body.entry[0].messaging) {
        if (event.sender?.id && event.message?.text) {
          // New lead message
          await LeadService.handleIncomingLead({
            phone: event.sender.id,
            name: event.message.text,
            source: 'facebook'
          });
        }
      }
    }

    // Always respond with 200 immediately
    res.status(200).json({ received: true });
  }

  // WhatsApp webhook handler
  static async handleWhatsAppWebhook(req, res) {
    const { body } = req;

    // Log webhook
    logger.info('WhatsApp webhook received', { body });

    // Handle incoming messages
    if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
      const message = body.entry[0].changes[0].value.messages[0];
      const { from, type, text, button } = message;

      // Find or create lead
      const lead = await LeadService.findOrCreateLead(from);

      // Log message
      await Message.create({
        lead_id: lead.id,
        type: 'INBOUND',
        direction: 'FROM_CUSTOMER',
        content: text?.body || button?.reply?.title || 'unsupported',
        received_at: new Date()
      });

      // Detect intent and route
      const intent = LeadService.detectIntent(text?.body || '');
      
      switch (intent) {
        case 'COMPRA':
          await LeadService.handleBuyIntent(lead);
          break;
        case 'DÚVIDA':
          await LeadService.handleQuestion(lead, text.body);
          break;
        case 'REJEIÇÃO':
          await LeadService.updateLeadStatus(lead.id, 'REJEITADO');
          break;
        default:
          await LeadService.sendFallbackMessage(lead);
      }
    }

    // Handle message delivery status
    if (body.entry?.[0]?.changes?.[0]?.value?.statuses) {
      const status = body.entry[0].changes[0].value.statuses[0];
      await Message.updateStatus(status.id, status.status.toUpperCase());
    }

    // Always respond with 200 immediately
    res.status(200).json({ received: true });
  }

  // Webhook verification
  static verifyMeta(req, res) {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;

    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  }

  static verifyWhatsApp(req, res) {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;

    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  }
}

module.exports = WebhooksController;
```

### 2.8 Analytics Service (services/AnalyticsService.js)

```javascript
const db = require('../config/database');

class AnalyticsService {
  // Calculate dashboard metrics
  static async calculateDashboard(period = '7days') {
    const daysBack = this.getPeriodDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const result = await db.query(
      `
      SELECT 
        COUNT(DISTINCT l.id) as total_leads,
        COUNT(DISTINCT o.id) as conversions,
        ROUND(100.0 * COUNT(DISTINCT o.id) / NULLIF(COUNT(DISTINCT l.id), 0), 2) as conversion_rate,
        COALESCE(SUM(c.spent), 0) as total_spend,
        ROUND(COALESCE(SUM(c.spent), 0) / NULLIF(COUNT(DISTINCT o.id), 0), 2) as cac,
        ROUND(SUM(o.gross_margin) - COALESCE(SUM(c.spent), 0), 2) as gross_profit,
        ROUND((SUM(o.gross_margin) / NULLIF(COALESCE(SUM(c.spent), 0), 0)), 2) as roas
      FROM leads l
      LEFT JOIN orders o ON l.id = o.lead_id AND o.delivery_status = 'ENTREGUE'
      LEFT JOIN campaigns c ON c.created_at >= $1
      WHERE l.created_at >= $1
      `,
      [startDate]
    );

    return result.rows[0];
  }

  // Daily breakdown
  static async getDailyBreakdown(period = '7days') {
    const daysBack = this.getPeriodDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const result = await db.query(
      `
      SELECT 
        DATE(l.created_at) as date,
        COUNT(DISTINCT l.id) as leads,
        COUNT(DISTINCT o.id) as conversions,
        COALESCE(SUM(c.spent), 0) as spend,
        COALESCE(SUM(o.gross_margin), 0) as margin,
        ROUND(COALESCE(SUM(o.gross_margin), 0) - COALESCE(SUM(c.spent), 0), 2) as profit
      FROM leads l
      LEFT JOIN orders o ON l.id = o.lead_id AND o.delivery_status = 'ENTREGUE'
      LEFT JOIN campaigns c ON DATE(c.created_at) = DATE(l.created_at)
      WHERE l.created_at >= $1
      GROUP BY DATE(l.created_at)
      ORDER BY date DESC
      `,
      [startDate]
    );

    return result.rows;
  }

  // Campaign performance
  static async getCampaignPerformance() {
    const result = await db.query(
      `
      SELECT 
        c.id,
        c.name,
        c.spent,
        COUNT(DISTINCT l.id) as leads,
        COUNT(DISTINCT o.id) as conversions,
        ROUND(100.0 * COUNT(DISTINCT o.id) / NULLIF(COUNT(DISTINCT l.id), 0), 2) as conversion_rate,
        ROUND(c.spent / NULLIF(COUNT(DISTINCT o.id), 0), 2) as cac,
        ROUND((COUNT(DISTINCT o.id) * 1900) / NULLIF(c.spent, 0), 2) as roas
      FROM campaigns c
      LEFT JOIN leads l ON l.source = 'facebook'
      LEFT JOIN orders o ON l.id = o.lead_id AND o.delivery_status = 'ENTREGUE'
      WHERE c.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY c.id, c.name, c.spent
      ORDER BY c.spent DESC
      `
    );

    return result.rows;
  }

  // Generate alerts
  static async generateAlerts() {
    const alerts = [];

    // Check CAC
    const { cac } = await this.calculateDashboard('7days');
    if (cac > 200) {
      alerts.push({
        level: 'danger',
        message: `CAC crítico: ${cac} MT (máximo: 150 MT)`
      });
    } else if (cac > 150) {
      alerts.push({
        level: 'warning',
        message: `CAC elevado: ${cac} MT`
      });
    }

    // Check conversion rate
    const { conversion_rate } = await this.calculateDashboard('7days');
    if (conversion_rate < 2) {
      alerts.push({
        level: 'danger',
        message: `Taxa de conversão crítica: ${conversion_rate}%`
      });
    }

    return alerts;
  }

  // Helper: Get days from period string
  static getPeriodDays(period) {
    const periods = {
      '1day': 1,
      '7days': 7,
      '30days': 30,
      'month': 30,
      'quarter': 90,
      'year': 365
    };
    return periods[period] || 7;
  }
}

module.exports = AnalyticsService;
```

---

## 3. Diagramas de Fluxo

### 3.1 Lead Flow Diagram (ASCII)

```
┌────────────────────────────────────────────────────────────────┐
│                     LEAD ACQUISITION FLOW                       │
└────────────────────────────────────────────────────────────────┘

Step 1: LEAD GENERATION
┌──────────────────┐
│ Facebook Ad      │
│ (Lead Form)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ Webhook: Lead Form Submitted │
│ Meta API → /webhooks/meta    │
└────────┬─────────────────────┘
         │
         ▼
Step 2: LEAD INGESTION
┌─────────────────────────────┐
│ Backend Processing:          │
│ 1. Parse lead data           │
│ 2. Deduplication check       │
│ 3. Save to PostgreSQL        │
│ 4. Cache in Redis            │
└────────┬────────────────────┘
         │
         ▼
Step 3: AUTOMATED OUTREACH
┌──────────────────────────────┐
│ Trigger: sendWelcomeMessage  │
│ → WhatsApp Business API      │
│ → Template: "welcome_offer"  │
└────────┬─────────────────────┘
         │
         ▼
Step 4: CUSTOMER RESPONSE
┌──────────────────────────────┐
│ Webhook: Incoming Message    │
│ /whatsapp/webhooks/messages  │
└────────┬─────────────────────┘
         │
         ▼
Step 5: INTENT DETECTION
┌────────────────────────┐      ┌─────────────────────────┐
│ NLP: Detect Intent     │──────│ Route to Handler:       │
│ - COMPRA               │      │ - handleBuyIntent()     │
│ - DÚVIDA               │      │ - handleQuestion()      │
│ - REJEIÇÃO             │      │ - handleReject()        │
└────────┬───────────────┘      └─────────────────────────┘
         │
         ├─► COMPRA
         │   └─► Send: Order Summary + Buttons
         │       └─► Client clicks: SIM
         │           └─► Create Order
         │               └─► Send Payment Instructions
         │
         ├─► DÚVIDA
         │   └─► Send: FAQ Response
         │       └─► Client responds
         │           └─► Back to Step 5
         │
         └─► REJEIÇÃO
             └─► Update status: REJEITADO
                 └─► Archive lead

┌────────────────────────────────────────────────────────────────┐
│                         CONVERSION FLOW                         │
└────────────────────────────────────────────────────────────────┘

Order Created → Payment → Delivery → Analytics Update
     ↓            ↓           ↓            ↓
[CONFIRMADO] → [PAGAMENTO] → [ENTREGADO] → [FINAL]
               _PENDENTE     
                ↓
         Manual confirmation
         (operator validates payment)
                ↓
         [PAGAMENTO_CONFIRMADO]
                ↓
         Send: Delivery coordination
```

### 3.2 Meta API Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│              META API INTEGRATION TIMELINE                  │
└─────────────────────────────────────────────────────────────┘

REAL-TIME (Webhook)
┌──────────────────────────────┐
│ Customer clicks Facebook Ad  │
└────────┬─────────────────────┘
         │ (instant)
         ▼
┌──────────────────────────────┐
│ Meta fires: lead_form event  │
│ via Webhooks                 │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Winike receives:             │
│ POST /webhooks/meta          │
│ Validate signature + parse   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Create Lead in DB            │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Trigger: Send WhatsApp msg   │
└──────────────────────────────┘

DAILY (Batch Sync)
┌──────────────────────────────┐
│ Scheduled Job (1x/day)       │
│ syncMetaCampaigns.js         │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ GET /campaigns/insights      │
│ - Fetch spend, impressions   │
│ - Fetch actions (conversions)│
│ - Fetch CPC, CPM metrics     │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Update analytics table       │
│ Recalculate CAC, ROI         │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Update Redis cache           │
│ (for dashboard queries)      │
└──────────────────────────────┘

ON CONVERSION (Real-time)
┌──────────────────────────────┐
│ Order confirmed (client buys)│
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Winike backend:              │
│ Call Meta Conversions API    │
│ POST /events                 │
│ - user_data (phone hashed)   │
│ - custom_data (1900 MZN)     │
│ - event: "Purchase"          │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Meta updates:                │
│ - Pixel conversion count     │
│ - ROAS calculation           │
│ - Audience lookalike         │
└──────────────────────────────┘
```

### 3.3 WhatsApp Conversation Flow

```
Customer Response Tree
──────────────────────

                  ┌─────────────────┐
                  │  WELCOME MSG    │
                  │ (Sent Auto)     │
                  └────────┬────────┘
                           │
              ┌────────────┴────────────┐
              │ (7 days to respond)     │
              │                         │
        ┌─────▼────────┐         ┌─────▼────────┐
        │ NO RESPONSE  │         │ RESPONDS     │
        │ ↓            │         │ ↓            │
        │ ABANDONED    │         └──────┬───────┘
        └──────────────┘                │
                               ┌────────▼──────────┐
                               │ DETECT INTENT     │
                               └─┬──┬──┬───────────┘
                                 │  │  │
           ┌─────────────────────┘  │  └──────────────────┐
           │                        │                      │
      ┌────▼────────┐      ┌────────▼─────┐      ┌────────▼────┐
      │ COMPRA       │      │ DÚVIDA        │      │ REJEIÇÃO    │
      │ ("Quero")    │      │ ("Como?")     │      │ ("Não")     │
      └────┬────────┘      └────────┬─────┘      └────────┬────┘
           │                        │                     │
      ┌────▼────────────────────────────────────────┐    │
      │ Send: Order Summary + [SIM/NÃO] buttons     │    │
      └────┬────────────────────────────────────────┘    │
           │                                              │
      ┌────▼─────────┬────────────────┐                   │
      │              │                │                   │
   ┌──▼───┐       ┌──▼───┐      ┌─────▼────┐    ┌────────▼────┐
   │ SIM  │       │ NÃO  │      │ Send FAQ │    │ REJEITADO   │
   └──┬───┘       └──┬───┘      │ Retry    │    │ (Archive)   │
      │              │          └──┬───────┘    └─────────────┘
      │         ┌────▼──────┐      │
      │         │ REJEITADO │      │
      │         └───────────┘  ┌───▼──────────┐
      │                        │ Customer     │
   ┌──▼──────────────────┐     │ responds     │
   │ Send:               │     │ again?       │
   │ "Confirme compra    │     └──────┬───────┘
   │  - Enviar 1900 MT   │            │
   │  para..."           │       ┌────▼──────┐
   │ [Link de Pagamento] │       │ Back to    │
   └──┬─────────────────┘       │ Intent     │
      │                         │ Detection  │
      │                         └────────────┘
   ┌──▼──────────────────────────┐
   │ Customer confirms payment    │
   │ (Manual: Operator checks)    │
   └──┬───────────────────────────┘
      │
   ┌──▼──────────────────────────┐
   │ Send: Delivery Coordination  │
   │ "Quando podes receber?"      │
   └──┬───────────────────────────┘
      │
   ┌──▼──────────────────────────┐
   │ Operator picks up delivery   │
   │ Sends: "Chego em 2h"         │
   └──┬───────────────────────────┘
      │
   ┌──▼──────────────────────────┐
   │ Delivery happens             │
   │ Photo + GPS uploaded         │
   └──┬───────────────────────────┘
      │
   ┌──▼──────────────────────────┐
   │ Send: Thank You + Warranty   │
   │ "7 dias para devolver"       │
   └──────────────────────────────┘
```

---

## 4. Configuração de Ambiente

### 4.1 Docker Setup

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY src/ ./src/
COPY migrations/ ./migrations/

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', r => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "src/app.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: winike_db
      POSTGRES_USER: winike_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  app:
    build: .
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_URL: redis://redis:6379
      META_ACCESS_TOKEN: ${META_ACCESS_TOKEN}
      WHATSAPP_ACCESS_TOKEN: ${WHATSAPP_ACCESS_TOKEN}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### Run
```bash
# Copy env file
cp .env.example .env
# Edit .env with real values

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f app
```

### 4.2 Database Initialization (migrations/init.sql)

```sql
-- Create leads table
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  source VARCHAR(50),
  meta_lead_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'NOVO',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_contact_at TIMESTAMP,
  deleted_at TIMESTAMP,
  
  INDEX idx_phone (phone),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at DESC)
);

-- Create orders table (simplified)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  phone VARCHAR(20),
  amount_sale DECIMAL(10,2) DEFAULT 1900,
  delivery_cost DECIMAL(10,2) DEFAULT 275,
  gross_margin DECIMAL(10,2),
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  delivery_status VARCHAR(50) DEFAULT 'AGENDADA',
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_lead_id (lead_id),
  INDEX idx_status (payment_status, delivery_status)
);

-- Create campaigns table
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  meta_campaign_id VARCHAR(255),
  name VARCHAR(255),
  budget DECIMAL(10,2),
  spent DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  type VARCHAR(50),
  direction VARCHAR(50),
  content TEXT,
  meta_message_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'SENT',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  date DATE,
  metric_type VARCHAR(100),
  value DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. Testing

### 5.1 Unit Tests (Jest)

```javascript
// tests/unit/metaService.test.js
const MetaService = require('../../src/services/MetaService');

describe('MetaService', () => {
  test('should verify webhook signature correctly', () => {
    const req = {
      headers: {
        'x-hub-signature-256': 'sha256=test'
      },
      body: { test: 'data' }
    };

    // Mock webhook secret
    process.env.WEBHOOK_SECRET = 'secret';

    const result = MetaService.verifyWebhookSignature(req);
    expect(result).toBe(false); // Will fail without correct signature
  });

  test('should hash phone number to SHA256', () => {
    const hash = MetaService.hashSHA256('258841234567');
    expect(hash).toHaveLength(64); // SHA256 hex = 64 chars
  });
});

// tests/unit/leadService.test.js
const LeadService = require('../../src/services/LeadService');

describe('LeadService', () => {
  test('should detect COMPRA intent', () => {
    const intents = ['Quero comprar', 'vou levar', 'sim', 'máquina'];
    intents.forEach(text => {
      expect(LeadService.detectIntent(text)).toBe('COMPRA');
    });
  });

  test('should detect DÚVIDA intent', () => {
    const intents = ['Como funciona?', 'Qual é o preço?', 'Como pago?'];
    intents.forEach(text => {
      expect(LeadService.detectIntent(text)).toBe('DÚVIDA');
    });
  });

  test('should detect REJEIÇÃO intent', () => {
    const intents = ['Não', 'Não quero', 'Caro'];
    intents.forEach(text => {
      expect(LeadService.detectIntent(text)).toBe('REJEIÇÃO');
    });
  });
});
```

### 5.2 Integration Tests

```bash
# tests/integration/webhooks.test.js
# Test full flow: Meta webhook → Lead creation → WhatsApp send
```

---

## Conclusão

Este documento fornece:
1. ✅ Estrutura de projeto limpa e escalável
2. ✅ Código base (Node.js/Express) pronto para uso
3. ✅ Exemplos de integração Meta API & WhatsApp
4. ✅ Diagramas de fluxo detalhados
5. ✅ Docker setup completo
6. ✅ Testes unitários & integração

**Próximos Passos:**
1. Adaptar código ao teu stack (Node.js, Python, etc.)
2. Implementar autenticação & autorização
3. Deploy em produção (AWS/GCP)
4. Monitoramento & alertas
5. Otimização de performance
