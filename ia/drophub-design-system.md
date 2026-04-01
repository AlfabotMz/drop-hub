# Drop Hub — Design System v1.0

> Visual language baseada em verde — moderna, vibrante e confiável.

---

## 1. Princípios de Design

| Princípio | Descrição |
|-----------|-----------|
| **Clareza** | Interfaces limpas com hierarquia visual clara. O usuário sempre sabe o que fazer. |
| **Velocidade** | Componentes leves, animações curtas (≤ 200ms). A percepção de rapidez é parte do produto. |
| **Confiança** | Verde como cor central transmite segurança, saúde e progresso. |
| **Acessibilidade** | Contraste mínimo AA (4.5:1) em todos os textos sobre fundos. |

---

## 2. Paleta de Cores

### 2.1 Paleta Principal — Verde

| Token | Hex | Uso |
|-------|-----|-----|
| `green-50`  | `#E8F9F1` | Backgrounds suaves, hover states, drop zones |
| `green-100` | `#C2EDD8` | Bordas de cards destacados, fills leves |
| `green-200` | `#86D9AC` | Ícones secundários, badges, separadores |
| `green-400` | `#2EBB74` | ★ **Cor primária** — botões, links, CTAs |
| `green-500` | `#1FA05F` | Hover do botão primário |
| `green-600` | `#16834C` | Estados ativos, focus rings |
| `green-700` | `#0F6238` | Texto sobre fundo claro (verde escuro) |
| `green-800` | `#094428` | Backgrounds escuros (dark cards) |
| `green-900` | `#042B18` | Texto sobre fundos neon/mint |

### 2.2 Cores de Acento

| Token | Hex | Uso |
|-------|-----|-----|
| `neon-mint`  | `#00FFB0` | CTAs premium, badges Pro, destaques especiais |
| `lime`       | `#D4F54A` | Labels "Novo", highlights de novidades |

### 2.3 Neutros

| Token | Hex | Uso |
|-------|-----|-----|
| `foreground`  | `#0A0A0A` | Texto primário |
| `background`  | `#F5F4EF` | Fundo da página (off-white quente) |
| `surface`     | `#E8E6DF` | Cards e superfícies elevadas |
| `muted`       | `#888780` | Texto secundário, placeholders |
| `border`      | `rgba(0,0,0,0.15)` | Bordas padrão (0.5px) |

### 2.4 Semânticas

| Token | Hex | Uso |
|-------|-----|-----|
| `danger`  | `#E24B4A` | Erros, exclusões, alertas críticos |
| `warning` | `#BA7517` | Avisos, limite de armazenamento |
| `success` | `#2EBB74` | Confirmações, uploads concluídos |
| `info`    | `#378ADD` | Informações neutras, links externos |

---

## 3. Tipografia

### 3.1 Fonte

