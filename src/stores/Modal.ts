import { Pokemon } from '@/interfaces/Pokemon';
import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useModalStore = defineStore('modal', () => {
  const isOpen = ref(false);
  const pokemonData = ref({} as Pokemon);

  return { isOpen, pokemonData };
});
