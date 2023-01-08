<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { Pokemon } from "@/interfaces/Pokemon"

  const pokemons = ref<Pokemon[]>();

  const api = axios.create({
    baseURL: 'https://pokeapi.co/api/v2',
  });

  const fetchPokemon = () => {
    api.get('/pokemon?limit=151').then((response) => {
      pokemons.value = response.data.results;
    });
  };

  console.log(pokemons.value);

  onMounted(fetchPokemon);
</script>

<template>
  <h1>{{ $t('greetings') }}</h1>
  <div v-for="pokemon in pokemons" :key="pokemon.name">
    {{ pokemon.name }}
  </div>
</template>

<style scoped lang="stylus">
  .read-the-docs {
    color: #888;
  }
</style>