**Sans-serif principal:** Inter, ou sistema (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`)  
**Monospace:** `"JetBrains Mono", "Fira Code", monospace`

### 3.2 Escala Tipográfica

| Nível | Tamanho | Peso | Line-height | Uso |
|-------|---------|------|-------------|-----|
| Display | 48px | 500 | 1.1 | Hero headings, splash screens |
| H1 | 32px | 500 | 1.2 | Títulos de página |
| H2 | 24px | 500 | 1.3 | Seções principais |
| H3 | 20px | 500 | 1.4 | Subtítulos, card headers |
| H4 | 16px | 500 | 1.4 | Labels de formulário, seções menores |
| Body Large | 16px | 400 | 1.6 | Texto corrido principal |
| Body | 14px | 400 | 1.6 | Descrições, parágrafos |
| Small | 13px | 400 | 1.5 | Metadados, anotações |
| Caption | 11px | 500 | 1.4 | Labels uppercase, categorias |
| Mono | 13px | 400 | 1.5 | URLs, caminhos de arquivo, código |

### 3.3 Regras Tipográficas

- Usar **apenas pesos 400 e 500**. Nunca 600, 700 ou acima.
- **Sentence case** sempre — nunca ALL CAPS em títulos corridos.
- Labels de navegação e categorias: uppercase com `letter-spacing: 0.08em`.
- Mínimo de `font-size: 12px` em qualquer interface.

---

## 4. Espaçamento

Sistema baseado em múltiplos de 4px.

| Token | Valor | Uso típico |
|-------|-------|-----------|
| `space-1`  | 4px  | Gaps internos mínimos |
| `space-2`  | 8px  | Padding interno de badges, ícones |
| `space-3`  | 12px | Gap entre elementos inline |
| `space-4`  | 16px | Padding padrão de cards |
| `space-6`  | 24px | Separação entre seções internas |
| `space-8`  | 32px | Margens de seção |
| `space-12` | 48px | Espaçamento entre blocos maiores |
| `space-16` | 64px | Seções de página |

---

## 5. Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-xs` | 2px | Bordas discretas, chips pequenos |
| `radius-sm` | 6px | Botões pequenos, badges, inputs |
| `radius-md` | 10px | Botões padrão, cards menores |
| `radius-lg` | 16px | Cards, modais, dropdowns |
| `radius-xl` | 24px | Containers hero, painéis destacados |
| `radius-pill` | 999px | Badges de status, avatares, tags |

---

## 6. Sombras & Bordas

```css
/* Bordas */
--border-default: 0.5px solid rgba(0, 0, 0, 0.15);
--border-medium:  0.5px solid rgba(0, 0, 0, 0.30);
--border-strong:  0.5px solid rgba(0, 0, 0, 0.40);
--border-accent:  0.5px solid #86D9AC;

/* Sombras */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.10);

/* Focus ring */
--focus-ring: 0 0 0 3px rgba(46, 187, 116, 0.25);
```

> Regra: bordas sempre `0.5px`. Sombras apenas em cards flutuantes, modais e dropdowns. Zero gradientes decorativos.

---

## 7. Componentes

### 7.1 Botões

#### Variantes

| Variante | Background | Texto | Border | Uso |
|----------|-----------|-------|--------|-----|
| Primary | `#2EBB74` | `#fff` | — | Ação principal de cada tela |
| Accent | `#00FFB0` | `#042B18` | — | CTAs de conversão premium |
| Secondary | transparente | foreground | `border-default` | Ações secundárias |
| Ghost | transparente | `#2EBB74` | — | Ações terciárias, navegação |
| Danger | `#E24B4A` | `#fff` | — | Exclusão, ações irreversíveis |

#### Tamanhos

| Tamanho | Padding | Font | Radius |
|---------|---------|------|--------|
| sm | 5px 12px | 12px | 6px |
| md (padrão) | 8px 16px | 13px | 8px |
| lg | 12px 24px | 15px | 10px |

#### CSS Base

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s, transform 0.1s;
}

.btn:active { transform: scale(0.98); }
.btn:focus-visible { box-shadow: var(--focus-ring); outline: none; }

