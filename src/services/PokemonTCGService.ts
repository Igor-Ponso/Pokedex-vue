/**
 * Serviço para buscar imagens de cards oficiais do Pokemon TCG
 * Usa a API pokemontcg.io para obter imagens em alta resolução
 */

export interface TCGCardImage {
  small: string;
  large: string;
}

export interface TCGCard {
  id: string;
  name: string;
  nationalPokedexNumbers?: number[];
  images: TCGCardImage;
  number: string;
  set: {
    id: string;
    name: string;
  };
  rarity?: string;
  supertype: string;
  subtypes?: string[];
}

interface TCGResponse {
  data: TCGCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

const API_BASE = 'https://api.pokemontcg.io/v2';
const API_KEY = import.meta.env.VITE_POKEMON_TCG_API_KEY;

/**
 * Headers para autenticação na API do Pokemon TCG
 */
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  if (API_KEY) {
    headers['X-Api-Key'] = API_KEY;
  }

  return headers;
};

/**
 * Cache de cards por Pokemon ID para evitar chamadas desnecessárias
 * Usa Map em memória + localStorage para persistência
 */
const cardCache = new Map<number, TCGCard | null>();

// Cache key para localStorage
const CACHE_KEY = 'pokemon-tcg-cache';
const CACHE_VERSION = 'v1';
const CACHE_EXPIRY_DAYS = 7; // Cache expira após 7 dias

interface CacheEntry {
  card: TCGCard | null;
  timestamp: number;
  version: string;
}

interface CacheData {
  [key: string]: CacheEntry;
}

/**
 * Carrega cache do localStorage
 */
const loadCacheFromStorage = (): void => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return;

    const cacheData: CacheData = JSON.parse(stored);
    const now = Date.now();
    const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    let validEntries = 0;
    let expiredEntries = 0;

    Object.entries(cacheData).forEach(([key, entry]) => {
      // Verificar versão e expiração
      if (entry.version !== CACHE_VERSION) {
        expiredEntries++;
        return;
      }

      if (now - entry.timestamp > expiryTime) {
        expiredEntries++;
        return;
      }

      // Adicionar ao cache em memória
      const pokemonId = parseInt(key);
      cardCache.set(pokemonId, entry.card);
      validEntries++;
    });

    console.log(`📦 Cache TCG carregado: ${validEntries} válidos, ${expiredEntries} expirados`);
  } catch (error) {
    console.error('Erro ao carregar cache TCG:', error);
  }
};

/**
 * Salva cache no localStorage
 */
const saveCacheToStorage = (): void => {
  try {
    const cacheData: CacheData = {};
    const now = Date.now();

    cardCache.forEach((card, pokemonId) => {
      cacheData[pokemonId] = {
        card,
        timestamp: now,
        version: CACHE_VERSION
      };
    });

    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log(`💾 Cache TCG salvo: ${cardCache.size} entradas`);
  } catch (error) {
    console.error('Erro ao salvar cache TCG:', error);
  }
};

// Carregar cache ao inicializar
loadCacheFromStorage();

/**
 * Busca um card do TCG para um Pokemon específico pelo número da Pokedex Nacional
 */
export async function fetchTCGCardByPokedexNumber(pokedexNumber: number): Promise<TCGCard | null> {
  // Verifica cache primeiro
  if (cardCache.has(pokedexNumber)) {
    console.log('📦 TCG card from cache:', pokedexNumber);
    return cardCache.get(pokedexNumber) || null;
  }

  try {
    // Busca cards com o número da pokedex, ordenando por data de release (mais recentes primeiro)
    // e filtrando por raridades interessantes
    const query = `nationalPokedexNumbers:${pokedexNumber}`;
    const url = `${API_BASE}/cards?q=${encodeURIComponent(query)}&orderBy=-set.releaseDate&pageSize=10`;

    console.log('🎴 Fetching TCG card:', { pokedexNumber, url, hasApiKey: !!API_KEY });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout (API pode ser lenta)

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Failed to fetch TCG card for Pokemon #${pokedexNumber}`);
      cardCache.set(pokedexNumber, null);
      return null;
    }

    const data: TCGResponse = await response.json();

    if (data.data.length === 0) {
      cardCache.set(pokedexNumber, null);
      return null;
    }

    // Prioridade: Illustration Rare > Ultra Rare > Secret Rare > Hyper Rare > Special Illustration Rare
    // Esses são os cards com melhor artwork
    const priorityRarities = [
      'illustration rare',
      'special illustration rare',
      'ultra rare',
      'secret rare',
      'hyper rare',
      'rainbow rare',
      'full art'
    ];

    const premiumCards = data.data.filter(c => {
      const rarity = c.rarity?.toLowerCase() || '';
      const subtypes = c.subtypes?.map(st => st.toLowerCase()).join(' ') || '';
      return priorityRarities.some(pr => rarity.includes(pr) || subtypes.includes(pr));
    });

    const cardsToSort = premiumCards.length > 0 ? premiumCards : data.data;

    const priorityOrder = priorityRarities;

    const sortedCards = cardsToSort.sort((a, b) => {
      const aRarity = a.rarity?.toLowerCase() || '';
      const bRarity = b.rarity?.toLowerCase() || '';
      const aSubtypes = a.subtypes?.map(st => st.toLowerCase()).join(' ') || '';
      const bSubtypes = b.subtypes?.map(st => st.toLowerCase()).join(' ') || '';

      const aText = `${aRarity} ${aSubtypes}`;
      const bText = `${bRarity} ${bSubtypes}`;

      const aIndex = priorityOrder.findIndex(r => aText.includes(r));
      const bIndex = priorityOrder.findIndex(r => bText.includes(r));

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });

    const card = sortedCards[0];
    cardCache.set(pokedexNumber, card);

    // Salvar no localStorage em background (debounced)
    setTimeout(() => saveCacheToStorage(), 1000);

    return card;

  } catch (error) {
    console.error(`Error fetching TCG card for Pokemon #${pokedexNumber}:`, error);
    cardCache.set(pokedexNumber, null);

    // Salvar no localStorage mesmo em caso de erro (para evitar chamadas repetidas)
    setTimeout(() => saveCacheToStorage(), 1000);

    return null;
  }
}

