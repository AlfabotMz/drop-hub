# WINIKE - Quick Start Guide
## Integração Meta API & WhatsApp em 30 Minutos

---

## 🚀 5 Passos Para Começar

### PASSO 1: Setup Meta App (5 minutos)

**1.1 Criar App em developers.facebook.com**

```
1. Ir para: https://developers.facebook.com/apps/create
2. Escolher: "Business"
3. Preencher:
   - App Name: "Winike Ads Manager"
   - App Purpose: "Marketing & Sales"
   - Email: seu@email.com
4. Clique "Create App"
```

**1.2 Pegar Credenciais**

```
App Dashboard → Settings → Basic
- APP_ID: (copiar)
- APP_SECRET: (copiar, nunca partilhar!)
- Access Token: Gerar com:
  Tools → Access Token Generator
  - Escolher "all_business"
  - Copiar token de 60 dias
```

**1.3 Configurar Webhook**

```
Dashboard → Webhooks → Subscribe
URL: https://api.seudominio.com/webhooks/meta
Verify Token: (criar algo aleatório)
Subscribe: 
  ✅ messaging
  ✅ leads
  ✅ page
```

---

### PASSO 2: Setup WhatsApp Business Account (5 minutos)

**2.1 Criar Business Account**

```
1. Ir para: https://www.whatsapp.com/business/
2. "Get WhatsApp Business API"
3. Escolher: Cloud Hosted (mais fácil)
4. Ligar a Meta Business Account
5. Verificar número de telemóvel
```

**2.2 Pegar Phone Number ID & Token**

```
Meta Business Suite → WhatsApp
- Phone Number ID: (copiar)
- Access Token: (já tem do Meta App)
- Business Account ID: (em settings)

Guardar em .env:
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_ACCESS_TOKEN=xxxx
```

**2.3 Criar Templates de Mensagem**

```
WhatsApp Manager → Message Templates → Create
Criar 3 templates:

1. welcome_offer
───────────────
Olá {{1}},

Descobriste a máquina que vai mudar a tua vida! 🍿

Máquina de Pipoca RAF 2.0L:
✅ Prepara pipoca em 3 minutos
✅ Custo: apenas 5 MT por porção
✅ 2 meses de ROI
✅ 3 anos de garantia

Preço: 1.900 MT

Respondeu "SIM" para mais informações?

2. order_confirmation
──────────────────
Ótimo! Aqui está o resumo:

Máquina de Pipoca RAF 2.0L
Preço: {{1}} MT

Confirma a compra?

3. payment_instructions
──────────────────────
Perfeito! Ordem {{1}}

Envie {{2}} MT para:
💳 Conta: 847123456
🏦 Banco: Standard Bank
📱 M-Pesa: +258847654321

Responda "PAGO" quando enviar.
```

---

### PASSO 3: Criar Projeto Backend (10 minutos)

**3.1 Scaffold Rápido**

```bash
# Criar projeto
mkdir winike-backend
cd winike-backend
npm init -y

# Instalar dependências
npm install \
  express \
  postgres \
  redis \
  axios \
  dotenv \
  express-async-errors \
  cors \
  helmet

# Criar estrutura
mkdir -p src/{config,models,services,routes,controllers}
touch .env .gitignore
```

**3.2 .env (Preencher com teus dados)**

```bash
# Meta
META_APP_ID=1234567890
META_APP_SECRET=abcdef123456
META_ACCESS_TOKEN=EAAx...
META_PIXEL_ID=987654321
WEBHOOK_VERIFY_TOKEN=my_secret_webhook_token
WEBHOOK_SECRET=my_webhook_secret

# WhatsApp
WHATSAPP_BUSINESS_ACCOUNT_ID=123456
WHATSAPP_PHONE_NUMBER_ID=987654
WHATSAPP_ACCESS_TOKEN=EAAx...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=wa_webhook_token

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=winike
DB_USER=winike_user
DB_PASSWORD=secure_password

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development
```

**3.3 app.js (Entry Point)**

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.post('/webhooks/meta/verify', (req, res) => {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (token === process.env.WEBHOOK_VERIFY_TOKEN) {
    res.send(challenge);
  } else {
    res.status(403).send('Invalid token');
  }
});

