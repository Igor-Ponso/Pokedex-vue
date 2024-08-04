<!-- src/components/PokemonDetailModal.vue -->
<script lang="ts" setup>
  import { capitalize, computed, watch } from 'vue'
  import { EnhancedPokemon, usePokemonStore } from '@/stores/pokemonStore'

  const props = defineProps<{
    pokemonName: string | null,
    isOpen: boolean
  }>()

  const emit = defineEmits(['update:isOpen'])

  const pokemonStore = usePokemonStore()

  const pokemonDetail = computed(() =>
    pokemonStore.pokemons.find(pokemon => pokemon.name === props.pokemonName)
  )

  const isOpen = computed({
    get: () => props.isOpen,
    set: (val: boolean) => emit('update:isOpen', val),
  })

  const loading = computed(() => !pokemonDetail.value)

  watch(() => props.isOpen, newVal => {
    if (newVal && !pokemonDetail.value) {
      console.error('Pokemon details not found in store')
    }
  })

  function getPokedexEntry (pokemon?: EnhancedPokemon) {
    if (!pokemon || !pokemon.speciesData) return 'No entry available'

    const flavorTexts = pokemon.speciesData.flavor_text_entries
    const englishText = flavorTexts.find(entry => entry.language.name === 'en')
    return englishText?.flavor_text || 'No entry available'
  }

  function handleToggleShiny () {
    if (pokemonDetail.value) {
      pokemonStore.toggleShiny(pokemonDetail.value)
    }
  }
</script>

<template>
  <v-dialog v-model="isOpen" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ capitalize(pokemonDetail?.name || '') }}</span>
      </v-card-title>
      <v-card-text>
        <v-skeleton-loader v-if="loading" type="card" />
        <div v-else>
          <div class="d-flex justify-content-center">
            <v-img
              :alt="pokemonDetail?.name"
              height="200"
              :src="pokemonDetail?.imageUrl"
              @click="handleToggleShiny"
            />
          </div>
          <p><strong>#</strong> {{ pokemonDetail?.id }}</p>
          <p><strong>Height:</strong> {{ (pokemonDetail?.height || 0) / 10 }} m</p>
          <p><strong>Weight:</strong> {{ (pokemonDetail?.weight || 0) / 10 }} kg</p>
          <p><strong>Base Stats:</strong></p>
          <ul>
            <li v-for="stat in pokemonDetail?.stats || []" :key="stat.stat.name">
              {{ capitalize(stat.stat.name) }}: {{ stat.base_stat }}
            </li>
          </ul>
          <p><strong>Pokedex Entry:</strong> {{ getPokedexEntry(pokemonDetail) }}</p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="isOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/* Add your styles here */
</style>
