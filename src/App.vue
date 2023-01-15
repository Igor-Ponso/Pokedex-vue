<script setup lang="ts">
  import { onMounted } from 'vue';
  import Cards from '@/components/Cards/Cards.vue';
  import Modal from './components/Modal/Modal.vue';
  import { usePokemonStore } from '@/stores/Pokemon';
  import { fetchPokemonsData } from './services/fetchPokemons';

  const pokemonsData = usePokemonStore().pokemonList;

  onMounted(fetchPokemonsData);
</script>

<template>
  <h1>{{ $t('greetings') }}</h1>
  <Modal :pokemon="pokemonsData[0]"></Modal>
  <div id="card-area">
    <template v-for="pokemon in pokemonsData" :key="pokemon.id">
      <Cards :pokemon="pokemon" />
    </template>
  </div>
</template>

<style lang="stylus" scoped>
  *
    font-family: 'Press Start 2P', cursive;
  #card-area
    display inline-flex
    flex-wrap wrap
    justify-content center
    gap: 3rem;
</style>
