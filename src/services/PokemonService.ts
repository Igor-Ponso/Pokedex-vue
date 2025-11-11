import { api } from '@/api/config';
import { useAppToast } from '@/composables/useAppToast';
import { Pokemon } from '@/interfaces/Pokemon';
import { PokemonEntries } from '@/interfaces/PokemonEntries';

interface PokemonListItem {
  name: string;
  url: string;
}

interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

interface CacheEntry {
  data: Pokemon | PokemonEntries | PokemonListItem[];
  timestamp: number;
  expiresAt: number;
}

class PokemonService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() < entry.expiresAt;
  }

  private setCache(key: string, data: Pokemon | PokemonEntries | PokemonListItem[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    });
  }

  private getCache(key: string): Pokemon | PokemonEntries | PokemonListItem[] | null {
    const entry = this.cache.get(key);
    if (entry && this.isCacheValid(entry)) {
      return entry.data;
    }
    if (entry) {
      this.cache.delete(key);
    }
    return null;
  }

  async getPokemonList(
    offset: number = 0,
    limit: number = 20
  ): Promise<PokemonListItem[]> {
    const cacheKey = `pokemon-list-${offset}-${limit}`;
    const cached = this.getCache(cacheKey) as PokemonListItem[] | null;
    
    if (cached) {
      return cached;
    }

    try {
      const response = await api.get<PokemonListResponse>(
        `/pokemon?offset=${offset}&limit=${limit}`
      );
      
      this.setCache(cacheKey, response.data.results);
      return response.data.results;
    } catch (error: any) {
  useAppToast().error(`Erro ao buscar lista de pokémons: ${error?.message}`);
      return [];
    }
  }

  async getPokemonById(id: number): Promise<Pokemon | null> {
    const cacheKey = `pokemon-${id}`;
    const cached = this.getCache(cacheKey) as Pokemon | null;
    
    if (cached) {
      return cached;
    }

    try {
      const response = await api.get<Pokemon>(`/pokemon/${id}`);
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error: any) {
  useAppToast().error(`Erro ao buscar pokémon ${id}: ${error?.message}`);
      return null;
    }
  }

  async getPokemonSpeciesById(id: number): Promise<PokemonEntries | null> {
    const cacheKey = `pokemon-species-${id}`;
    const cached = this.getCache(cacheKey) as PokemonEntries | null;
    
    if (cached) {
      return cached;
    }

    try {
      const response = await api.get<PokemonEntries>(`/pokemon-species/${id}`);
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error: any) {
  useAppToast().error(`Erro ao buscar dados do pokémon ${id}: ${error?.message}`);
      return null;
    }
  }

  async getPokemonWithSpecies(id: number): Promise<{
    pokemon: Pokemon | null;
    species: PokemonEntries | null;
  }> {
    const [pokemon, species] = await Promise.all([
      this.getPokemonById(id),
      this.getPokemonSpeciesById(id)
    ]);

    return { pokemon, species };
  }

  async getGenerationRange(generation: number): Promise<[number, number]> {
    const generations: Record<number, [number, number]> = {
      1: [1, 151],      // Kanto
      2: [152, 251],    // Johto
      3: [252, 386],    // Hoenn
      4: [387, 493],    // Sinnoh
      5: [494, 649],    // Unova
      6: [650, 721],    // Kalos
      7: [722, 809],    // Alola
      8: [810, 905],    // Galar
      9: [906, 1025]    // Paldea
    };

    return generations[generation] || [1, 151];
  }

  async getPokemonsByGeneration(
    generation: number,
    offset: number = 0,
    limit: number = 20
  ): Promise<Pokemon[]> {
    const [start, end] = await this.getGenerationRange(generation);
    const actualOffset = start + offset;
    const actualLimit = Math.min(limit, end - actualOffset + 1);

    if (actualLimit <= 0) {
      return [];
    }

    const pokemonList = await this.getPokemonList(actualOffset - 1, actualLimit);
    const pokemonPromises = pokemonList.map((item) => {
      const id = parseInt(item.url.split('/').filter(Boolean).pop() || '0');
      return this.getPokemonById(id);
    });

    const pokemons = await Promise.all(pokemonPromises);
    return pokemons.filter((p): p is Pokemon => p !== null);
  }

  async searchPokemons(query: string): Promise<Pokemon[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const response = await api.get<PokemonListResponse>(
        `/pokemon?limit=1000`
      );
      
      const filtered = response.data.results.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(query.toLowerCase())
      );

      const pokemonPromises = filtered.slice(0, 20).map((item) => {
        const id = parseInt(item.url.split('/').filter(Boolean).pop() || '0');
        return this.getPokemonById(id);
      });

      const pokemons = await Promise.all(pokemonPromises);
      return pokemons.filter((p): p is Pokemon => p !== null);
    } catch (error: any) {
  useAppToast().error(`Erro ao buscar pokémons: ${error?.message}`);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const pokemonService = new PokemonService();