<script setup lang="ts">
  /**
   * Component template for Cards.
   * @name 'Cards'
   * @see App
   * @version 1.0.0
   */
  import TCGCardModal from '@/components/Modal/TCGCardModal.vue';
import ImageWithSkeleton from '@/components/UI/ImageWithSkeleton.vue';
import PokemonCardBack from '@/components/UI/PokemonCardBack.vue';
import { Species } from '@/interfaces/Pokemon';
import type { PokemonEntries } from '@/interfaces/PokemonEntries';
import type { TCGCard } from '@/services/PokemonTCGService';
import { usePokemonStore } from '@/stores/PokemonStore';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

// Interface mínima necessária para evitar erro de atribuição do TS ao passar objetos do store.
// O objeto completo de Pokemon possui campos extras que serão ignorados conforme checagem estrutural.
interface PokemonCardMinimal {
  id: number;
  name: string;
  types: { slot: number; type: { name: string; url: string } }[];
  sprites: { other: { 'official-artwork': { front_default: string } } };
  stats: { base_stat: number; stat: { name: string; url: string } }[];
  tcgCard?: TCGCard; // usar interface completa para compatibilidade com modal
  species?: Species | PokemonEntries;
  [key: string]: any; // tolera campos adicionais (abilities, moves, etc.)
}
type PokemonCard = PokemonCardMinimal;

  const props = defineProps<{ pokemon: PokemonCard }>();

  // Define o evento click para evitar warning de Vue
  const emit = defineEmits<{ click: [pokemon: PokemonCard] }>();

  const pokemonStore = usePokemonStore();
  const { tcgMode } = storeToRefs(pokemonStore);

  const cardLoading = ref(false); // Apenas para carregamento inicial, não para trocas de sprite

  onMounted(() => {
    isFavorite.value = pokemonStore.isFavorite(props.pokemon.id);
  });

  // Pré-carrega todos os ícones de tipo existentes (evita 404 em produção e facilita fallback)
  // @ts-ignore Vite ESM build supports import.meta.glob; suppress TS CommonJS warning
  const typeIcons = import.meta.glob('@/assets/svgs/type/*.svg', { eager: true, import: 'default' }) as Record<string, string>;

  const pokemonTypePath = (type_name: string) => {
    // Caminho real do arquivo dentro de glob
    const key = `/src/assets/svgs/type/${type_name}.svg`;
    return typeIcons[key] || '';
  };

  const checkTypes = (types: number) => {
    if (types === 2) {
      return {
        background: `linear-gradient(135deg,
          var(--color-${props.pokemon.types[0].type.name}) 0%,
          var(--color-${props.pokemon.types[1].type.name}) 100%)`,
        boxShadow: `0 10px 20px rgba(0,0,0,0.2),
                   0 6px 6px rgba(0,0,0,0.1),
                   inset 0 1px 0 rgba(255,255,255,0.3)`,
      };
    } else {
      return {
        background: `linear-gradient(135deg,
          var(--color-${props.pokemon.types[0].type.name}) 0%,
          var(--color-type-${props.pokemon.types[0].type.name}) 100%)`,
        boxShadow: `0 10px 20px rgba(0,0,0,0.2),
                   0 6px 6px rgba(0,0,0,0.1),
                   inset 0 1px 0 rgba(255,255,255,0.3)`,
      };
    }
  };

  const padWithLeadingZeros = (num: number, totalLength: number) => {
    return String(num).padStart(totalLength, '0');
  };

  const shinyUrl =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/';
  const shinyForm = ref(false);
  const isHovered = ref(false);
  const isFavorite = ref(false);
  const cardTarget = ref<HTMLElement | null>(null);
  const holoX = ref(50);
  const holoY = ref(50);
  const rotateX = ref(0);
  const rotateY = ref(0);
  const pointerFromCenter = ref(0.5);
  const showTCGModal = ref(false);

  const toggleFavorite = () => {
    pokemonStore.toggleFavorite(props.pokemon.id);
    isFavorite.value = pokemonStore.isFavorite(props.pokemon.id);
  };

  const expandCard = () => {
    showTCGModal.value = true;
  };

  const closeTCGModal = () => {
    showTCGModal.value = false;
  };

  // URL da imagem atual
  const currentImageUrl = computed(() => {
    // Se houver TCG card disponível E TCG Mode estiver ativo, usar a imagem oficial do card
    if (tcgMode.value && props.pokemon.tcgCard && !shinyForm.value) {
      // Usa small para melhor performance (cards pequenos não precisam de alta resolução)
      return props.pokemon.tcgCard.images.small;
    }
    // Senão, usar a artwork oficial da PokeAPI
    return !shinyForm.value
      ? props.pokemon.sprites.other['official-artwork'].front_default
      : `${shinyUrl}${props.pokemon.id}.png`;
  });

  // Controla o loading da imagem
  const handleImageLoad = () => {
    cardLoading.value = false;
  };

  const handleImageError = () => {
    cardLoading.value = false;
    console.warn(`Failed to load image for Pokemon #${props.pokemon.id}`);
  };

  // Removido: ImageWithSkeleton já controla o loading
  // O cardLoading agora é usado apenas para o carregamento inicial

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardTarget.value) return;

    const rect = cardTarget.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Converte posição do mouse para percentual
    holoX.value = (x / rect.width) * 100;
    holoY.value = (y / rect.height) * 100;

    // Calcula rotação 3D baseado na posição do mouse (aumentado para movimento mais pronunciado)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    rotateY.value = ((x - centerX) / centerX) * 18; // -18 a 18 graus (aumentado de 10)
    rotateX.value = ((centerY - y) / centerY) * 18; // -18 a 18 graus (aumentado de 10)

    // Calcula distância do centro (para efeitos holográficos)
    const deltaX = (holoX.value - 50) / 50;
    const deltaY = (holoY.value - 50) / 50;
    pointerFromCenter.value = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 1);
  };

  const handleMouseLeave = () => {
    isHovered.value = false;
    holoX.value = 50;
    holoY.value = 50;
    rotateX.value = 0;
    rotateY.value = 0;
  };