app.post('/webhooks/meta', (req, res) => {
  console.log('Meta webhook:', JSON.stringify(req.body, null, 2));
  
  // TODO: Processar lead
  // TODO: Enviar WhatsApp
  
  res.status(200).json({ received: true });
});

app.post('/webhooks/whatsapp/verify', (req, res) => {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    res.send(challenge);
  } else {
    res.status(403).send('Invalid token');
  }
});

app.post('/webhooks/whatsapp', (req, res) => {
  console.log('WhatsApp webhook:', JSON.stringify(req.body, null, 2));
  
  // TODO: Processar mensagem entrante
  // TODO: Detectar intent
  // TODO: Responder
  
  res.status(200).json({ received: true });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
```

---

### PASSO 4: Testar Webhooks (5 minutos)

**4.1 Iniciar Servidor Local**

```bash
node src/app.js
# Output: Server running on port 3000
```

**4.2 Usar ngrok para Testar Localmente**

```bash
# Instalar ngrok (https://ngrok.com)
ngrok http 3000
# Output: https://xxxx-xxx-xxx.ngrok.io

# Atualizar em Meta Webhook:
# https://xxxx-xxx-xxx.ngrok.io/webhooks/meta
```

**4.3 Testar com cURL**

```bash
# Test Meta webhook verification
curl "http://localhost:3000/webhooks/meta/verify?hub.mode=subscribe&hub.verify_token=my_secret_webhook_token&hub.challenge=test_challenge"

# Test WhatsApp webhook verification
curl "http://localhost:3000/webhooks/whatsapp/verify?hub.mode=subscribe&hub.verify_token=wa_webhook_token&hub.challenge=test_challenge"

# Enviar mensagem de teste (simular lead)
curl -X POST http://localhost:3000/webhooks/meta \
  -H "Content-Type: application/json" \
  -d '{
    "object": "page",
    "entry": [{
      "messaging": [{
        "sender": {"id": "258841234567"},
        "message": {"text": "Lead test"}
      }]
    }]
  }'
```

---

### PASSO 5: Integração Completa (Código Real)

**5.1 Service Meta (services/MetaService.js)**

```javascript
const axios = require('axios');

class MetaService {
  constructor() {
    this.graphUrl = 'https://graph.instagram.com/v19.0';
    this.accessToken = process.env.META_ACCESS_TOKEN;
  }

  async trackConversion(leadId, phone, amount) {
    const payload = {
      data: [{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
          phone_number: this.hashSHA256(phone),
          external_id: leadId.toString()
        },
        custom_data: {
          currency: 'MZN',
          value: amount,
          content_name: 'Máquina de Pipoca RAF 2.0L'
        }
      }],
      access_token: this.accessToken
    };

    try {
      await axios.post(
        `${this.graphUrl}/${process.env.META_PIXEL_ID}/events`,
        payload
      );
      console.log(`✅ Conversion tracked for ${phone}`);
    } catch (error) {
      console.error(`❌ Conversion tracking failed: ${error.message}`);
    }
  }

  hashSHA256(value) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(value).digest('hex');
  }
}

module.exports = new MetaService();
```

**5.2 Service WhatsApp (services/WhatsAppService.js)**

```javascript
const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.graphUrl = 'https://graph.instagram.com/v19.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  }

  async sendTemplate(phone, templateName, params = {}) {
    const message = {
      messaging_product: 'whatsapp',
      to: phone.replace(/\D/g, ''),
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'pt_PT' }
      }
    };

    if (Object.keys(params).length > 0) {
      message.template.parameters = {
        body: {
          parameters: Object.values(params).map(v => ({
            type: 'text',
            text: v.toString()
          }))
        }
      };
    }

    try {
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
      console.log(`✅ WhatsApp sent to ${phone}`);
      return response.data;
    } catch (error) {
      console.error(`❌ WhatsApp failed: ${error.message}`);
      throw error;
    }
  }

  async sendText(phone, text) {
    return this.sendTemplate(phone, 'text', { text });
  }
}

module.exports = new WhatsAppService();
```

**5.3 Complete Flow (app.js Updated)**

```javascript
const express = require('express');
const MetaService = require('./services/MetaService');
const WhatsAppService = require('./services/WhatsAppService');
require('dotenv').config();

const app = express();
app.use(express.json());

