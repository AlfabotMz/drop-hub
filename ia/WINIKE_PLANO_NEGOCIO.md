# WINIKE - Plano de Negócio & Operação
## Resumo Executivo + Roadmap de Implementação

---

## 📊 RESUMO EXECUTIVO

### Visão Geral
**Winike** é uma plataforma integrada de gestão de vendas diretas (D2C) que automatiza o ciclo completo:
- **Aquisição:** Meta Ads (Facebook/Instagram)
- **Conversão:** WhatsApp Business API
- **Fulfillment:** Entrega com rastreamento GPS
- **Análise:** Dashboard em tempo real (CAC, ROI, Profit)

### Objetivo
Alcançar **10,000 MT de lucro mensal** com operação escalável e automatizada.

### Público-Alvo
- **Produto:** Máquina de Pipoca RAF 2.0L (1,900 MT)
- **Mercado:** Moçambique (inicialmente Maputo)
- **Distribuição:** Tráfego pago + conversão WhatsApp + entrega direta

---

## 💰 MODELO FINANCEIRO

### Estrutura de Custos por Venda

| Item | Valor (MT) | % |
|------|-----------|---|
| **Preço ao Cliente** | 1,900 | 100% |
| Custo do Produto | -750 | -39% |
| Custo de Entrega | -275 | -14% |
| **Margem Bruta** | **825** | **43%** |
| Gasto Facebook (CAC) | -167 | -9% |
| **Lucro Operacional** | **658** | **35%** |

### Projeção para 10,000 MT de Lucro/Mês

```
Meta: 10,000 MT lucro mensal
Lucro por venda: 825 MT (sem ads)
Pedidos necessários: 10,000 / 825 = 12.1 ≈ 13 pedidos

Com CAC de 167 MT:
- Gasto total Facebook: 13 × 167 = 2,171 MT
- Lucro final: (13 × 825) - 2,171 = 8,504 MT

Cenário otimista (CAC 150 MT, 15 pedidos):
- Lucro: (15 × 825) - (15 × 150) = 10,125 MT ✅
```

### Métricas Críticas de Viabilidade

| Métrica | Limite | Alerta | Pausa |
|---------|--------|--------|-------|
| **CAC** | ≤150 MT | >150 MT | >200 MT |
| **Taxa Conversão** | 5-10% | 3-5% | <3% |
| **ROI Campanha** | >300% | 200-300% | <200% |
| **Devolução Rate** | <5% | 5-10% | >10% |

---

## 🔄 OPERAÇÃO DIÁRIA

### 1. Morning Checklist (08:00)
- [ ] Sincronizar dados Meta API (leads, spend)
- [ ] Revisar CAC da semana
- [ ] Verificar AlertasOperacionais
- [ ] Confirmar entregas pendentes
- [ ] Resumo WhatsApp: respostas overnight

**KPI a Monitorar:**
```
- Leads gerados ontem: ___
- Conversões: ___
- Gasto: ___ MT
- CAC: ___ MT
- Alertas: ___
```

### 2. Mid-Day (12:00)
- [ ] Responder WhatsApps em espera (30 min máx)
- [ ] Confirmar pagamentos pendentes
- [ ] Coordenar entregas do dia
- [ ] Análise rápida: conversão horária

### 3. End-of-Day (18:00)
- [ ] Atualizar status de entregas
- [ ] Registar fotos de proof-of-delivery
- [ ] Confirmar confirmações de pagamento
- [ ] Reporte diário (email automático)

### 4. Weekly (Sexta-feira 17:00)
- [ ] Revisão de CAC e ROI
- [ ] Análise de campanhas (melhor performer)
- [ ] Recomendações: aumentar/pausar
- [ ] Follow-up de leads abandonados

### 5. Monthly (Última sexta)
- [ ] Análise completa de lucro vs meta
- [ ] Trend analysis: CAC subindo/descendo?
- [ ] Product feedback: devoluções, reclamações
- [ ] Ajustes de budget para próximo mês

---

## 📱 FLUXO OPERACIONAL SIMPLIFICADO

