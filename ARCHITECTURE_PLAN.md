# Plano de Arquitetura - Pokedex Vue 3 → Nuxt 3

## Análise do Estado Atual

### Problemas Identificados
1. **Node.js versão incompatível**: Atual 18.20.5, necessário 20.19+ ou 22.12+
2. **Vulnerabilidades npm**: 5 low severity (commitizen/inquirer/tmp)
3. **Performance**: Carrega todos 151 pokémon de uma vez no mount
4. **Background quebrado**: Imagem JFIF de baixa qualidade
5. **UI antiquada**: Design funcional mas desatualizado
6. **Sem cache**: Chamadas API repetidas
7. **Sem filtros avançados**: Apenas listagem básica
8. **Responsividade limitada**: Modal não otimizado para mobile

### Stack Atual
- Vue 3.5.24 + Vite 7.2.2
- Pinia 3.0.4
- Axios 1.13.2
- Stylus para CSS
- vue-i18n para internacionalização

## Nova Arquitetura Proposta

### 1. Migração para Nuxt 3

#### Estrutura de Diretórios
```
pokedex-nuxt/
├── app/
│   ├── components/
│   │   ├── pokemon/
│   │   │   ├── PokemonCard.vue          # Card com gradiente melhorado
│   │   │   ├── PokemonGrid.vue          # Grid com virtual scroll
│   │   │   ├── PokemonModal.vue         # Modal estilo GameBoy Advanced
│   │   │   ├── PokemonStats.vue         # Visualização de stats
│   │   │   └── Pokemon3DViewer.vue      # Visualização 3D (opcional)
│   │   ├── ui/
│   │   │   ├── GameBoyFrame.vue         # Frame estilo GameBoy
│   │   │   ├── PokeballLoader.vue       # Loading animado
│   │   │   ├── GenerationSelector.vue   # Seletor de gerações
│   │   │   ├── FilterPanel.vue          # Painel de filtros
│   │   │   └── FavoriteTeam.vue         # Time favorito (6)
│   │   └── layout/
│   │       ├── Header.vue
│   │       └── Footer.vue
│   ├── composables/
│   │   ├── usePokemon.ts               # Lógica de pokemon
│   │   ├── useCache.ts                 # Sistema de cache
│   │   ├── useFavorites.ts             # Time favorito
│   │   ├── useInfiniteScroll.ts        # Scroll infinito
│   │   └── usePokemonCry.ts            # Audio dos cries
│   ├── stores/
│   │   ├── pokemon.ts                  # Store principal
│   │   ├── filters.ts                  # Filtros e busca
│   │   └── favorites.ts                # Time favorito
│   ├── utils/
│   │   ├── cache/
│   │   │   ├── indexeddb.ts           # IndexedDB wrapper
│   │   │   └── cacheStrategy.ts       # Estratégias de cache
│   │   ├── api/
│   │   │   ├── pokemon.ts             # Endpoints Pokemon
│   │   │   └── generations.ts         # Endpoints Generations
│   │   └── helpers/
│   │       ├── typeGradients.ts       # Gradientes dos tipos
│   │       └── pokemonHelpers.ts      # Helpers gerais
│   ├── assets/
│   │   ├── images/
│   │   │   ├── backgrounds/           # Backgrounds de qualidade
│   │   │   ├── gameboy/              # Assets GameBoy
│   │   │   └── sprites/              # Sprites loading
│   │   ├── audio/
│   │   │   └── cries/                # Cries dos pokemon
│   │   └── models/                   # Modelos 3D (opcional)
│   ├── pages/
│   │   ├── index.vue                 # Home com grid
│   │   └── pokemon/[id].vue          # Página individual
│   └── types/
│       ├── pokemon.ts
│       └── cache.ts
├── server/
│   └── api/
│       └── cache-warmup.ts           # Pre-cache no servidor
├── nuxt.config.ts
├── tailwind.config.ts                # Substituir Stylus
└── package.json
```

### 2. Sistema de Cache Inteligente

#### IndexedDB Schema
```typescript
interface CacheEntry {
  id: string;
  data: any;
  timestamp: number;
  expiresAt: number;
  generation: number;
  type?: string;
}

interface FavoriteTeam {
  id: string;
  name: string;
  pokemon: number[]; // Max 6 IDs
  createdAt: number;
}
```

#### Estratégias de Cache
1. **Stale-While-Revalidate**: Dados de pokémon (cache 24h)
2. **Cache-First**: Sprites e imagens (cache permanente)
3. **Network-First**: Dados dinâmicos (busca, filtros)

### 3. Lazy Loading e Paginação

#### Virtual Scroll
- Renderizar apenas 20-30 cards visíveis
- Usar `@vueuse/core` - `useVirtualList`
- Infinite scroll para carregar mais

#### Carregamento Progressivo
```typescript
// Primeira carga: 20 pokemon
// Scroll: +20 pokemon por vez
// Pre-fetch: próximos 20 em background
```

### 4. UI/UX Melhorada

#### Cards de Pokémon
- Gradiente aprimorado com múltiplos tipos
- Animação hover com elevação 3D
- Badge shiny melhorado
- Sombra dinâmica baseada no tipo
- Particle effects no hover (opcional)