.btn-primary   { background: #2EBB74; color: #fff; }
.btn-primary:hover { background: #16834C; }

.btn-accent    { background: #00FFB0; color: #042B18; }
.btn-secondary { background: transparent; border: 0.5px solid rgba(0,0,0,0.30); }
.btn-ghost     { background: transparent; color: #2EBB74; }
```

---

### 7.2 Inputs

```css
.input {
  width: 100%;
  padding: 8px 12px;
  border: 0.5px solid rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  background: #fff;
  color: #0a0a0a;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input:focus {
  border-color: #2EBB74;
  box-shadow: 0 0 0 3px rgba(46, 187, 116, 0.20);
}

.input::placeholder {
  color: #888780;
}
```

**Estados:** default → hover (border escurece) → focus (borda verde + ring) → erro (borda vermelha + ring vermelho) → disabled (opacity 0.5, cursor not-allowed).

---

### 7.3 Cards

#### Card Padrão
```css
.card {
  background: #fff;
  border: 0.5px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  padding: 16px;
}
```

#### Card Acento (verde suave)
```css
.card-accent {
  background: #E8F9F1;
  border: 0.5px solid #86D9AC;
  border-radius: 12px;
  padding: 16px;
}
```

#### Card Dark (para planos/destaque)
```css
.card-dark {
  background: #094428;
  border: none;
  border-radius: 12px;
  padding: 16px;
  color: #C2EDD8;
}
```

---

### 7.4 Badges

| Variante | Background | Texto | Borda |
|----------|-----------|-------|-------|
| Primary | `#E8F9F1` | `#0F6238` | `#86D9AC` |
| Success | `#E8F9F1` | `#16834C` | `#86D9AC` |
| Accent | `#00FFB0` | `#042B18` | — |
| Lime / Novo | `#D4F54A` | `#3a4800` | — |
| Dark | `#094428` | `#C2EDD8` | — |
| Neutral | surface | muted | border |

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
}
```

---

### 7.5 Zona de Upload (Drop Zone)

```css
.dropzone {
  border: 1.5px dashed #2EBB74;
  border-radius: 12px;
  background: #E8F9F1;
  padding: 40px 24px;
  text-align: center;
  transition: background 0.15s, border-color 0.15s;
  cursor: pointer;
}

.dropzone:hover,
.dropzone.drag-over {
  background: #C2EDD8;
  border-color: #16834C;
}
```

**Estados:** idle → hover → drag-over (fundo mais escuro + borda intensificada) → uploading (progress bar verde) → success (check verde) → error (borda vermelha).

---

### 7.6 Navegação

```
[Logo Mark] Drop Hub    Uploads · Compartilhar · Planos · Docs    [Entrar] [Começar grátis ↑]
```

- Logo mark: quadrado verde `#2EBB74` com quadrado interno mint `#00FFB0`, `border-radius: 6px`
- Links: `font-size: 13px`, cor muted, hover → `#2EBB74`
- Borda inferior: `0.5px solid rgba(0,0,0,0.10)`

---

### 7.7 Toggles

```css
.toggle-track {
  width: 34px;
  height: 20px;
  border-radius: 10px;
  background: rgba(0,0,0,0.20);
  transition: background 0.2s;
}

.toggle-track.active { background: #2EBB74; }

.toggle-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
}

.toggle-track.active .toggle-thumb {
  transform: translateX(14px);
}
```

---

### 7.8 Progress Bar

```css
.progress-track {
  height: 6px;
  background: #E8F9F1;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2EBB74;
  border-radius: 999px;
  transition: width 0.3s ease;
}

/* Variante crítica (>90% uso) */
.progress-fill.warning { background: #BA7517; }
.progress-fill.danger  { background: #E24B4A; }
```

---

## 8. Iconografia

- Estilo: **outline** (stroke), `stroke-width: 1.5px`, `stroke-linecap: round`, `stroke-linejoin: round`
- Tamanhos: 16px (inline), 20px (padrão), 24px (destaque)
- Cor padrão: `var(--color-text-secondary)` — nunca cor fixa, herdar do contexto
- Biblioteca recomendada: [Lucide Icons](https://lucide.dev)

Ícones-chave do produto:

| Ícone | Nome Lucide | Uso |
|-------|------------|-----|
| ↑ | `upload-cloud` | Botão de upload |
| ↓ | `download` | Download de arquivo |
| 🔗 | `link` | Copiar link |
| 🗑 | `trash-2` | Deletar |
| ✓ | `check-circle` | Sucesso |
| ⚠ | `alert-triangle` | Aviso |
| 🔒 | `lock` | Privado / protegido |
| 👁 | `eye` | Visualizar |
| ⚙ | `settings` | Configurações |

---

## 9. Animações & Transições

| Tipo | Duração | Easing | Uso |
|------|---------|--------|-----|
| Micro (hover, toggle) | 150ms | `ease` | Mudança de cor, opacidade |
| Padrão (aparição de componente) | 200ms | `ease-out` | Dropdowns, tooltips |
| Entrada de modal | 250ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Modais, sheets |
| Progress bar | 300ms | `ease` | Upload progress |
| Page transition | 200ms | `ease-in-out` | Troca de rotas |

```css
/* Variáveis de transição */
--transition-fast:    150ms ease;
--transition-default: 200ms ease-out;
--transition-spring:  250ms cubic-bezier(0.16, 1, 0.3, 1);
```

> Regra: nunca usar `all` em `transition`. Especificar sempre as propriedades (`color`, `background`, `transform`, `opacity`).

---

## 10. Dark Mode

O sistema suporta dark mode via `@media (prefers-color-scheme: dark)` e classe `.dark` no `<html>`.

| Token | Light | Dark |
|-------|-------|------|
| background | `#F5F4EF` | `#0D0D0D` |
| surface | `#E8E6DF` | `#1A1A1A` |
| foreground | `#0A0A0A` | `#F0EFE8` |
| muted | `#888780` | `#636058` |
| border | `rgba(0,0,0,0.15)` | `rgba(255,255,255,0.12)` |
| green-primary | `#2EBB74` | `#2EBB74` (inalterado) |
| card background | `#fff` | `#1A1A1A` |
| card-accent bg | `#E8F9F1` | `rgba(9,68,40,0.25)` |

---

## 11. Grid & Layout

```css
/* Container máximo */
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

/* Grid responsivo */
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }

/* Breakpoints */
/* Mobile:  < 640px  → 1 coluna */
/* Tablet:  640–1024px → 2 colunas */
/* Desktop: > 1024px → 3–4 colunas */
```

---

## 12. Tokens CSS Completos

```css
:root {
  /* Cores verdes */
  --green-50:  #E8F9F1;
  --green-100: #C2EDD8;
  --green-200: #86D9AC;
  --green-400: #2EBB74;
  --green-500: #1FA05F;
  --green-600: #16834C;
  --green-700: #0F6238;
  --green-800: #094428;
  --green-900: #042B18;

  /* Acentos */
  --neon-mint: #00FFB0;
  --lime:      #D4F54A;

  /* Semânticas */
  --danger:  #E24B4A;
  --warning: #BA7517;
  --success: #2EBB74;
  --info:    #378ADD;

  /* Neutros */
  --foreground: #0A0A0A;
  --background: #F5F4EF;
  --surface:    #E8E6DF;
  --muted:      #888780;

  /* Tipografia */
  --font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* Border radius */
  --radius-xs:   2px;
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-pill: 999px;

  /* Sombras */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.10);

  /* Focus */
  --focus-ring: 0 0 0 3px rgba(46, 187, 116, 0.25);

  /* Transições */
  --transition-fast:    150ms ease;
  --transition-default: 200ms ease-out;
  --transition-spring:  250ms cubic-bezier(0.16, 1, 0.3, 1);

  /* Espaçamento */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;
  --space-16: 64px;
}
```

---

## 13. Do's & Don'ts

### ✅ Faça

- Use `green-400` (`#2EBB74`) como cor primária consistente em toda a interface
- Mantenha bordas sempre em `0.5px`
- Use `neon-mint` apenas para CTAs de alto impacto ou elementos premium
- Garanta contraste mínimo 4.5:1 entre texto e fundo
- Aplique `sentence case` em todos os textos de interface
- Use ícones outline com `stroke-width: 1.5`

### ❌ Não faça

- Não use gradientes decorativos nos componentes
- Não misture mais de 2 cores de acento em uma mesma tela
- Não use peso de fonte acima de `500`
- Não coloque texto branco sobre `green-400` sem verificar o contraste
- Não use sombras em botões ou inputs — apenas em elementos flutuantes
- Não escale o logotipo de forma não uniforme

---

*Drop Hub Design System v1.0 — gerado em 2026*