### Fase 1: AQUISIÇÃO (Automático)
```
Facebook Ad Campaign ATIVO
    ↓
Cliente clica → Lead form (nome, phone)
    ↓
Meta Webhook → Winike API
    ↓
Backend: Deduplicação + DB save
    ↓
Async: WhatsApp message enviada
    ↓
Status: ENVIADO_WA
```

**Tempo:** Imediato (<30 seg)  
**Ação Manual:** Nenhuma

### Fase 2: ENGAJAMENTO (1-7 dias)
```
Cliente recebe mensagem WhatsApp
    ↓
[Se clica SIM] → Responde "Quero comprar"
    ↓
Webhook detecta intent: COMPRA
    ↓
Backend envia: Resumo + [Confirmar/Rejeitar]
    ↓
[Se clica SIM] → Ordem criada
    ↓
Status: CONFIRMADO
    ↓
WhatsApp: "Instruções de pagamento"
```

**Tempo:** 1-48h  
**Ação Manual:** Responder dúvidas (se cliente souber)

### Fase 3: CONFIRMAÇÃO DE PAGAMENTO (Manual - MVP)
```
Cliente transfere 1,900 MT para conta Winike
    ↓
Operador recebe notificação (SMS/App)
    ↓
Operador valida em conta bancária
    ↓
Operador confirma: POST /api/orders/{id}/payment-confirmed
    ↓
Status: PAGAMENTO_CONFIRMADO
    ↓
WhatsApp: "Entrega agendada para amanhã"
```

**Tempo:** 5-30 min (manual)  
**Ação Manual:** 1-2 min por pedido

### Fase 4: ENTREGA
```
Operário recebe ordem na app mobile
    ↓
Coordena com cliente: "Chego em 1h"
    ↓
Chega no local
    ↓
Tira foto (cliente + máquina visível)
    ↓
Registra GPS (latitude, longitude)
    ↓
Upload via app: foto + localização
    ↓
Backend valida (ML: confirm product visible)
    ↓
Status: ENTREGUE
    ↓
WhatsApp automático: "Obrigado! 7 dias para devolver"
```

**Tempo:** 30-60 min  
**Ação Manual:** 5 min (upload + foto)

### Fase 5: PÓS-ENTREGA
```
Se cliente contacta em 7 dias (devolução):
    ↓
Operador coordena recolha
    ↓
Marca como DEVOLUÇÃO
    ↓
Reembolso processado
    ↓
Analytics: Contagem como fallado

Se cliente mantém:
    ↓
Status: CONVERSÃO_FINAL
    ↓
Analytics atualizado:
    - Conversão registada em Meta Pixel
    - CAC recalculado
    - ROI atualizado
    - Profit acrescido
```

---

## 🎯 RESPONSABILIDADES POR PAPEL

### Operador Principal (Winike)

**Tarefas Diárias:**
- Monitorar WhatsApps entrantes (2-3x/dia)
- Confirmar pagamentos (quando notificado)
- Coordenar entregas com operários
- Responder FAQ básicas

**Tarefas Semanais:**
- Análise de CAC e ROI
- Recomendações de pausa/escalate
- Follow-up de leads abandonados

**Tarefas Mensais:**
- Relatório final de lucro
- Análise de campanhas

**Ferramentas Necessárias:**
- Dashboard Winike (web/mobile)
- WhatsApp (pessoal + API)
- Conta bancária

---

## 🏗️ ARQUITETURA DO SISTEMA

### Componentes Principais

