<script setup lang="ts">
  import { onMounted } from 'vue';
  import Cards from '@/components/Cards/Cards.vue';
  import { usePokemonStore } from '@/stores/Pokemon';
  import { fetchPokemonsData } from './services/fetchPokemons';
  import { useModalStore } from '@/stores/Modal';

  
  const pokemonsData = usePokemonStore().pokemonList;
  const isOpen = useModalStore().isOpen;

  onMounted(fetchPokemonsData);
</script>

<template>
  <h1>{{ $t('greetings') }}</h1>
  {{ isOpen }}
  
  <div id="card-area">
    <template v-for="pokemon in pokemonsData" :key="pokemon.id">
      <Cards :pokemon="pokemon" @click="isOpen = true"/>
    </template>
  </div>
</template>

<style lang="stylus" scoped>
  #card-area
    display inline-flex
    flex-wrap wrap
    justify-content center
    gap: 3rem;
</style>
