class AudioService {
  private audioCache = new Map<number, HTMLAudioElement>();
  private currentAudio: HTMLAudioElement | null = null;
  private volume: number = 0.8;
  private muted: boolean = false;
  
  /**
   * Toca o som de um Pokémon
   */
  playPokemonCry(pokemonId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Verifica se já tem um áudio em cache
        if (this.audioCache.has(pokemonId)) {
          const cachedAudio = this.audioCache.get(pokemonId);
          
          if (cachedAudio) {
            // Reseta o áudio para o início
            cachedAudio.currentTime = 0;
            
            // Toca o áudio
            cachedAudio.play();
            
            // Configura para resolver quando terminar
            cachedAudio.onended = () => {
              resolve();
            };
            
            // Configura para tratar erros
            cachedAudio.onerror = (error: any) => {
              console.error(`Error playing Pokemon cry:`, error);
              reject(error);
            };
            
            return;
          }
        }
        
  // Cria um novo elemento de áudio
  const audio = new Audio();
        audio.src = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`;
        audio.preload = 'auto';
  audio.volume = this.muted ? 0 : this.volume;
        
        // Configura eventos
        audio.onended = () => {
          resolve();
        };
        
        audio.onerror = (error: any) => {
          console.error(`Error loading Pokemon cry for ID ${pokemonId}:`, error);
          reject(error);
        };
        
        // Adiciona ao cache
        this.audioCache.set(pokemonId, audio);
        
  // Toca o áudio
  audio.play();
        
        // Mantém referência ao áudio atual
        this.currentAudio = audio;
      } catch (error) {
        console.error(`Error playing Pokemon cry for ID ${pokemonId}:`, error);
        reject(error);
      }
    });
  }
  
  /**
   * Para o áudio atual
   */
  stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
  }
  
  /**
   * Limpa o cache de áudios
   */
  clearCache(): void {
    // Pausa todos os áudios antes de limpar
    this.audioCache.forEach(audio => {
      audio.pause();
    });
    
    // Limpa o cache
    this.audioCache.clear();
    this.currentAudio = null;
  }
  
  /**
   * Obtém informações sobre o cache
   */
  getCacheInfo(): { size: number; ids: number[] } {
    return {
      size: this.audioCache.size,
      ids: Array.from(this.audioCache.keys())
    };
  }

  /**
   * Ajusta volume global (0 a 1) e aplica aos áudios em cache
   */
  setVolume(volume: number) {
    this.volume = Math.min(1, Math.max(0, volume));
    this.audioCache.forEach(a => {
      a.volume = this.muted ? 0 : this.volume;
    });
    if (this.currentAudio) this.currentAudio.volume = this.muted ? 0 : this.volume;
  }

  mute() {
    this.muted = true;
    this.audioCache.forEach(a => (a.volume = 0));
    if (this.currentAudio) this.currentAudio.volume = 0;
  }

  unmute() {
    this.muted = false;
    this.audioCache.forEach(a => (a.volume = this.volume));
    if (this.currentAudio) this.currentAudio.volume = this.volume;
  }

  getCurrentAudio() {
    return this.currentAudio;
  }
}

export const audioService = new AudioService();