// In-memory storage (replace with DB)
const leads = [];

// ===== META WEBHOOK =====
app.post('/webhooks/meta/verify', (req, res) => {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (token === process.env.WEBHOOK_VERIFY_TOKEN) {
    res.send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

app.post('/webhooks/meta', async (req, res) => {
  const body = req.body;
  
  // Process lead
  if (body.entry && body.entry[0]?.messaging) {
    const messaging = body.entry[0].messaging[0];
    const phone = messaging.sender.id;
    const text = messaging.message?.text || '';

    console.log(`📱 New lead: ${phone} - "${text}"`);

    // Check if exists
    const existingLead = leads.find(l => l.phone === phone);
    if (existingLead) {
      console.log('Already exists, skipping');
      return res.status(200).json({ received: true });
    }

    // Create lead
    const lead = {
      id: Date.now(),
      phone,
      name: text.substring(0, 50),
      source: 'facebook',
      status: 'NOVO',
      createdAt: new Date()
    };

    leads.push(lead);
    console.log(`✅ Lead created: ${lead.id}`);

    // Send welcome message
    try {
      await WhatsAppService.sendTemplate(phone, 'welcome_offer', {
        1: text.substring(0, 50)
      });
    } catch (error) {
      console.error('Failed to send welcome:', error.message);
    }
  }

  res.status(200).json({ received: true });
});

// ===== WHATSAPP WEBHOOK =====
app.post('/webhooks/whatsapp/verify', (req, res) => {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    res.send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

app.post('/webhooks/whatsapp', async (req, res) => {
  const body = req.body;

  // Process message
  if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
    const message = body.entry[0].changes[0].value.messages[0];
    const phone = message.from;
    const text = message.text?.body || '';

    console.log(`💬 Message from ${phone}: "${text}"`);

    // Find lead
    const lead = leads.find(l => l.phone === phone);
    if (!lead) {
      console.log('Lead not found');
      return res.status(200).json({ received: true });
    }

    // Detect intent
    const text_lower = text.toLowerCase();
    let intent = 'DESCONHECIDO';

    if (['quero', 'sim', 'compro', 'máquina', 'levo'].some(k => text_lower.includes(k))) {
      intent = 'COMPRA';
    } else if (['dúvida', 'como', 'qual', 'quanto', 'onde'].some(k => text_lower.includes(k))) {
      intent = 'DÚVIDA';
    } else if (['não', 'caro', 'depois', 'outro'].some(k => text_lower.includes(k))) {
      intent = 'REJEIÇÃO';
    }

    console.log(`🎯 Intent: ${intent}`);

    // Handle intent
    if (intent === 'COMPRA') {
      lead.status = 'CONFIRMADO';
      
      // Send order summary
      await WhatsAppService.sendTemplate(phone, 'order_confirmation', {
        1: '1.900'
      });

      // Track conversion
      await MetaService.trackConversion(lead.id, phone, 1900);

    } else if (intent === 'DÚVIDA') {
      await WhatsAppService.sendText(phone, 
        'Ótima pergunta! A máquina é muito simples de usar. Em 3 minutos tem pipoca pronta!');
        
    } else if (intent === 'REJEIÇÃO') {
      lead.status = 'REJEITADO';
    }
  }

  res.status(200).json({ received: true });
});

// ===== API ENDPOINTS =====
app.get('/api/leads', (req, res) => {
  res.json({ total: leads.length, leads });
});

app.post('/api/orders', (req, res) => {
  const { phone, amount } = req.body;
  const lead = leads.find(l => l.phone === phone);
  
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const order = {
    id: `ORD-${Date.now()}`,
    leadId: lead.id,
    phone,
    amount,
    status: 'PAGAMENTO_PENDENTE',
    createdAt: new Date()
  };

  res.json({ success: true, order });
});

// ===== START =====
app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Server running on port ${process.env.PORT || 3000}`);
  console.log(`📱 Meta webhook: http://localhost:3000/webhooks/meta`);
  console.log(`💬 WhatsApp webhook: http://localhost:3000/webhooks/whatsapp`);
});
```

---

## 🧪 Teste End-to-End (5 minutos)

### Simulação Completa

```bash
# 1. Terminal 1: Iniciar servidor
node app.js

# 2. Terminal 2: Simular lead do Facebook
curl -X POST http://localhost:3000/webhooks/meta \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "messaging": [{
        "sender": {"id": "258841234567"},
        "message": {"text": "João Silva"}
      }]
    }]
  }'