```
┌─────────────────────────────────────────────────┐
│         FACEBOOK ADS (Meta)                      │
│  ├─ Campanha 1: Economia 24h                   │
│  ├─ Campanha 2: Saúde Familiar                 │
│  └─ Campanha 3: Teste A/B                      │
└────────────────┬────────────────────────────────┘
                 │ Lead webhooks
                 ▼
┌─────────────────────────────────────────────────┐
│    WINIKE BACKEND (Node.js/Python)             │
│  ├─ API REST                                   │
│  ├─ Lead Management                            │
│  ├─ Order Management                           │
│  └─ Analytics Engine                           │
└────┬──────────────────┬────────────┬────────────┘
     │                  │            │
     ▼                  ▼            ▼
┌──────────┐   ┌──────────────┐   ┌──────────┐
│PostgreSQL│   │WhatsApp API  │   │AWS S3    │
│(Dados)   │   │(Mensagens)   │   │(Proofs)  │
└──────────┘   └──────────────┘   └──────────┘
     │                  │            │
     └──────────────────┴────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│    MOBILE APP (iOS/Android)                    │
│  ├─ Dashboard (Operador)                       │
│  ├─ Delivery Form (Proof-of-delivery)          │
│  └─ WhatsApp Manager                           │
└─────────────────────────────────────────────────┘
```

### Stack Recomendado

**Backend:**
- Node.js 18+ + Express.js OU Python + FastAPI
- PostgreSQL (dados), Redis (cache)
- Docker + Kubernetes (escalabilidade)

**Frontend:**
- React (admin dashboard)
- React Native ou Flutter (app mobile)

**Integrações:**
- Meta SDK (Facebook Ads)
- WhatsApp Business API
- AWS S3 (storage)

**DevOps:**
- GitHub Actions (CI/CD)
- AWS/GCP (hosting)
- DataDog/Sentry (monitoring)

---

## 📋 REGRAS DE NEGÓCIO CRÍTICAS

### Validações de Lead

```
1. Phone must be valid Mozambique number
   Format: +258 84|82 XXXXXXX
   
2. Deduplication on phone
   If exists → merge, don't create duplicate
   
3. Lead expires after 30 days (no contact)
   Status: ABANDONADO → archive
   
4. Conversation expires after 7 days
   If no response → send reminder
```

### Validações de Entrega

```
1. Photo must show:
   - Máquina de Pipoca clearly visible
   - Customer present (optional but recommended)
   - Serial number readable
   
2. GPS coordinates must be:
   - Within expected radius (5km from registered address)
   - Latitude: -26 to -23 (Maputo area)
   - Longitude: 31 to 36
   
3. Timestamp must be:
   - Recent (<1 hour old)
   - Between 08:00-18:00 (business hours)
```

### Cálculo de Margens

```
Sale Breakdown:
Price:              1,900 MT (100%)
- Product:          -750 MT (-39%)
- Delivery:         -275 MT (-14%)
= Margin:           +875 MT (+46%)

CAC Impact:
If spend 167 MT per conversion:
- Margin after CAC: 875 - 167 = 708 MT
- Effective margin: 708/1900 = 37%

Monthly Target:
- Need 13 sales to reach 10k:
  (13 × 875) - (13 × 167) = 9,204 MT ≈ 10k

Breakeven:
- Minimum margin to sustain operations: 500 MT/sale
- Maximum CAC: 375 MT (but unsustainable)
```

### Política de Devolução

```
Guarantee: 7-day satisfaction
- Full refund if customer not happy
- Customer initiates within 7 days
- Operational handles pickup
- Product returned → refund processed
- Affects: Conversion rate (negatively)

Alert Threshold:
- If devolução rate > 10% → review product quality
- If devolução rate > 15% → pause campaign
- If devolução rate > 20% → critical issue
```

---

## 🚀 ROADMAP DE IMPLEMENTAÇÃO

### FASE 1: MVP (4 Semanas)

**Sprint 1 (Semana 1-2):**
- [ ] Setup servidor (AWS/GCP)
- [ ] PostgreSQL schema
- [ ] API básica (leads, orders, campaigns)
- [ ] Meta API integration (webhook de leads)
- [ ] WhatsApp template messages
- [ ] JWT authentication

**Sprint 2 (Semana 3-4):**
- [ ] Mobile app (React Native MVP)
- [ ] Order management API
- [ ] Delivery proof endpoint (photo + GPS)
- [ ] Analytics dashboard básico
- [ ] Deployment em produção

**Deliverables:**
- ✅ Backend API 100% funcional
- ✅ Mobile app com checklist de operações
- ✅ Dashboard com métricas básicas
- ✅ Integração Meta API ✓ WhatsApp ✓

