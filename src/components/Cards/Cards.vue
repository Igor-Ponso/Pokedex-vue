<script setup lang="ts">
  /**
   * Component template for Cards.
   * @name 'Cards'
   * @see App
   * @version 1.0.0
   */
  import ImageWithSkeleton from '@/components/UI/ImageWithSkeleton.vue';
import PokemonCardBack from '@/components/UI/PokemonCardBack.vue';
import { Pokemon, Species } from '@/interfaces/Pokemon';
import type { PokemonEntries } from '@/interfaces/PokemonEntries';
import { usePokemonStore } from '@/stores/PokemonStore';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

// Tipo mais flexível para o card: não exige species completa e permite species detalhada opcional
// Aceita tanto o formato básico (Species) quanto o detalhado (PokemonEntries) e torna opcional
type PokemonCard = Omit<Pokemon, 'species'> & { species?: Species | PokemonEntries };

  const props = defineProps<{
    pokemon: PokemonCard;
  }>();

  const pokemonStore = usePokemonStore();
  const { tcgMode } = storeToRefs(pokemonStore);

  const cardLoading = ref(false);

  onMounted(() => {
    isFavorite.value = pokemonStore.isFavorite(props.pokemon.id);
  });

  // Pré-carrega todos os ícones de tipo existentes (evita 404 em produção e facilita fallback)
  const typeIcons = import.meta.glob('@/assets/svgs/type/*.svg', { eager: true, import: 'default' }) as Record<string, string>;

  const pokemonTypePath = (type_name: string) => {
    // Caminho real do arquivo dentro de glob
    const key = `/src/assets/svgs/type/${type_name}.svg`;
    return typeIcons[key] || '';
  };

  // Retorna data attributes para aplicar estilos via CSS
  const getTypeAttributes = () => {
    return {
      'data-type-1': props.pokemon.types[0]?.type.name || '',
      'data-type-2': props.pokemon.types[1]?.type.name || ''
    };
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

  const toggleFavorite = () => {
    pokemonStore.toggleFavorite(props.pokemon.id);
    isFavorite.value = pokemonStore.isFavorite(props.pokemon.id);
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

  // Removido o watch que causava problemas com shiny mode

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardTarget.value) return;

    const rect = cardTarget.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Converte posição do mouse para percentual
    holoX.value = (x / rect.width) * 100;
    holoY.value = (y / rect.height) * 100;

    // Calcula rotação 3D baseado na posição do mouse
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    rotateY.value = ((x - centerX) / centerX) * 10; // -10 a 10 graus
    rotateX.value = ((centerY - y) / centerY) * 10; // -10 a 10 graus
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
  <!-- TCG Card Oficial (quando TCG mode ativo, disponível e não estiver em shiny mode) -->
  <div
    v-if="tcgMode && props.pokemon.tcgCard && !shinyForm"
    class="tcg-card-wrapper"
    ref="cardTarget"
    @mouseenter="isHovered = true"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
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

    <!-- Botões de ação sobre o card TCG -->
    <div class="card-actions-overlay">
      <button class="action-btn shiny-btn" @click.stop="shinyForm = !shinyForm">
        <v-icon name="bi-stars" fill="white" />
      </button>
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
    <div class="holo-wrapper" v-if="isHovered && !cardLoading">
      <div class="holo-sparkle" :style="{ backgroundPosition: `${holoX}% ${holoY}%` }"></div>
      <div
        class="holo-effect"
        :style="{
          background: `
            radial-gradient(
              circle 800px at ${holoX}% ${holoY}%,
              rgba(255, 0, 255, 0.4) 0%,
              rgba(0, 255, 255, 0.3) 20%,
              rgba(255, 255, 0, 0.3) 40%,
              rgba(255, 0, 127, 0.3) 60%,
              rgba(0, 255, 255, 0.2) 80%,
              transparent 100%
            )
          `
        }"
      ></div>
      <div class="holo-rainbow" :style="{ backgroundPosition: `${holoX * 2}% ${holoY * 2}%` }"></div>
    </div>
  </div>

  <!-- Card Customizado (quando não há TCG card ou está em shiny mode) -->
  <div
    v-else
    class="card-tcg"
    ref="cardTarget"
    v-bind="getTypeAttributes()"
    :style="{
      transform: isHovered
        ? `translateY(-12px) scale(1.03) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
        : 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)'
    }"
    @mouseenter="isHovered = true"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    :class="{ shiny: shinyForm, hovered: isHovered, loading: cardLoading }"
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

    <!-- Efeito holográfico Full Art com múltiplas camadas -->
    <div class="holo-wrapper" v-if="isHovered">
      <!-- Camada de sparkle/glitter -->
      <div
        class="holo-sparkle"
        :style="{
          backgroundPosition: `${holoX}% ${holoY}%`
        }"
      ></div>

      <!-- Camada principal holográfica -->
      <div
        class="holo-effect"
        :style="{
          background: `
            radial-gradient(
              circle 800px at ${holoX}% ${holoY}%,
              rgba(255, 0, 255, 0.4) 0%,
              rgba(0, 255, 255, 0.3) 20%,
              rgba(255, 255, 0, 0.3) 40%,
              rgba(255, 0, 127, 0.3) 60%,
              rgba(0, 255, 255, 0.2) 80%,
              transparent 100%
            )
          `
        }"
      ></div>

      <!-- Camada de rainbow gradient -->
      <div
        class="holo-rainbow"
        :style="{
          backgroundPosition: `${holoX * 2}% ${holoY * 2}%`
        }"
      ></div>
    </div>
  </div>
</template>

<style src="./CardStyles.stylus" scoped lang="stylus"></style>
