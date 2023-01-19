import { Pokemon } from '@/interfaces/Pokemon';
import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useModalStore = defineStore('modal', () => {
  const isOpen = ref(false);
  const pokemonData = ref({} as Pokemon);
  const pokemonId = ref<number>(0);

  return { isOpen, pokemonData, pokemonId };
});