**Timeline:** 4 semanas (pode ser paralelo com vendas manuais)

---

### FASE 2: Automação Avançada (4 Semanas)

**Features:**
- [ ] NLP para detecção de intent (COMPRA, DÚVIDA, REJEIÇÃO)
- [ ] Auto-response FAQ
- [ ] Follow-up sequences (lead não responde)
- [ ] Lead scoring (priorização)
- [ ] Alertas automáticos (CAC > 200)
- [ ] Export relatórios (CSV, PDF)

**Impacto:**
- Reduz tempo operador em 60%
- Melhora taxa de conversão em ~15%

**Timeline:** 4 semanas (paralelo com FASE 1)

---

### FASE 3: Payment Gateway (2 Semanas)

**Features:**
- [ ] M-Pesa integration
- [ ] Emola integration (fallback)
- [ ] Auto-confirmation of payment
- [ ] SMS notification (payment received)

**Impacto:**
- Elimina confirmação manual de pagamento
- Reduz tempo order-to-delivery de 24h para 2h

**Timeline:** 2 semanas (após FASE 1)

---

### FASE 4: AI & Scaling (Ongoing)

**Features:**
- [ ] Chatbot IA (responde FAQ sem human)
- [ ] Predictive analytics (forecast profit)
- [ ] A/B testing framework
- [ ] Multi-location support
- [ ] Multi-product catalog

**Timeline:** Contínuo (roadmap 3-6 meses)

---

## 💡 REGRAS OPERACIONAIS ESSENCIAIS

### 1. Nunca pausar campanha sem dados
```
- Mínimo 48h de dados antes de decisão
- Mínimo 20 leads antes de calcular CAC
- Mínimo 5 conversões antes de avaliar ROAS
```

### 2. Alertas automáticos = ação imediata
```
Se CAC > 200 MT:
  → Pause campaign
  → Analyze audience
  → Test new creative
  → Resume com novo config

Se conversion rate < 2%:
  → Pause campaign
  → Improve messaging/offer
  → Resume com teste A/B
```

### 3. Validar entrega ANTES de contar conversão
```
Ordem criada ≠ Conversão
Pagamento confirmado ≠ Conversão
Entregue com foto + GPS = Conversão FINAL
```

### 4. Follow-up systematic
```
Dia 1: Boas-vindas (automático)
Dia 2: "Ainda tem dúvidas?"
Dia 4: "Oferta especial por 48h"
Dia 7: "Última chance"
Dia 7+: ABANDONADO (archive)
```

### 5. Dinheiro é sagrado
```
- Nunca gastar acima do orçamento mensal
- Sempre ter 10% buffer (contingency)
- Rastrear cada MT gasto em Facebook
- Reconciliar semanalmente: spend vs DB
```

---

## 🎯 KPIs de Acompanhamento

### Dashboard Principal (Ver Diariamente)

```
┌──────────────────────────────────────────┐
│         WINIKE DAILY DASHBOARD           │
├──────────────────────────────────────────┤
│ Lucro Mês Atual:        0 MT / 10,000 MT │
│ Progresso:              [████░░░░] 0%    │
├──────────────────────────────────────────┤
│ Leads (7 dias):         0                │
│ Conversões (7 dias):    0                │
│ Taxa Conversão:         0%               │
├──────────────────────────────────────────┤
│ Gasto Facebook (7d):    0 MT             │
│ CAC:                    - MT             │
│ ROI:                    - %              │
├──────────────────────────────────────────┤
│ ALERTAS:                                 │
│ ⚠️  CAC normal (150 MT)                  │
│ ✅ Taxa conversão ok (5%)                │
└──────────────────────────────────────────┘
```

### Métricas Semanais

| Métrica | Semana 1 | Semana 2 | Semana 3 | Semana 4 | Meta |
|---------|----------|----------|----------|----------|------|
| Leads | 20 | 25 | 30 | 35 | 50+ |
| Conversões | 1 | 2 | 3 | 4 | 5-10 |
| Taxa % | 5% | 8% | 10% | 11% | 5-10% |
| Gasto | 500 | 500 | 500 | 500 | 1,250 |
| CAC | 500 | 250 | 167 | 125 | <150 |
| Lucro Sem Ads | 825 | 1,650 | 2,475 | 3,300 | 4,125 |
| Lucro Final | 325 | 1,150 | 1,975 | 2,800 | 2,875 |