</script>

<template>
  <!-- TCG Card Oficial (quando TCG mode ativo e disponível) -->
  <div
    v-if="tcgMode && props.pokemon.tcgCard"
    class="tcg-card-wrapper"
    ref="cardTarget"
    @mouseenter="isHovered = true"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    @click="expandCard"
    :class="{ hovered: isHovered, loading: cardLoading }"
    :style="{
      transform: isHovered
        ? `translateY(-12px) scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
        : 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)'
    }"
  >
    <!-- Card back durante loading -->
    <div v-if="cardLoading" class="card-back-overlay">
      <PokemonCardBack />
    </div>

    <!-- Botão de favorito (único botão em TCG mode) -->
    <div class="card-actions-overlay">
      <button class="action-btn favorite-btn" @click.stop="toggleFavorite" :class="{ active: isFavorite }">
        <v-icon :name="isFavorite ? 'bi-heart-fill' : 'bi-heart'" fill="white" />
      </button>
    </div>

    <!-- Imagem do Card TCG Oficial -->
    <img
      v-show="!cardLoading"
      :src="currentImageUrl"
      :alt="`${props.pokemon.name} TCG Card`"
      class="tcg-card-image"
      @load="handleImageLoad"
      @error="handleImageError"
    />

    <!-- Efeito holográfico sobre o card TCG -->
    <div
      class="holo-wrapper"
      v-if="isHovered && !cardLoading"
      :style="{
        '--holo-x': `${holoX}%`,
        '--holo-y': `${holoY}%`,
        '--pointer-from-center': pointerFromCenter
      }"
    >
      <div class="holo-sparkle"></div>
      <div class="holo-effect"></div>
      <div class="holo-rainbow"></div>
    </div>
  </div>

  <!-- Card Customizado (quando não há TCG card ou está em shiny mode) -->
  <div
    v-else
    class="card-tcg"
    ref="cardTarget"
    :style="{
      ...checkTypes(props.pokemon.types.length),
      transform: isHovered
        ? `translateY(-12px) scale(1.03) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
        : 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)'
    }"
    @mouseenter="isHovered = true"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    :class="{ shiny: shinyForm, hovered: isHovered, loading: cardLoading, clickable: true }"
  >
    <!-- Card back durante loading -->
    <div v-if="cardLoading" class="card-back-overlay">
      <PokemonCardBack />
    </div>
    <!-- Estrelinhas do Shiny -->
    <div v-if="shinyForm" class="sparkles">
      <span class="sparkle" v-for="i in 8" :key="i" :style="{ '--delay': i * 0.3 + 's' }">✨</span>
    </div>

    <!-- Border holográfico estilo TCG -->
    <div class="tcg-border"></div>

    <!-- Header com número e ações -->
    <div class="card-header">
      <span class="pokemon-number">#{{ padWithLeadingZeros(props.pokemon.id, 3) }}</span>
      <div class="card-actions">
        <button class="action-btn shiny-btn" @click.stop="shinyForm = !shinyForm" :class="{ active: shinyForm }">
          <v-icon
            name="bi-stars"
            fill="white"
          />
        </button>
        <button class="action-btn favorite-btn" @click.stop="toggleFavorite" :class="{ active: isFavorite }">
          <v-icon
            :name="isFavorite ? 'bi-heart-fill' : 'bi-heart'"
            fill="white"
          />
        </button>
      </div>
    </div>

    <!-- Área clicável para abrir o modal (não interfere com os botões) -->
    <div class="card-clickable-area" @click="emit('click', props.pokemon)"></div>

    <!-- Imagem do Pokémon com loading -->
    <div class="pokemon-image-container">
      <ImageWithSkeleton
        :src="currentImageUrl"
        :alt="props.pokemon.name"
        class="card-image"
      />
      <div class="image-glow" v-if="isHovered"></div>
    </div>

    <!-- Info do Pokémon -->
    <div class="pokemon-info">
      <h3 class="pokemon-name">{{ props.pokemon.name }}</h3>

      <!-- Tipos -->
      <div class="pokemon-types">
        <div
          v-for="item in props.pokemon.types"
          :key="item.type.url"
          class="type-badge"
          :style="{
            background: `var(--color-type-${item.type.name})`,
          }"
        >
          <img
            v-if="pokemonTypePath(item.type.name)"
            :src="pokemonTypePath(item.type.name)"
            :alt="item.type.name"
            class="type-icon"
          />
          <span class="type-name">{{ item.type.name }}</span>
        </div>
      </div>

      <!-- HP Bar estilo TCG -->
      <div class="hp-section">
        <span class="hp-label">HP</span>
        <div class="hp-bar">
          <div class="hp-fill" :style="{ width: (props.pokemon.stats[0].base_stat / 255 * 100) + '%' }"></div>
        </div>
        <span class="hp-value">{{ props.pokemon.stats[0].base_stat }}</span>
      </div>
    </div>

  </div>

  <!-- Modal de expansão do card TCG -->
  <TCGCardModal
    v-if="showTCGModal && props.pokemon.tcgCard"
    :card="props.pokemon.tcgCard"
    :pokemon-name="props.pokemon.name"
    @close="closeTCGModal"
  />
</template>

<style src="./CardStyles.stylus" scoped lang="stylus"></style>