# 3. Esperado no console:
# 📱 New lead: 258841234567 - "João Silva"
# ✅ Lead created: 1711589400
# ✅ WhatsApp sent to 258841234567
# [Se erro WhatsApp = token inválido, verificar .env]

# 4. Terminal 2: Simular resposta do cliente
curl -X POST http://localhost:3000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "258841234567",
            "text": {"body": "Quero comprar!"}
          }]
        }
      }]
    }]
  }'

# 5. Esperado no console:
# 💬 Message from 258841234567: "Quero comprar!"
# 🎯 Intent: COMPRA
# ✅ WhatsApp sent to 258841234567 (order confirmation)
# ✅ Conversion tracked for 258841234567

# 6. Terminal 2: Ver leads criados
curl http://localhost:3000/api/leads

# Resposta esperada:
# {
#   "total": 1,
#   "leads": [
#     {
#       "id": 1711589400,
#       "phone": "258841234567",
#       "name": "João Silva",
#       "source": "facebook",
#       "status": "CONFIRMADO",
#       "createdAt": "2025-03-27T..."
#     }
#   ]
# }
```

---

## 📋 Checklist de Setup

- [ ] Meta App criado e credenciais copidas
- [ ] WhatsApp Business Account setup
- [ ] 3 templates de mensagem criados
- [ ] Webhook URLs registadas em Meta
- [ ] Backend code testado localmente
- [ ] ngrok rodando (se teste local)
- [ ] .env preenchido com valores reais
- [ ] Teste completo funcionando (lead → WhatsApp → Conversão)
- [ ] Logs verificados (sem erros)
- [ ] Pronto para deploy em produção

---

## 🚨 Troubleshooting

### WhatsApp não envia mensagem?
```
Error: "Invalid access token"
Fix: 
  1. Copiar token correto de WhatsApp (não Meta!)
  2. Verificar se token tem expiração
  3. Regenerar: Meta Business Suite → Settings
```

### Webhook não recebe eventos?
```
Error: "No events received"
Fix:
  1. Verificar URL webhook (usar ngrok)
  2. Verificar verify_token (deve ser igual)
  3. Testar com cURL (manualmente)
  4. Check Meta App logs (Dashboard → Logs)
```

### Lead não criado?
```
Error: "Lead not found in database"
Fix:
  1. Verificar se webhook está recebendo POST
  2. Verificar payload (format correto?)
  3. Check console logs
  4. Testar com curl mock
```

### Conversão não tracked?
```
Error: "Conversion API returned error"
Fix:
  1. Verificar META_PIXEL_ID
  2. Verificar permissões do token (pixels_manage_data)
  3. Verificar hash do phone (deve ser SHA256)
  4. Esperar 24h (Meta leva tempo para processar)
```

---

## 📊 Dashboard Rápido (SQL)

Depois de implementar com PostgreSQL:

```sql
-- Leads por dia
SELECT DATE(created_at), COUNT(*) as leads
FROM leads
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- Conversões por dia
SELECT DATE(created_at), COUNT(*) as conversions
FROM orders
WHERE status = 'ENTREGUE'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at);

-- CAC calculation
SELECT 
  SUM(spent) as total_spend,
  COUNT(DISTINCT lead_id) as conversions,
  ROUND(SUM(spent) / COUNT(DISTINCT lead_id), 0) as cac
FROM (
  SELECT 
    o.lead_id,
    COALESCE((SELECT SUM(spent) FROM campaigns WHERE created_at >= o.created_at LIMIT 1), 0) as spent
  FROM orders o
  WHERE o.status = 'ENTREGUE'
    AND o.created_at >= NOW() - INTERVAL '7 days'
);
```

---

## 🎉 Próximos Passos

1. ✅ Deploy app em AWS/GCP
2. ✅ Setup PostgreSQL (não in-memory)
3. ✅ Implementar autenticação
4. ✅ Criar mobile app
5. ✅ Testar com primeiros 10 leads reais
6. ✅ Escalar se CAC < 150 MT

**Sucesso! Está pronto para 10k/mês.** 🚀
