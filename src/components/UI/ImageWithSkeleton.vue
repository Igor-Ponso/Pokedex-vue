<script setup lang="ts">
import { ref } from 'vue';
import { useImage } from '@vueuse/core';
import PokemonCardBack from './PokemonCardBack.vue';

interface Props {
  src: string;
  alt?: string;
  class?: string;
}

const props = defineProps<Props>();

const { isLoading } = useImage({ src: props.src });
</script>

<template>
  <div class="image-container" :class="props.class">
    <PokemonCardBack v-if="isLoading" />
    <img
      v-show="!isLoading"
      :src="props.src"
      :alt="props.alt"
      :class="props.class"
      @load="isLoading = false"
    />
  </div>
</template>

<style scoped>
.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
