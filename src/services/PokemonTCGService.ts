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

// Usar proxy em desenvolvimento para evitar CORS
const API_BASE = import.meta.env.DEV ? '/api/tcg' : 'https://api.pokemontcg.io/v2';
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
    // Busca cards com o número da pokedex
    // Priorizar Full Art usando query de subtypes
    const query = `nationalPokedexNumbers:${pokedexNumber} subtypes:"Full Art"`;
    const fallbackQuery = `nationalPokedexNumbers:${pokedexNumber}`;

    let url = `${API_BASE}/cards?q=${encodeURIComponent(query)}&orderBy=-set.releaseDate&pageSize=10`;

    console.log('🎴 Fetching TCG Full Art card:', { pokedexNumber, query, hasApiKey: !!API_KEY });

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

    let data: TCGResponse = await response.json();

    // Se não encontrar Full Art, tentar buscar sem o filtro
    if (data.data.length === 0) {
      console.log('⚠️ Nenhum Full Art encontrado, buscando outros cards...');
      url = `${API_BASE}/cards?q=${encodeURIComponent(fallbackQuery)}&orderBy=-set.releaseDate&pageSize=20`;

      const fallbackResponse = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!fallbackResponse.ok) {
        cardCache.set(pokedexNumber, null);
        return null;
      }

      data = await fallbackResponse.json();

      if (data.data.length === 0) {
        cardCache.set(pokedexNumber, null);
        return null;
      }
    }

    // Prioridade: Full Art sempre primeiro (pedido do usuário)
    // Depois: Illustration Rare > Special Illustration Rare > Ultra Rare > Secret Rare
    const priorityRarities = [
      'full art',
      'illustration rare',
      'special illustration rare',
      'ultra rare',
      'secret rare',
      'hyper rare',
      'rainbow rare',
      'radiant rare',
      'amazing rare'
    ];

    // Função helper para verificar se um card é Full Art
    const isFullArt = (card: TCGCard): boolean => {
      const rarity = card.rarity?.toLowerCase() || '';
      const subtypes = card.subtypes?.map(st => st.toLowerCase()) || [];
      return subtypes.includes('full art') || rarity.includes('full art');
    };

    // Separar Full Art cards primeiro
    const fullArtCards = data.data.filter(isFullArt);
    const otherCards = data.data.filter(c => !isFullArt(c));

    // Filtrar cards premium dos não-Full Art
    const premiumNonFullArt = otherCards.filter(c => {
      const rarity = c.rarity?.toLowerCase() || '';
      const subtypes = c.subtypes?.map(st => st.toLowerCase()).join(' ') || '';
      return priorityRarities.some(pr => rarity.includes(pr) || subtypes.includes(pr));
    });

    // Ordenar cards por prioridade
    const sortByPriority = (cards: TCGCard[]) => {
      return cards.sort((a, b) => {
        const aRarity = a.rarity?.toLowerCase() || '';
        const bRarity = b.rarity?.toLowerCase() || '';
        const aSubtypes = a.subtypes?.map(st => st.toLowerCase()).join(' ') || '';
        const bSubtypes = b.subtypes?.map(st => st.toLowerCase()).join(' ') || '';

        const aText = `${aRarity} ${aSubtypes}`;
        const bText = `${bRarity} ${bSubtypes}`;

        const aIndex = priorityRarities.findIndex(r => aText.includes(r));
        const bIndex = priorityRarities.findIndex(r => bText.includes(r));

        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;

        return aIndex - bIndex;
      });
    };

    // Full Art tem prioridade máxima
    const sortedFullArt = sortByPriority(fullArtCards);
    const sortedPremium = sortByPriority(premiumNonFullArt);

    // Combinar: Full Art primeiro, depois premium, depois o resto
    const sortedCards = [...sortedFullArt, ...sortedPremium, ...otherCards.filter(c => !premiumNonFullArt.includes(c))];

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
    // Se não houver API key, marcar todos como null
    if (!API_KEY) {
      console.warn('⚠️ Pokemon TCG API key não configurada. Configure VITE_POKEMON_TCG_API_KEY no arquivo .env');
      missingIds.forEach(id => {
        cardCache.set(id, null);
        results.set(id, null);
      });
      return results;
    }

    // Busca todos os cards dos Pokemon no range
    // Para Pokemon 1-151, priorizar a edição "151" (sv3pt5)
    const isGen1 = start >= 1 && end <= 151;
    const setFilter = isGen1 ? ' set.id:sv3pt5' : '';
    const query = `nationalPokedexNumbers:[${start} TO ${end}]${setFilter}`;
    const url = `${API_BASE}/cards?q=${encodeURIComponent(query)}&orderBy=-set.releaseDate&pageSize=250`;

    console.log('🎴 Fetching TCG cards batch:', { start, end, isGen1, setFilter, url, hasApiKey: !!API_KEY });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout

    const response = await fetch(url, {
      headers: getHeaders(),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Failed to fetch TCG cards for range ${start}-${end}`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
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

    // Para cada Pokemon, seleciona o melhor card (Full Art tem prioridade)
    const priorityOrder = [
      'full art',
      'illustration rare',
      'special illustration rare',
      'ultra rare',
      'secret rare',
      'hyper rare',
      'rainbow rare',
      'radiant rare',
      'amazing rare',
      'rare holo'
    ];

    // Função helper para verificar Full Art
    const isFullArt = (card: TCGCard): boolean => {
      const rarity = card.rarity?.toLowerCase() || '';
      const subtypes = card.subtypes?.map(st => st.toLowerCase()) || [];
      return subtypes.includes('full art') || rarity.includes('full art');
    };

    cardsByPokemon.forEach((cards, pokedexNum) => {
      // Separar Full Art primeiro
      const fullArtCards = cards.filter(isFullArt);
      const otherCards = cards.filter(c => !isFullArt(c));

      const sortByPriority = (cardsToSort: TCGCard[]) => {
        return cardsToSort.sort((a, b) => {
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
      };

      // Prioridade: Full Art > Premium > Resto
      const sortedFullArt = sortByPriority(fullArtCards);
      const sortedOther = sortByPriority(otherCards);
      const allSorted = [...sortedFullArt, ...sortedOther];

      const bestCard = allSorted[0];
      results.set(pokedexNum, bestCard);
      cardCache.set(pokedexNum, bestCard);
    });

    // Marcar IDs que não encontraram cards como null
    missingIds.forEach(id => {
      if (!results.has(id)) {
        results.set(id, null);
        cardCache.set(id, null);
      }
    });

    // Salvar cache no localStorage em background
    setTimeout(() => saveCacheToStorage(), 1000);

    const foundCount = Array.from(results.values()).filter(c => c !== null).length;
    console.log(`✅ TCG batch completo: ${foundCount} cards encontrados de ${results.size} Pokemon`);

    return results;

  } catch (error: any) {
    console.error(`Error fetching TCG cards for range ${start}-${end}:`, {
      message: error?.message,
      name: error?.name,
      error
    });
    // Marcar IDs faltantes como null no cache para evitar chamadas repetidas
    missingIds.forEach(id => {
      cardCache.set(id, null);
      results.set(id, null);
    });
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
