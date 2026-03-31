# WINIKE - Especificação Técnica Completa
## Sistema Integrado de Gestão de Vendas com Meta API & WhatsApp

**Versão:** 1.0  
**Data:** Março 2026  
**Linguagem:** Português  
**Status:** Pronto para Desenvolvimento  

---

## 📋 ÍNDICE

1. [Visão Geral do Produto](#visão-geral)
2. [Regras de Negócio](#regras-de-negócio)
3. [Arquitetura do Sistema](#arquitetura)
4. [Integração Meta API (Facebook Ads)](#meta-api)
5. [Integração WhatsApp API](#whatsapp-api)
6. [Modelo de Dados](#modelo-dados)
7. [Fluxos de Negócio](#fluxos-negócio)
8. [Endpoints da API](#endpoints-api)
9. [Webhooks & Event Handling](#webhooks)
10. [Stack Tecnológico Recomendado](#stack)
11. [Segurança & Compliance](#segurança)
12. [Roadmap de Desenvolvimento](#roadmap)

---

## 1. Visão Geral do Produto {#visão-geral}

### Descrição
**Winike** é uma plataforma de gestão de vendas diretas (B2C) focada em Moçambique, especializada na venda da **Máquina de Pipoca Instantânea (RAF 2.0L)**.

A plataforma integra:
- **Meta APIs** para rastreamento de campanhas e leads do Facebook/Instagram
- **WhatsApp Business API** para automação de vendas e comunicação com clientes
- **Dashboard Analytics** em tempo real (lucro, CAC, taxa de conversão, ROI)
- **Sistema de Entrega** com controlo de custos e margens
- **CRM Simplificado** focado em conversão rápida

### Objetivo Primário
Alcançar **10,000 MT de lucro mensal** com um sistema operacional escalável via:
- Aquisição de leads pagos (Facebook/Instagram)
- Conversão via WhatsApp
- Entrega com margem controlada
- Otimização contínua de CAC

### Público-Alvo
- **Usuário final:** Pré-qualificado (tráfego pago)
- **Usuário operacional (Winike):** Gestão de pedidos, análise de dados
- **Integração:** Meta API (ads manager), WhatsApp Business (automação)

---

## 2. Regras de Negócio {#regras-de-negócio}

### 2.1 Precificação e Margens

| Item | Valor (MT) | Nota |
|------|-----------|------|
| **Preço Venda** | 1,900 | Ao cliente final |
| **Custo de Aquisição** | 750 | Máquina + packaging |
| **Custo de Entrega** | 200–350 | Varia por zona; média 275 MT |
| **Margem Bruta** | 825 | 1,900 - 750 - 275 |
| **% Margem** | 43% | (825 / 1,900) |

### 2.2 Métricas Críticas

#### CAC (Custo por Aquisição)
```
CAC = Gasto Facebook / Número de Conversões
Meta: ≤ 150 MT
Limite Máximo: 200 MT (operação deixa de ser viável)
```

#### Taxa de Conversão
```
Taxa = Conversões / Leads Facebook
Meta: 5-10%
Mínimo aceitável: 3%
```

#### ROI da Campanha Facebook
```
ROI = (Lucro Total - Gastos Ads) / Gastos Ads × 100
Meta: > 300% (mínimo)
Viável: > 200%
```

#### Lucro Mensal
```
Lucro = (Conversões × Margem Bruta) - Gastos Facebook
Meta: ≥ 10,000 MT
Mínimo de Conversões Necessárias: 10,000 / 825 = 13 pedidos
```

#### Payback Period (ROI Cliente)
```
Payback = Preço Venda / Lucro Mensal Potencial do Cliente
Esperado: 2 meses (cliente recupera investimento)
Argumento Venda: "Máquina paga a si mesma em 2 meses"
```

### 2.3 Operação e Fulfillment

#### Ciclo de Venda
1. **Lead Gerado** (Facebook) — gravado automaticamente via Meta API
2. **Lead Entra em WhatsApp** — enviado automaticamente via sequência
3. **Confirmação de Compra** — cliente confirms via WhatsApp
4. **Pagamento** — transferência M-Pesa ou dinheiro (modelo futuro)
5. **Entrega Agendada** — coordenação de logística
6. **Follow-up Pós-Entrega** — garantia e satisfação

#### Confirmação de Entrega
- **Obrigatório:** GPS + foto de entrega
- **Sistema:** Valida se lead foi convertido e entregue
- **Impacto:** Define conversão definitiva para métricas

#### Cancelamento e Devolução
- **Política:** 7 dias de satisfação garantida
- **Reembolso:** 100% do preço se cliente não satisfeito
- **Retorno de Produto:** Cliente ou Winike coordena recolha
- **Métrica:** Rastreia devolução rate (alerta se > 10%)

### 2.4 Controlo de Orçamento

#### Alocação Mensal
- **Orçamento Máximo Facebook:** 5,000 MT (exemplo)
- **Limite Diário:** 5,000 / 30 = ~167 MT
- **Distribuição:** Permite split entre múltiplas campanhas

#### Pausa Automática
- **Gatilho 1:** CAC > 200 MT → alerta, sugestão de pausa
- **Gatilho 2:** Taxa conversão < 2% → alerta, sugestão de teste A/B
- **Gatilho 3:** Orçamento mensal atingido → pausa automática

#### Recomendações
- Se CAC a subir: testar novo creative/audiência
- Se conversão a cair: aumentar budget em anúncios que performam
- Se margem pressionada: revisar custos de entrega

### 2.5 Regras de Dados

#### Atribuição de Lead
- **Atribução:** Last-click (último anúncio visto antes de converso)
- **Janela:** 7 dias (lead válido por 7 dias após click)
- **Fonte:** Facebook Pixel via Meta Conversions API

#### Deduplicação
- **Telemóvel:** Lead duplicado (mesmo número) = contagem única
- **WhatsApp:** Uma conversa = um lead
- **Política:** Primeiro lead + conversão = válido; duplicados ignorados

#### Limpeza de Dados
- Leads sem contacto por 30 dias → arquivado
- Contactos duplicados → merge automático
- Dados excluídos após 1 ano (LGPD)

### 2.6 Gestão de Estado do Lead

```
Lead Status Transitions:
┌─────────────┐
│   NOVO      │ (Criado via Meta API)
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  ENVIADO_WA      │ (Mensagem inicial enviada)
└──────┬───────────┘
       │
       ├─► (Sem resposta por 7 dias) ──► ABANDONADO
       │
       ▼
┌──────────────────┐
│  EM_CONVERSA     │ (Cliente respondeu)
└──────┬───────────┘
       │
       ├─► (Rejeita) ──────────────────► REJEITADO
       │
       ├─► (Solicita informações) ──► ESPERANDO_INFO
       │
       ▼
┌──────────────────┐
│  CONFIRMADO      │ (Cliente confirma compra)
└──────┬───────────┘
       │
       ├─► (Após 3 dias sem pagto) ──► ABANDONADO_COMPRA
       │
       ▼
┌──────────────────┐
│  PAGAMENTO_PENDENTE │ (Espera confirmação de pagamento)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  PAGO            │ (Pagamento confirmado)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  ENTREGA_AGENDADA   │ (Logística coordenada)
└──────┬───────────┘
       │
       ├─► (Cliente não disponível) ──► ENTREGA_FALHOU
       │
       ▼
┌──────────────────┐
│  ENTREGUE        │ (Foto + GPS confirmada)
└──────┬───────────┘
       │
       ├─► (Cliente rejeita) ────────► DEVOLUÇÃO
       │
       ▼
┌──────────────────┐
│  CONVERSÃO_FINAL │ (Métricas finalizadas)
└──────────────────┘
```

---

## 3. Arquitetura do Sistema {#arquitetura}

### 3.1 Componentes Principais

```
┌──────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Mobile App (iOS/Android)  │  Web Dashboard (React/Vue)   │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│              CAMADA DE APLICAÇÃO (APIs)                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  REST API (Node.js/Express ou Django)                    │ │
│  │  - /leads (GET, POST, PATCH)                             │ │
│  │  - /campaigns (GET, POST)                                │ │
│  │  - /conversions (POST)                                   │ │
│  │  - /analytics (GET)                                      │ │
│  │  - /whatsapp/messages (POST)                             │ │
│  │  - /meta/webhooks (POST)                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│              CAMADA DE INTEGRAÇÃO                            │
│  ┌────────────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  Meta API Client   │  │ WhatsApp API │  │ SMS Gateway │  │
│  │  (Ads Manager)     │  │  (Business)  │  │             │  │
│  └────────────────────┘  └──────────────┘  └─────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│              CAMADA DE DADOS                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL (Dados Transacionais)                         │ │
│  │  ├─ leads (lead_id, phone, status, source, created_at)  │ │
│  │  ├─ conversions (id, lead_id, amount, delivery_cost)     │ │
│  │  ├─ campaigns (id, name, budget, spent, leads_count)     │ │
│  │  ├─ orders (id, lead_id, payment_status, delivery_date)  │ │
│  │  └─ analytics (id, date, metric, value)                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Redis (Cache & Sessions)                                │ │
│  │  ├─ lead:${phone} (cache de leads por telemóvel)        │ │
│  │  ├─ campaign:${id}:metrics (métricas em tempo real)      │ │
│  │  └─ user:${id}:session (sessões autenticadas)            │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Blob Storage (AWS S3 / Firebase Storage)                │ │
│  │  ├─ /delivery-proofs/${order_id}/photo.jpg               │ │
│  │  ├─ /reports/${month}/analytics.csv                      │ │
│  │  └─ /backups/daily_${date}.sql                           │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Fluxo de Dados

#### 1. Novo Lead (via Meta Ads)
```
Facebook Ad Click
    ↓
Meta Pixel fires "PageView"
    ↓
Conversions API (Server-side)
    ↓
Webhook POST /meta/webhooks
    ↓
Winike Backend
    ├─ Parse lead data
    ├─ Deduplicação (check phone)
    ├─ Save to PostgreSQL
    ├─ Cache in Redis
    └─ Trigger: Enviar mensagem WhatsApp
        ↓
        WhatsApp API
        └─ Send automático + template message
```

#### 2. Conversão (Cliente Confirma Compra)
```
Cliente responde "Quero comprar" via WhatsApp
    ↓
Webhook /whatsapp/message (incoming message)
    ↓
NLP/Keyword detection
    ├─ Detecta intents: COMPRA, DÚVIDA, REJEIÇÃO
    └─ Atualiza lead status
        ↓
        PostgreSQL (status = CONFIRMADO)
        ├─ Notifica operações (entrega)
        ├─ Atualiza analytics em tempo real
        └─ Envia confirmação ao cliente (WhatsApp)
```

#### 3. Rastreamento de Entrega
```
Operário fotografa entrega
    ↓
POST /orders/{order_id}/delivery-proof
    ├─ Photo (upload S3)
    ├─ GPS coordinates
    └─ Timestamp
        ↓
        Backend valida
        ├─ Se válida: mark as ENTREGUE
        ├─ Atualiza conversão
        └─ Envia template "Obrigado pela compra"
        ↓
        Analytics atualizado
        └─ CAC, ROI, Profit recalculados
```

### 3.3 Escalabilidade

#### Load Balancing
- **Frontend:** CDN (Cloudflare/AWS CloudFront)
- **Backend:** Kubernetes (auto-scaling baseado em CPU/Memória)
- **Database:** Read replicas para analytics

#### Caching Strategy
```
Level 1 (Client): Browser cache (assets estáticos, 1 semana)
Level 2 (Redis): Leads, campaigns, metrics (5 minutos)
Level 3 (PostgreSQL): Fonte de verdade
```

#### Batch Processing
- **Meta API Data Sync:** 1x por dia (job nocturno)
- **Analytics Recalculation:** Horária
- **Report Generation:** Diária (email)

---

## 4. Integração Meta API (Facebook Ads) {#meta-api}

### 4.1 Autenticação

#### Setup Inicial
1. **App Facebook:** Criar em developers.facebook.com
2. **Business Account:** Ligar contas de anúncio
3. **Access Token:** Gerar com permissões:
   - `ads_read`, `ads_management`
   - `leads_retrieval`
   - `read_insights`

#### Refresh Token (recomendado)
```
POST https://graph.facebook.com/v19.0/oauth/access_token
{
  "grant_type": "fb_exchange_token",
  "client_id": "YOUR_APP_ID",
  "client_secret": "YOUR_APP_SECRET",
  "fb_exchange_token": "OLD_SHORT_LIVED_TOKEN"
}
```

### 4.2 Sincronização de Leads (Lead Form)

#### Option A: Lead Webhook (Recomendado)
Facebook envia leads em tempo real quando cliente submete form.

**Configuração:**
```
1. Em App Dashboard → Webhooks
2. Subscribe a "lead" events
3. URL Callback: https://api.winike.com/meta/webhooks/leads
4. Verificar token: HTTP header "X-Hub-Signature-256"
```

**Payload Recebido:**
```json
{
  "object": "page",
  "entry": [{
    "id": "PAGE_ID",
    "time": 1234567890,
    "messaging": [{
      "sender": {"id": "USER_ID"},
      "recipient": {"id": "PAGE_ID"},
      "timestamp": 1234567890,
      "message": {
        "mid": "MESSAGE_ID",
        "text": "Olá, gostava de saber mais"
      }
    }]
  }]
}
```

**Handler Backend (Node.js/Express):**
```javascript
POST /meta/webhooks/leads
├─ Validate signature (HMAC-SHA256)
├─ Extract phone from message or lead form
├─ Deduplication (check if phone exists)
├─ Create/Update lead
│  └─ status: "NOVO"
│  └─ source: "facebook"
│  └─ created_at: now()
├─ Cache in Redis
└─ Trigger async task:
   └─ sendWhatsAppMessage(phone, templateMessage)
```

#### Option B: Lead Form API (Polling)
Se webhook não disponível, sincronizar via polling.

```javascript
// Scheduled job: Every 5 minutes
async function syncLeadForm() {
  const leads = await meta.getLeadFormSubmissions(
    adAccountId,
    { fields: ['id', 'created_time', 'field_data'] }
  );
  
  for (const lead of leads) {
    // Extract phone from field_data
    const phone = lead.field_data.find(f => f.name === 'phone').value;
    
    // Check if already in DB
    const exists = await Lead.findOne({ phone });
    if (exists) continue;
    
    // Create new lead
    await Lead.create({
      phone,
      source: 'facebook_lead_form',
      meta_lead_id: lead.id,
      status: 'NOVO'
    });
  }
}
```

### 4.3 Rastreamento de Conversões

#### Conversions API (Server-side)

**Evento: Compra Confirmada**
```javascript
POST /conversions/track
{
  "data": [{
    "event_name": "Purchase",
    "event_time": 1234567890,
    "user_data": {
      "phone_number": "258841234567", // hashed em SHA256
      "external_id": "lead_123"       // Winike lead ID
    },
    "custom_data": {
      "currency": "MZN",
      "value": 1900.00,
      "content_name": "Máquina de Pipoca RAF 2.0L",
      "content_type": "product"
    },
    "event_source_url": "https://winike.com/order/123"
  }],
  "access_token": "PIXEL_ACCESS_TOKEN"
}
```

**Backend Handler:**
```javascript
POST /api/conversions/track
├─ Validate lead exists
├─ Extract user_data (phone + lead_id)
├─ Prepare event payload
├─ Call Meta Conversions API
├─ Log response (success/failure)
└─ Trigger analytics update
   └─ Recalculate CAC, ROI, etc.
```

### 4.4 Campaign Performance Insights

#### Dados a Sincronizar Diariamente

```javascript
async function syncCampaignMetrics() {
  const campaigns = await Campaign.find({ active: true });
  
  for (const campaign of campaigns) {
    const insights = await meta.getCampaignInsights(
      campaign.meta_campaign_id,
      {
        fields: [
          'campaign_id',
          'campaign_name',
          'spend',
          'impressions',
          'clicks',
          'cpc',
          'cpm',
          'actions',
          'action_values'
        ],
        time_range: { since: startDate, until: endDate }
      }
    );
    
    // Save to analytics table
    await Analytics.create({
      campaign_id: campaign.id,
      date: today,
      spend: insights.spend,
      clicks: insights.clicks,
      impressions: insights.impressions,
      cpc: insights.cpc,
      cpm: insights.cpm,
      conversions: insights.actions // purchases
    });
  }
}
```

#### Dashboard Metrics (Real-time)

```
GET /api/analytics/dashboard?period=7days
├─ Total Spend: SUM(spend) from last 7 days
├─ Total Leads: COUNT(leads) from Meta API
├─ Conversions: COUNT(status=ENTREGUE) in last 7 days
├─ CAC: Total Spend / Conversions
├─ CTR: Clicks / Impressions
├─ CPC: Spend / Clicks
└─ ROAS: (Conversions × Price) / Spend
```

### 4.5 Tratamento de Erros

```javascript
// Retry logic para Meta API calls
async function callMetaAPI(endpoint, options, retries = 3) {
  try {
    return await meta.request(endpoint, options);
  } catch (error) {
    if (error.code === 'RATE_LIMIT' && retries > 0) {
      await sleep(exponentialBackoff(3 - retries));
      return callMetaAPI(endpoint, options, retries - 1);
    }
    
    if (error.code === 'INVALID_TOKEN') {
      // Refresh token automatically
      await refreshMetaAccessToken();
      return callMetaAPI(endpoint, options, retries - 1);
    }
    
    // Log error and alert
    logger.error(`Meta API Error: ${error.message}`, { endpoint, error });
    sendAlert('Meta API Connection Lost');
    throw error;
  }
}
```

---

## 5. Integração WhatsApp API {#whatsapp-api}

### 5.1 Setup WhatsApp Business API

#### Autenticação
1. **Conta Meta Business**
2. **App WhatsApp:** Criar em developers.facebook.com
3. **Phone Number ID:** Número verificado
4. **Access Token:** Com permissões `whatsapp_business_messaging`

```
Base URL: https://graph.instagram.com/v19.0/PHONE_NUMBER_ID
Headers: {
  "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
```

### 5.2 Fluxo Automático de Mensagens

#### 1. Mensagem de Boas-vindas (Lead Novo)

**Trigger:** Novo lead via Meta Ads

```javascript
async function sendWelcomeMessage(lead) {
  const message = {
    messaging_product: "whatsapp",
    to: lead.phone, // Format: "258841234567"
    type: "template",
    template: {
      name: "welcome_offer",
      language: { code: "pt_PT" },
      parameters: {
        body: {
          parameters: [
            { type: "text", text: lead.name || "Amigo" }
          ]
        }
      }
    }
  };
  
  try {
    const response = await whatsapp.sendMessage(message);
    
    // Log message
    await Message.create({
      lead_id: lead.id,
      type: 'OUTBOUND',
      direction: 'TO_CUSTOMER',
      status: 'SENT',
      meta_message_id: response.messages[0].id,
      template_name: 'welcome_offer',
      sent_at: new Date()
    });
    
    // Update lead status
    await Lead.update(lead.id, { status: 'ENVIADO_WA' });
    
  } catch (error) {
    logger.error(`WhatsApp send failed for ${lead.phone}`, error);
    await Lead.update(lead.id, { status: 'ERRO_WA' });
  }
}
```

**Template (pré-aprovado em Meta):**
```
Olá {{1}},

Descobriste a máquina que vai mudar a tua vida! 🍿

Máquina de Pipoca RAF 2.0L:
✅ Prepara pipoca em 3 minutos
✅ Custo de operação: apenas 5 MT por porção
✅ Cinema cobra 100 MT — tu ganhas!
✅ 2 meses de ROI garantido
✅ 3 anos de garantia

Preço especial: 1.900 MT

Respondeu "SIM" para mais informações?
```

#### 2. Detecção de Intent (Incoming Messages)

**Webhook:** `/whatsapp/webhooks/messages`

```javascript
POST /whatsapp/webhooks/messages
├─ Validate signature
├─ Extract incoming message
└─ Route based on intent:
   ├─ Intent: COMPRA
   │  └─ sendConfirmationFlow(lead)
   ├─ Intent: DÚVIDA
   │  └─ sendFAQResponse(lead, question)
   └─ Intent: REJEIÇÃO
      └─ updateLeadStatus(lead, 'REJEITADO')
```

**Payload Recebido:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "258841234567",
          "phone_number_id": "PHONE_ID"
        },
        "messages": [{
          "from": "258841234567",
          "id": "wamid.MESSAGE_ID",
          "timestamp": "1234567890",
          "type": "text",
          "text": {
            "body": "Quero comprar"
          }
        }]
      }
    }]
  }]
}
```

**Intent Detection (NLP simples):**
```javascript
function detectIntent(text) {
  const lower = text.toLowerCase().trim();
  
  const buyKeywords = [
    'quero comprar', 'vou levar', 'sim', 'compra', 
    'máquina', 'quanto é', 'interesse'
  ];
  
  const questionKeywords = [
    'como funciona', 'dúvida', 'qual', 'onde', 
    'como pago', 'entrega'
  ];
  
  const rejectKeywords = [
    'não', 'não quero', 'caro', 'depois', 'outro dia',
    'não obrigado'
  ];
  
  if (buyKeywords.some(kw => lower.includes(kw))) return 'COMPRA';
  if (questionKeywords.some(kw => lower.includes(kw))) return 'DÚVIDA';
  if (rejectKeywords.some(kw => lower.includes(kw))) return 'REJEIÇÃO';
  return 'DESCONHECIDO';
}
```

#### 3. Fluxo de Confirmação de Compra

**Passo 1: Cliente Responde "Quero Comprar"**
```javascript
async function handleBuyIntent(lead) {
  // Send order summary
  const message = {
    messaging_product: "whatsapp",
    to: lead.phone,
    type: "template",
    template: {
      name: "order_confirmation_offer",
      language: { code: "pt_PT" },
      parameters: {
        body: {
          parameters: [
            { type: "text", text: "1.900" }
          ]
        },
        buttons: [
          {
            type: "reply",
            reply: {
              id: "btn_sim",
              title: "✅ SIM, EU COMPRO"
            }
          },
          {
            type: "reply",
            reply: {
              id: "btn_nao",
              title: "❌ NÃO, OBRIGADO"
            }
          }
        ]
      }
    }
  };
  
  await whatsapp.sendMessage(message);
  await Lead.update(lead.id, { status: 'EM_CONVERSA' });
}
```

**Passo 2: Cliente Confirma com "SIM"**
```javascript
async function handleConfirmation(lead, buttonId) {
  if (buttonId === 'btn_sim') {
    // Create order
    const order = await Order.create({
      lead_id: lead.id,
      phone: lead.phone,
      amount: 1900,
      status: 'PAGAMENTO_PENDENTE',
      created_at: new Date()
    });
    
    // Send payment instructions
    await sendPaymentInstructions(lead, order);
    
    // Update lead
    await Lead.update(lead.id, { 
      status: 'CONFIRMADO',
      order_id: order.id
    });
    
    // Notify operations team
    await notifyOps('New Order', `${lead.phone} - 1.900 MT`);
    
  } else if (buttonId === 'btn_nao') {
    await Lead.update(lead.id, { status: 'REJEITADO' });
  }
}
```

**Passo 3: Enviar Instruções de Pagamento**
```javascript
async function sendPaymentInstructions(lead, order) {
  const message = {
    messaging_product: "whatsapp",
    to: lead.phone,
    type: "template",
    template: {
      name: "payment_instructions",
      language: { code: "pt_PT" },
      parameters: {
        body: {
          parameters: [
            { type: "text", text: order.id.toString() },
            { type: "text", text: "1.900" }
          ]
        },
        buttons: [
          {
            type: "url",
            url: {
              url: `https://winike.com/pay/${order.id}`,
              title: "Pagar com Link"
            }
          }
        ]
      }
    }
  };
  
  await whatsapp.sendMessage(message);
}
```

### 5.3 Webhook para Mensagens Entrantes

#### Verify Token (Handshake)

```javascript
GET /whatsapp/webhooks/messages?hub.mode=subscribe&hub.verify_token=XXX&hub.challenge=YYY
├─ Validate hub.verify_token
└─ Return hub.challenge
```

#### Handler de Mensagens

```javascript
async function handleIncomingMessage(messageData) {
  const { from, type, text, buttons_reply } = messageData;
  
  // Find lead
  let lead = await Lead.findOne({ phone: from });
  if (!lead) {
    lead = await Lead.create({
      phone: from,
      source: 'whatsapp_direct',
      status: 'NOVO'
    });
  }
  
  // Log message
  await Message.create({
    lead_id: lead.id,
    type: 'INBOUND',
    direction: 'FROM_CUSTOMER',
    content: text?.body || buttons_reply?.title,
    received_at: new Date()
  });
  
  // Detect intent
  const intent = detectIntent(text?.body || '');
  
  // Route handler
  switch (intent) {
    case 'COMPRA':
      await handleBuyIntent(lead);
      break;
    case 'DÚVIDA':
      await handleQuestion(lead, text.body);
      break;
    case 'REJEIÇÃO':
      await Lead.update(lead.id, { status: 'REJEITADO' });
      break;
    default:
      await sendFallbackMessage(lead);
  }
}
```

### 5.4 Status de Entrega

**Webhook de Status:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "statuses": [{
          "id": "wamid.MESSAGE_ID",
          "recipient_id": "258841234567",
          "status": "delivered", // sent, delivered, read, failed
          "timestamp": "1234567890"
        }]
      }
    }]
  }]
}
```

**Handler:**
```javascript
async function handleMessageStatus(messageId, status, recipientId) {
  const message = await Message.findOne({ meta_message_id: messageId });
  
  if (!message) return;
  
  // Update message status
  await Message.update(message.id, { 
    status: status.toUpperCase(), // SENT, DELIVERED, READ, FAILED
    status_updated_at: new Date()
  });
  
  // Log for analytics
  logger.info(`Message ${messageId} - ${status}`, { 
    lead_phone: recipientId 
  });
  
  // Alert if failed
  if (status === 'failed') {
    const lead = await Lead.findOne({ phone: recipientId });
    await Lead.update(lead.id, { status: 'ERRO_WA' });
    logger.warn(`WhatsApp delivery failed for ${recipientId}`);
  }
}
```

---

## 6. Modelo de Dados {#modelo-dados}

### 6.1 Schema PostgreSQL

#### Tabela: leads
```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  source VARCHAR(50), -- 'facebook', 'whatsapp_direct', 'sms'
  meta_lead_id VARCHAR(255),
  status VARCHAR(50), -- NOVO, ENVIADO_WA, EM_CONVERSA, CONFIRMADO, REJEITADO, etc
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_contact_at TIMESTAMP,
  deleted_at TIMESTAMP, -- soft delete
  
  INDEX idx_phone (phone),
  INDEX idx_status (status),
  INDEX idx_source (source),
  INDEX idx_created (created_at)
);
```

#### Tabela: orders
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  phone VARCHAR(20),
  amount_sale DECIMAL(10,2), -- 1900
  delivery_cost DECIMAL(10,2), -- 200-350
  gross_margin DECIMAL(10,2), -- 1900 - 750 - delivery
  payment_status VARCHAR(50), -- PENDING, CONFIRMED, FAILED
  payment_method VARCHAR(50), -- MPESA, CASH, BANK
  payment_date TIMESTAMP,
  delivery_status VARCHAR(50), -- AGENDADA, ENTREGUE, DEVOLVIDA
  delivery_date TIMESTAMP,
  delivery_location VARCHAR(255),
  delivery_photo_url VARCHAR(2048), -- S3 URL
  delivery_gps POINT, -- PostGIS: latitude, longitude
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_lead (lead_id),
  INDEX idx_status (payment_status, delivery_status),
  INDEX idx_created (created_at)
);
```

#### Tabela: campaigns
```sql
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  meta_campaign_id VARCHAR(255),
  name VARCHAR(255),
  budget DECIMAL(10,2),
  spent DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50), -- ACTIVE, PAUSED, COMPLETED
  start_date DATE,
  end_date DATE,
  leads_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_name (name),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
);
```

#### Tabela: messages
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  type VARCHAR(50), -- INBOUND, OUTBOUND
  direction VARCHAR(50), -- FROM_CUSTOMER, TO_CUSTOMER
  content TEXT,
  meta_message_id VARCHAR(255),
  template_name VARCHAR(255), -- para outbound
  status VARCHAR(50), -- SENT, DELIVERED, READ, FAILED
  sent_at TIMESTAMP,
  received_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_lead (lead_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_timestamp (created_at)
);
```

#### Tabela: analytics
```sql
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  date DATE,
  metric_type VARCHAR(100), -- CAC, ROI, PROFIT, CONVERSION_RATE
  value DECIMAL(15,2),
  campaign_id INTEGER REFERENCES campaigns(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(date, metric_type, campaign_id),
  INDEX idx_date (date),
  INDEX idx_metric (metric_type)
);
```

### 6.2 Índices Críticos

```sql
-- Queries de dashboard (otimizar leitura)
CREATE INDEX idx_leads_status_created ON leads(status, created_at DESC);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date DESC) WHERE delivery_status = 'ENTREGUE';
CREATE INDEX idx_campaigns_metrics ON campaigns(id, spent, conversions_count);

-- Full-text search (buscar por phone/name)
CREATE INDEX idx_leads_phone_search ON leads USING GIN (phone);
```

---

## 7. Fluxos de Negócio {#fluxos-negócio}

### 7.1 Fluxo Completo: Lead até Conversão

```
FASE 1: AQUISIÇÃO
├─ Cliente clica em anúncio Facebook
├─ Preenchimento de lead form (nome, telefone)
├─ Conversão pixel dispara
└─ Webhook: novo lead criado em Winike
   ├─ Status: NOVO
   ├─ Deduplicação check
   ├─ Armazenar em PostgreSQL + Redis
   └─ Async: Enviar WhatsApp template

FASE 2: ENGAJAMENTO (primeiras 24h)
├─ Cliente recebe mensagem de boas-vindas
├─ Cliente lê (status = READ no WhatsApp)
├─ Cliente pode:
   ├─ Responder com interesse → EM_CONVERSA
   ├─ Responder com dúvida → Enviar FAQ automática
   └─ Não responder → Reminder em 6 horas
└─ Se não responde em 7 dias → ABANDONADO

FASE 3: CONFIRMAÇÃO
├─ Cliente responde "Quero comprar"
├─ Winike envia: Resumo da oferta + botões (SIM/NÃO)
├─ Cliente clica SIM
├─ Status: CONFIRMADO
├─ Criar ordem com order_id
└─ Enviar: Instruções de pagamento

FASE 4: PAGAMENTO
├─ Cliente transfere 1.900 MT para conta Winike
├─ Operador confirma pagamento manualmente (MVP)
├─ Status ordem: PAGAMENTO_CONFIRMADO
└─ Notificar: Agendamento de entrega

FASE 5: ENTREGA
├─ Operário recebe ordem
├─ Coordena com cliente (WhatsApp/Chamada)
├─ Chega no local
├─ Tira foto do cliente com máquina
├─ Registra GPS coordinates
├─ Faz upload via app mobile
└─ Backend:
   ├─ Valida foto (ML: confirm product visible)
   ├─ Valida GPS (está na zona esperada)
   ├─ Status: ENTREGUE
   └─ Update: ordem finalizada

FASE 6: PÓS-ENTREGA
├─ Enviar template: "Obrigado pela compra"
├─ Aviso: Cliente tem 7 dias para devolver
├─ Status lead: CONVERSÃO_FINAL
├─ Analytics:
   ├─ Registar conversão em Meta Pixel
   ├─ Recalcular CAC, ROI, Profit
   └─ Atualizar dashboard em tempo real
└─ Se cliente solicita devolução:
   ├─ 7 dias = reembolso completo
   ├─ Status: DEVOLUÇÃO
   └─ Marcar como fallado (afeta ROI)
```

### 7.2 Fluxo de Follow-up (Leads Não Convertidos)

```
Dia 1: Lead recebe boas-vindas
Dia 2: Sem resposta → Enviar: "Ainda tem dúvidas?"
Dia 4: Sem resposta → Enviar: "Oferta especial por 48h"
Dia 7: Sem resposta → Status: ABANDONADO (arquivar)

Se cliente responde em qualquer ponto:
├─ Classificar como: EM_CONVERSA
├─ Responder à dúvida
└─ Reiniciar fluxo de venda
```

### 7.3 Fluxo de Análise & Otimização

```
DIÁRIA:
├─ Sync Meta API (leads, spend, impressions)
├─ Recalcular CAC, Taxa Conversão, ROI
├─ Alertas:
│  ├─ Se CAC > 200 MT → Notificação
│  ├─ Se conversão < 2% → Alerta
│  └─ Se orçamento > 90% → Warning
└─ Guardar snapshots em analytics table

SEMANAL:
├─ Comparar semana atual vs semana anterior
├─ Identificar campanhas com melhor ROI
├─ Realocar budget para top performers
└─ Email report: leads, conversões, lucro

MENSAL:
├─ Resumo: Total leads, conversões, lucro
├─ ROI per campaign
├─ Análise de devolução rate
├─ Recomendações: pause underperformers
└─ Forecast: projected profit se continuar padrão
```

---

## 8. Endpoints da API {#endpoints-api}

### 8.1 Leads API

#### GET /api/leads
Listar leads com filtros

```javascript
GET /api/leads?status=NOVO&period=7days&limit=50
Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "phone": "258841234567",
      "name": "João",
      "status": "NOVO",
      "source": "facebook",
      "created_at": "2026-03-27T10:30:00Z",
      "order_id": null,
      "last_message_at": "2026-03-27T11:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "pages": 3
  }
}
```

#### POST /api/leads
Criar lead manualmente (backup)

```javascript
POST /api/leads
{
  "phone": "258841234567",
  "name": "João",
  "source": "manual"
}
Response: {
  "success": true,
  "data": { "id": 1, "phone": "258841234567", "status": "NOVO" }
}
```

#### PATCH /api/leads/{id}
Atualizar status do lead

```javascript
PATCH /api/leads/1
{
  "status": "CONFIRMADO",
  "notes": "Cliente confirmou interesse"
}
```

#### GET /api/leads/{id}/history
Ver histórico de mensagens

```javascript
GET /api/leads/1/history
Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "OUTBOUND",
      "content": "Olá João, descobriste a máquina...",
      "status": "DELIVERED",
      "sent_at": "2026-03-27T10:30:00Z"
    },
    {
      "id": 2,
      "type": "INBOUND",
      "content": "Quero comprar",
      "received_at": "2026-03-27T10:35:00Z"
    }
  ]
}
```

### 8.2 Orders API

#### POST /api/orders
Criar ordem (após confirmação)

```javascript
POST /api/orders
{
  "lead_id": 1,
  "amount_sale": 1900,
  "delivery_cost": 275
}
Response: {
  "success": true,
  "data": { 
    "id": 1, 
    "order_id": "ORD-202603-001",
    "status": "PAGAMENTO_PENDENTE" 
  }
}
```

#### POST /api/orders/{id}/delivery-proof
Enviar prova de entrega (foto + GPS)

```javascript
POST /api/orders/1/delivery-proof
{
  "photo_base64": "iVBORw0KGgoAAAANSUhEUgAAADIA...",
  "latitude": -23.8645,
  "longitude": 35.3056,
  "timestamp": 1711589400
}
Response: {
  "success": true,
  "data": { 
    "id": 1,
    "status": "ENTREGUE",
    "delivery_photo_url": "https://s3.amazonaws.com/winike/..."
  }
}
```

#### PATCH /api/orders/{id}/status
Atualizar status manual

```javascript
PATCH /api/orders/1/status
{
  "status": "DEVOLVIDA",
  "reason": "Cliente não satisfeito"
}
```

### 8.3 Campaigns API

#### GET /api/campaigns
Listar campanhas com métricas

```javascript
GET /api/campaigns
Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Economia 24h",
      "budget": 1000,
      "spent": 850,
      "leads_count": 45,
      "conversions_count": 5,
      "cac": 170,
      "roas": 2.24,
      "status": "ACTIVE"
    }
  ]
}
```

#### POST /api/campaigns/sync-meta
Sincronizar dados Meta manualmente

```javascript
POST /api/campaigns/sync-meta
Response: {
  "success": true,
  "data": {
    "campaigns_synced": 3,
    "timestamp": "2026-03-27T12:00:00Z"
  }
}
```

### 8.4 Analytics API

#### GET /api/analytics/dashboard
Dashboard completo

```javascript
GET /api/analytics/dashboard?period=7days
Response: {
  "success": true,
  "data": {
    "summary": {
      "total_leads": 150,
      "conversions": 12,
      "conversion_rate": "8%",
      "total_spend": 2000,
      "cac": 167,
      "gross_profit": 9900,
      "roas": "4.95"
    },
    "daily_breakdown": [
      {
        "date": "2026-03-27",
        "leads": 20,
        "conversions": 2,
        "spend": 400,
        "profit": 1650
      }
    ],
    "alerts": [
      {
        "level": "warning",
        "message": "CAC a subir (167 MT vs 150 MT semana anterior)"
      }
    ]
  }
}
```

#### GET /api/analytics/export?format=csv
Exportar dados completos

```javascript
GET /api/analytics/export?format=csv&period=month
Response: CSV file download
```

### 8.5 WhatsApp Messages API

#### POST /api/whatsapp/send
Enviar mensagem manual

```javascript
POST /api/whatsapp/send
{
  "lead_id": 1,
  "template_name": "payment_reminder",
  "parameters": {
    "order_id": "ORD-202603-001",
    "amount": "1900"
  }
}
Response: {
  "success": true,
  "data": { 
    "message_id": "wamid.ABC123",
    "status": "SENT"
  }
}
```

---

## 9. Webhooks & Event Handling {#webhooks}

### 9.1 Meta API Webhooks

#### Lead Form Submission
```
POST /meta/webhooks/leads
Headers: X-Hub-Signature-256: sha256=xxxxx
Trigger: New lead form submitted
```

#### Lead Status Update
```
POST /meta/webhooks/conversions
Trigger: Conversion pixel fired
Payload: lead_id, user_data, event_value, timestamp
```

### 9.2 WhatsApp Webhooks

#### Incoming Message
```
POST /whatsapp/webhooks/messages
Trigger: Customer sends message
Payload: from, message_id, text, timestamp
Handler: detectIntent(), routeToHandler()
```

#### Message Status
```
POST /whatsapp/webhooks/status
Trigger: Message sent, delivered, read, or failed
Payload: message_id, status, recipient_id, timestamp
```

### 9.3 Internal Events (Async Task Queue)

```javascript
// Using: Bull (Redis-based job queue) ou RabbitMQ

event_bus.emit('lead.created', { lead_id, phone });
// Handler: Send WhatsApp welcome message

event_bus.emit('lead.converted', { lead_id, order_id });
// Handler: 
//   - Track conversion in Meta Pixel
//   - Send order confirmation WhatsApp
//   - Notify operations team

event_bus.emit('order.delivered', { order_id });
// Handler:
//   - Update analytics
//   - Recalculate CAC/ROI
//   - Send thank-you message
//   - Request review
```

---

## 10. Stack Tecnológico Recomendado {#stack}

### Backend
- **Runtime:** Node.js (v18+) ou Python (FastAPI)
- **Framework:** Express.js ou Django
- **Database:** PostgreSQL 13+ (com PostGIS para GPS)
- **Cache:** Redis 7+
- **Job Queue:** Bull (Redis) ou Celery (Python)

### Integrations
- **Meta SDK:** facebook-sdk-js ou facebook-python-sdk
- **WhatsApp SDK:** twilio-python ou whatsapp-api-js
- **SMS (fallback):** Twilio ou local SMS gateway

### Storage
- **Files:** AWS S3 ou Google Cloud Storage (delivery proofs)
- **Backups:** Daily automated snapshots

### Frontend (Mobile App)
- **Framework:** React Native ou Flutter
- **State Management:** Redux ou Provider
- **Local Storage:** SQLite ou Realm (offline-first)

### DevOps
- **Containerization:** Docker
- **Orchestration:** Kubernetes (EKS, GKE, ou AKS)
- **CI/CD:** GitHub Actions ou GitLab CI
- **Monitoring:** DataDog ou New Relic
- **Logging:** ELK Stack ou Cloudwatch

### Testing
- **Unit:** Jest (JS) ou pytest (Python)
- **Integration:** Postman ou pytest
- **Load Testing:** K6 ou JMeter

---

## 11. Segurança & Compliance {#segurança}

### 11.1 Autenticação & Autorização

```javascript
// JWT-based auth
POST /auth/login
{
  "email": "operador@winike.com",
  "password": "XXX"
}
Response: {
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600
}

// All API requests require:
// Header: Authorization: Bearer {access_token}

// Role-based access:
- ADMIN: Full access
- OPERATOR: Read/Write leads, orders, messages
- FINANCE: Read analytics, reports
- SUPPORT: Read leads, write messages
```

### 11.2 Validação de Webhook

```javascript
// Verificar assinatura Meta
function verifyMetaSignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  const body = JSON.stringify(req.body);
  const hash = 'sha256=' + crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  
  return crypto.timingSafeEqual(signature, hash);
}
```

### 11.3 Data Protection

```
- Phone numbers: Hashed em SHA-256 para Meta API
- Payments: Nunca armazenar dados de cartão (third-party gateway)
- Sensitive fields: Encrypted at rest (AES-256)
- GDPR/LGPD: 
  * Dados excluídos após 1 ano (ou on request)
  * Consent tracking para WhatsApp
  * Right to be forgotten endpoint
```

### 11.4 Rate Limiting

```javascript
// Per IP: 100 requests / minute
// Per User: 1000 requests / hour
// Meta API: Respect rate limits (100 reqs/hour during ramp)
// WhatsApp: Respect throughput limits (80 messages/second)
```

---

## 12. Roadmap de Desenvolvimento {#roadmap}

### **FASE 1 (MVP - Semanas 1-4)**
- ✅ Schema PostgreSQL + Redis
- ✅ Auth (JWT)
- ✅ Lead CRUD API
- ✅ WhatsApp webhook + template messages
- ✅ Meta Conversions API integration
- ✅ Basic analytics (CAC, conversion rate)
- ✅ Mobile app (React Native): form inputs, dashboard
- ✅ Deployment (AWS/GCP)

### **FASE 2 (Semanas 5-8)**
- [ ] Lead auto-matching (NLP for intent detection)
- [ ] Order management API + delivery proof
- [ ] Admin dashboard (React)
- [ ] Automated follow-up sequences
- [ ] SMS fallback (Twilio)
- [ ] Batch export (CSV)
- [ ] Analytics drill-down

### **FASE 3 (Semanas 9-12)**
- [ ] Payment gateway integration (M-Pesa/Emola)
- [ ] AI customer support (Chatbot)
- [ ] Predictive analytics (forecast profit)
- [ ] A/B testing framework
- [ ] Lead scoring
- [ ] Team collaboration (notes, tags)
- [ ] Advanced reporting (PDF generation)

### **FASE 4 (Months 4+)**
- [ ] Multi-location support
- [ ] Multi-product catalog
- [ ] Affiliate/referral program
- [ ] Customer self-service portal
- [ ] Marketplace integrations (OLX, Jumia)
- [ ] Advanced ML (churn prediction, LTV optimization)

---

## Apêndice A: Exemplo de Requisição de Teste

### Test Lead Flow (cURL)

```bash
# 1. Create lead
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "258841234567",
    "name": "João",
    "source": "facebook"
  }'

# Response:
# {
#   "success": true,
#   "data": { "id": 1, "status": "NOVO" }
# }

# 2. Send WhatsApp message
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": 1,
    "template_name": "welcome_offer"
  }'

# 3. Create order (after confirmation)
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": 1,
    "amount_sale": 1900,
    "delivery_cost": 275
  }'

# Response:
# {
#   "success": true,
#   "data": { "id": 1, "order_id": "ORD-202603-001", "status": "PAGAMENTO_PENDENTE" }
# }

# 4. Get dashboard metrics
curl -X GET "http://localhost:3000/api/analytics/dashboard?period=7days" \
  -H "Authorization: Bearer TOKEN"
```

---

## Apêndice B: Variáveis de Ambiente (`.env`)

```env
# Server
NODE_ENV=production
PORT=3000
API_URL=https://api.winike.com

# Database
DB_HOST=postgres.example.com
DB_PORT=5432
DB_NAME=winike_db
DB_USER=winike_user
DB_PASSWORD=xxxxx

# Redis
REDIS_URL=redis://localhost:6379

# Meta API
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_ACCESS_TOKEN=your_access_token
META_BUSINESS_ACCOUNT_ID=your_business_account_id
WEBHOOK_VERIFY_TOKEN=your_webhook_token
WEBHOOK_SECRET=your_webhook_secret

# WhatsApp
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_token

# Storage
AWS_S3_BUCKET=winike-delivery-proofs
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=eu-west-1

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=3600

# Monitoring
DATADOG_API_KEY=xxxxx
SENTRY_DSN=xxxxx

# Feature Flags
ENABLE_SMS_FALLBACK=true
ENABLE_PAYMENT_GATEWAY=false
```

---

## Conclusão

Esta especificação define um **sistema escalável, automatizado e focado em dados** para a operação Winike.

**Pontos-chave:**
1. **Lead-to-Cash:** Integração completa Facebook → WhatsApp → Entrega → Análise
2. **Real-time Metrics:** Dashboard sempre atualizado (CAC, ROI, Profit)
3. **Automação:** Minimal touch point (operador valida entrega apenas)
4. **Escalabilidade:** Suporta 100+ leads/dia com zero degradação
5. **Compliance:** LGPD-ready, secure webhooks, data encryption

**Next Step:** Começar FASE 1 (MVP) com foco em:
- PostgreSQL schema solidificado
- Meta API ↔ WhatsApp pipeline
- Mobile app + Admin dashboard MVP
