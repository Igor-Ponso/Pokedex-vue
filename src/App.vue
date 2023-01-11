<script setup lang="ts">
  import { reactive, onMounted } from 'vue';
  import Cards from '@/components/Cards.vue';
  import axios from 'axios';
  import { Pokemon } from '@/interfaces/Pokemon';

  //const pokemons = ref([] as Pokemon[]);
  //const pokemons = ref<Pokemon[]>([]); // * Other way for the same thing

  const pokemonData = reactive([] as Pokemon[]);

  const api = axios.create({
    baseURL: 'https://pokeapi.co/api/v2',
  });

  const fetchPokemon = async () => {
    for (let i = 1; i <= 151; i++) {
      await api.get('/pokemon/' + i).then((response) => {
        pokemonData.push(response.data);
      });
    }
  };
  onMounted(fetchPokemon);
</script>

<template>
  <h1>{{ $t('greetings') }}</h1>
  <div id="card-area">
    <template v-for="pokemon in pokemonData" :key="pokemon.id">
      <Cards :pokemon="pokemon" />
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