---

## ✅ Checklist de Lançamento

### Pre-Launch (1 semana antes)

- [ ] Servidor AWS/GCP online e testado
- [ ] Database PostgreSQL setup + backups
- [ ] API endpoints 100% testada
- [ ] Meta webhook configurado e testado
- [ ] WhatsApp Business account aprovada
- [ ] Mobile app build final
- [ ] Equipa treinada em operações

### Day 1

- [ ] Validar: Lead chega via Meta → Sistema → WhatsApp
- [ ] Validar: Resposta cliente → Detecção → Ação
- [ ] Validar: Ordem criada → Entrega → GPS proof
- [ ] Validar: Lucro atualizado em tempo real

### First Week

- [ ] Mínimo 20 leads
- [ ] Mínimo 2-3 conversões
- [ ] Validar CAC (deve ser >150 MT no início)
- [ ] Revisar feedback operacional
- [ ] Ajustes necessários

---

## 📞 Contactos & Escalation

### Se Campanha Falhar (CAC > 200 ou Conv < 3%)

1. **Verificar dados:**
   - Estão todos os leads a ser registados?
   - Estão as conversões a ser contadas corretamente?

2. **Ações:**
   - Testar novo creative (imagem/copy)
   - Testar nova audiência (age, interest)
   - Aumentar budget (às vezes volume ajuda CAC)
   - Pausar se persistir por 48h+

3. **Backup plan:**
   - Tentar SMS (Twilio fallback)
   - Tentar Instagram Stories ads
   - Tentar retargeting (pixel)

### Se Sistema Cair

1. **Fallback Manual:**
   - Operador continua vendendo via WhatsApp direto
   - Registar leads manualmente no spreadsheet
   - Sincronizar com DB quando sistema voltar

2. **Notificação:**
   - Alert automático (SMS + email)
   - SLA: 15 min para começar recovery
   - SLA: 1h para voltar online

---

## 🎓 Training Operacional

### Novo Operador (1-2 dias)

**Dia 1:**
- Demonstração: Lead → Conversão (full flow)
- Hands-on: Responder WhatsApps simulados
- Q&A: Scenarios variados

**Dia 2:**
- Prático: Gerenciar 5-10 leads reais
- Dashboard: Ler metrics e alertas
- Segurança: Guardião do telemóvel/account

**Checklist:**
- [ ] Sabe responder dúvida sobre produto
- [ ] Sabe passo-a-passo de pagamento
- [ ] Sabe coordenar entrega
- [ ] Sabe usar dashboard Winike
- [ ] Sabe reportar issues

---

## 🔐 Segurança & Compliance

### Dados Pessoais
- Nunca armazenar dados de cartão
- Phone numbers: Hash para Meta API
- LGPD: Dados excluídos após 1 ano
- Backup diário (AWS S3)

### Acesso
- 2FA obrigatório para admin
- JWT tokens com expiração (1h)
- Logs de todas as ações

### Conformidade
- Termos & Condições: 7 dias devolução
- Privacy Policy: Transparência de dados
- WhatsApp: Consentimento para SMS/marketing

---

## Conclusão

Este plano define uma operação **automática, escalável e rentável** para alcançar 10k MT/mês.

**Próximos Passos:**
1. ✅ Validar especificação técnica com dev team
2. ✅ Começar FASE 1 (MVP) - 4 semanas
3. ✅ Deploy em produção (soft launch)
4. ✅ Validar com primeiros 20-30 leads
5. ✅ Escalar agressivamente se CAC < 150 MT

**Sucesso Depende De:**
- Automação (zero toques possível)
- Monitoring (métricas diárias)
- Decisão rápida (pausar/escalar)
- Disciplina (orçamento)

**Ganhe 10,000 MT/mês. 🚀**
