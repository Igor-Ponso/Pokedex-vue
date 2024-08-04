<!-- src/pages/index.vue -->
<script lang="ts" setup>
  import { onMounted } from 'vue'
  import { usePokemonStore } from '@/stores/pokemonStore'
  import PokemonCard from '@/components/PokemonCard.vue'
  import PokemonDetailModal from '@/components/PokemonDetailModal.vue'

  const pokemonStore = usePokemonStore()

  onMounted(() => {
    pokemonStore.fetchPokemons(151)
  })
</script>

<template>
  <v-container>
    <v-row v-if="pokemonStore.loading" justify="center">
      <v-col class="text-center" cols="12">
        <v-progress-circular color="primary" indeterminate />
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col
        v-for="pokemon in pokemonStore.pokemons"
        :key="pokemon.name"
        cols="12"
        md="4"
        sm="6"
      >
        <PokemonCard :pokemon="pokemon" @show-details="pokemonStore.showPokemonDetails" />
      </v-col>
    </v-row>
    <PokemonDetailModal
      :is-open="pokemonStore.isModalOpen"
      :pokemon-name="pokemonStore.selectedPokemon"
      @update:is-open="pokemonStore.isModalOpen = $event"
    />
  </v-container>
</template>
