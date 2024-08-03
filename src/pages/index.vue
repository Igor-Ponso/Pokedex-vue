<!-- src/pages/index.vue -->
<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import { getMinimalPokemonDetails, getPokemonListByNumber } from '@/services/pokemonService'
  import PokemonCard from '@/components/PokemonCard.vue'
  import type { Pokemon } from 'pokenode-ts'

  const pokemons = ref<Partial<Pokemon>[]>([])
  const loading = ref(true)

  const fetchPokemons = async () => {
    try {
      const pokemonList = await getPokemonListByNumber(151)
      pokemons.value = await getMinimalPokemonDetails(pokemonList)
    } catch (error) {
      console.error('Failed to fetch Pokémon:', error)
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchPokemons)
</script>

<template>
  <v-container>
    <v-row v-if="loading" justify="center">
      <v-col class="text-center" cols="12">
        <v-progress-circular color="primary" indeterminate />
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col
        v-for="pokemon in pokemons"
        :key="pokemon.name"
        cols="12"
        md="4"
        sm="6"
      >
        <PokemonCard :pokemon="pokemon" />
      </v-col>
    </v-row>
  </v-container>
</template>
