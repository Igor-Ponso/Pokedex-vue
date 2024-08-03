<!-- src/pages/index.vue -->
<script lang="ts" setup>
  import { capitalize } from 'vue'
  import { getMinimalPokemonDetails, getPokemonListByNumber } from '@/services/pokemonService'
  import { padWithLeadingZeros } from '@/composables/useUtils'

  const pokemons = ref<{ id: number, name: string, image: string, types: string[] }[]>([])
  const loading = ref(true)

  const fetchPokemons = async () => {
    try {
      const pokemonList = await getPokemonListByNumber(30)
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
        <v-card>
          <v-card-title>{{ padWithLeadingZeros(pokemon.id, 3) }}</v-card-title>
          <v-card-subtitle>
            <v-img
              :alt="pokemon.name"
              class="mx-auto"
              max-width="150"
              :src="pokemon.image"
            />
          </v-card-subtitle>
          <v-card-text>{{ capitalize(pokemon.name) }}</v-card-text>
          <v-card-actions>
            <v-btn color="primary">Details</v-btn>
          </v-card-actions>
          {{ pokemon.types }}

          <!-- Additional Pokémon details can be added here -->
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