/**
 * Busca múltiplos cards de uma vez (para os 151 primeiros Pokemon, por exemplo)
 */
export async function fetchTCGCardsByRange(start: number, end: number): Promise<Map<number, TCGCard | null>> {
  const results = new Map<number, TCGCard | null>();
  const missingIds: number[] = [];

  // Verificar cache primeiro
  for (let id = start; id <= end; id++) {
    if (cardCache.has(id)) {
      results.set(id, cardCache.get(id)!);
    } else {
      missingIds.push(id);
    }
  }

  // Se todos os cards já estão em cache, retornar imediatamente
  if (missingIds.length === 0) {
    console.log(`📦 Todos os ${results.size} TCG cards em cache (${start}-${end})`);
    return results;
  }

  console.log(`🎴 Buscando ${missingIds.length} TCG cards faltantes de ${end - start + 1} total (${start}-${end})`);

  try {
    // Busca todos os cards dos Pokemon no range
    const query = `nationalPokedexNumbers:[${start} TO ${end}]`;
    const url = `${API_BASE}/cards?q=${encodeURIComponent(query)}&orderBy=-set.releaseDate&pageSize=250`;

    console.log('🎴 Fetching TCG cards batch:', { start, end, url, hasApiKey: !!API_KEY });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout

    const response = await fetch(url, {
      headers: getHeaders(),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Failed to fetch TCG cards for range ${start}-${end}`);
      // Marcar IDs faltantes como null no cache para evitar chamadas repetidas
      missingIds.forEach(id => {
        cardCache.set(id, null);
        results.set(id, null);
      });
      return results;
    }

    const data: TCGResponse = await response.json();

    // Agrupa cards por Pokemon number
    const cardsByPokemon = new Map<number, TCGCard[]>();

    data.data.forEach(card => {
      if (card.nationalPokedexNumbers && card.nationalPokedexNumbers.length > 0) {
        const pokedexNum = card.nationalPokedexNumbers[0];
        if (!cardsByPokemon.has(pokedexNum)) {
          cardsByPokemon.set(pokedexNum, []);
        }
        cardsByPokemon.get(pokedexNum)!.push(card);
      }
    });

    // Para cada Pokemon, seleciona o melhor card
    const priorityOrder = ['rare holo', 'rare ultra', 'rare secret', 'rare rainbow', 'rare'];

    cardsByPokemon.forEach((cards, pokedexNum) => {
      const sortedCards = cards.sort((a, b) => {
        const aRarity = a.rarity?.toLowerCase() || '';
        const bRarity = b.rarity?.toLowerCase() || '';

        const aIndex = priorityOrder.findIndex(r => aRarity.includes(r));
        const bIndex = priorityOrder.findIndex(r => bRarity.includes(r));

        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;

        return aIndex - bIndex;
      });

      const bestCard = sortedCards[0];
      results.set(pokedexNum, bestCard);
      cardCache.set(pokedexNum, bestCard);
    });

    // Salvar cache no localStorage em background
    setTimeout(() => saveCacheToStorage(), 1000);

    console.log(`✅ TCG batch completo: ${results.size} cards encontrados`);

    return results;

  } catch (error) {
    console.error(`Error fetching TCG cards for range ${start}-${end}:`, error);
    return results;
  }
}

/**
 * Limpa o cache de cards (memória e localStorage)
 */
export function clearTCGCache(): void {
  cardCache.clear();
  localStorage.removeItem(CACHE_KEY);
  console.log('🗑️ Cache TCG limpo completamente');
}