#### Modal GameBoy Advanced Style
```
┌─────────────────────────────┐
│  🔊 CRY   ⭐ FAV   ✕ CLOSE  │
├─────────────────────────────┤
│         #001 BULBASAUR       │
│  ┌─────────────────────┐    │
│  │                     │    │
│  │   [3D/2D VIEWER]   │    │
│  │      ↻ ROTATE       │    │
│  └─────────────────────┘    │
│                              │
│  Type: [GRASS][POISON]       │
│  Height: 0.7m  Weight: 6.9kg │
│                              │
│  ▬▬ STATS ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  │
│  HP:       ████████░░░░ 45   │
│  Attack:   ████████░░░░ 49   │
│  Defense:  ████████░░░░ 49   │
│  ...                         │
│                              │
│  📖 DESCRIPTION              │
│  "A strange seed was..."     │
│                              │
│  🔗 EVOLUTION CHAIN          │
│  [001] → [002] → [003]       │
└─────────────────────────────┘
```

#### Design System
- Paleta inspirada em Game Boy Advanced SP
- Fonte retro: "Press Start 2P" + "VT323"
- Cores vibrantes mas não saturadas
- Animações sutis e performáticas

### 5. Features Novas

#### Seleção de Gerações
```typescript
const GENERATIONS = [
  { id: 1, name: 'Kanto', range: [1, 151] },
  { id: 2, name: 'Johto', range: [152, 251] },
  { id: 3, name: 'Hoenn', range: [252, 386] },
  { id: 4, name: 'Sinnoh', range: [387, 493] },
  { id: 5, name: 'Unova', range: [494, 649] },
  { id: 6, name: 'Kalos', range: [650, 721] },
  { id: 7, name: 'Alola', range: [722, 809] },
  { id: 8, name: 'Galar', range: [810, 905] },
  { id: 9, name: 'Paldea', range: [906, 1025] }
];
```

#### Filtros Avançados
- Nome / Número
- Tipo(s) - multi-select
- Geração
- Altura / Peso (range)
- Stats (range)
- Shiny toggle
- Favoritos

#### Time Favorito
- Máximo 6 pokémon
- Drag & drop para organizar
- Exportar/Importar time
- Compartilhar via URL
- Persistir em IndexedDB

#### Loading Animado
Opções:
1. Pokébola girando com partículas
2. Red andando pixel art style
3. Pikachu correndo

### 6. Visualização 3D (Opcional)

#### Opções de Implementação
1. **Three.js + GLTFLoader**
   - Modelos 3D de terceiros
   - Controles de rotação
   - Iluminação dinâmica

2. **Babylon.js**
   - Performance melhor
   - Mais fácil de usar

3. **Fallback 2D**
   - Se 3D não disponível
   - Animação sprite sheet

### 7. Audio - Pokémon Cries

#### Implementação
```typescript
// Usar PokeAPI cries
const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;

// Cache em IndexedDB como blob
// Controles: play/pause/volume
```

### 8. Responsividade

#### Breakpoints
- Mobile: < 640px (1 coluna)
- Tablet: 640-1024px (2-3 colunas)
- Desktop: > 1024px (4-5 colunas)

#### Modal Mobile
- Full screen em mobile
- Swipe para fechar
- Navegação por swipe (prev/next)

### 9. Performance Optimizations

#### Build
- Code splitting automático (Nuxt)
- Image optimization (nuxt/image)
- Asset compression
- Tree shaking
- Lazy loading de componentes

#### Runtime
- Virtual scrolling
- Debounced search
- Memoização de componentes
- Web Workers para cache
- Service Worker para offline

### 10. Stack Tecnológica Final

```json
{
  "framework": "Nuxt 3.15+",
  "styling": "TailwindCSS + UnoCSS",
  "state": "Pinia",
  "requests": "ofetch (built-in Nuxt)",
  "cache": "IndexedDB (idb library)",
  "3d": "Three.js / Babylon.js",
  "animations": "Motion One / GSAP",
  "audio": "Howler.js",
  "utils": "@vueuse/core"
}
```

## Plano de Implementação Faseado

### Fase 1: Setup e Migração Base
1. ✅ Atualizar Node.js
2. ✅ Resolver vulnerabilidades
3. ✅ Criar projeto Nuxt 3
4. ✅ Migrar componentes base
5. ✅ Configurar Tailwind/UnoCSS

### Fase 2: Core Features
6. ✅ Sistema de cache IndexedDB
7. ✅ Lazy loading + virtual scroll
8. ✅ Seleção de gerações
9. ✅ Filtros avançados

### Fase 3: UI/UX Premium
10. ✅ Cards melhorados
11. ✅ Modal GameBoy style
12. ✅ Background de qualidade
13. ✅ Loading animado
14. ✅ Responsividade completa

### Fase 4: Features Extras
15. ✅ Time favorito
16. ✅ Pokémon cries
17. ✅ Visualização 3D (se viável)
18. ✅ Animações e efeitos

### Fase 5: Polish
19. ✅ Testes
20. ✅ Performance tuning
21. ✅ SEO
22. ✅ Deploy

## Decisões de Arquitetura

### Por que Nuxt 3?
- SSR/SSG out of the box
- Auto-imports
- File-based routing
- Melhor SEO
- Server API routes
- Image optimization
- Melhor DX

### Por que TailwindCSS?
- Mais moderno que Stylus
- Melhor performance
- Ecosistema maior
- JIT compiler
- Dark mode built-in

### Por que IndexedDB?
- Storage ilimitado (vs localStorage 5-10MB)
- Async
- Structured data
- Melhor performance
- Offline-first

## Métricas de Sucesso

### Performance
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse Score > 90

### UX
- Scroll suave (60fps)
- Loading < 500ms após cache
- Animações fluidas

### Funcionalidade
- Cache hit rate > 80%
- Offline capability
- Mobile-friendly (100/100)
