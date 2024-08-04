<!-- src/pages/index.vue -->
<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue'
  import { usePokemonStore } from '@/stores/pokemonStore'
  import PokemonCard from '@/components/PokemonCard.vue'
  import PokemonDetailModal from '@/components/PokemonDetailModal.vue'
  import { useDebounceFn, useIntersectionObserver } from '@vueuse/core'
  import type { Pokemon } from 'pokenode-ts'

  const pokemonStore = usePokemonStore()
  const searchQuery = ref('')
  const searchResult = ref<Pokemon[] | null>(null)

  const loadMoreTrigger = ref(null)

  const handleSearch = useDebounceFn(async () => {
    if (searchQuery.value) {
      searchResult.value = await pokemonStore.searchPokemon(searchQuery.value)
    } else {
      searchResult.value = null
      pokemonStore.resetPagination()
    }
  }, 300) // Debouncing the search function

  const handleLoadMore = async () => {
    if (!searchQuery.value && !pokemonStore.loading && !pokemonStore.isLoadingMore) {
      await pokemonStore.fetchPokemons()
    }
  }

  useIntersectionObserver(loadMoreTrigger, ([{ isIntersecting }]) => {
    if (isIntersecting) {
      handleLoadMore()
    }
  }, {
    threshold: 0.5, // Using a threshold for better performance
  })

  const displayedPokemons = computed(() => {
    return searchResult.value ? searchResult.value : pokemonStore.pokemons
  })

  onMounted(() => {
    pokemonStore.fetchPokemons()
  })
</script>

<template>
  <v-container>
    <v-row class="mb-4" justify="center">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          clearable
          label="Search Pokémon by name or number"
          outlined
          @input="handleSearch"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col v-if="pokemonStore.loading && !pokemonStore.isLoadingMore" class="text-center" cols="12">
        <v-progress-circular color="primary" indeterminate />
      </v-col>
      <v-col
        v-for="pokemon in displayedPokemons"
        v-else
        :key="pokemon.name"
        cols="12"
        md="4"
        sm="6"
      >
        <PokemonCard :pokemon="pokemon" @show-details="pokemonStore.showPokemonDetails" />
      </v-col>
    </v-row>
    <div ref="loadMoreTrigger" class="text-center my-4">
      <v-progress-circular v-if="pokemonStore.isLoadingMore" color="primary" indeterminate />
    </div>
    <PokemonDetailModal
      :is-open="pokemonStore.isModalOpen"
      :pokemon-name="pokemonStore.selectedPokemon"
      @update:is-open="pokemonStore.isModalOpen = $event"
    />
  </v-container>
</template>
