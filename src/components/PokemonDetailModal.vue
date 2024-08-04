<!-- src/components/PokemonDetailModal.vue -->
<script lang="ts" setup>
  import { capitalize, computed, watch } from 'vue'
  import { usePokemonStore } from '@/stores/pokemonStore'

  const props = defineProps<{
    pokemonName: string | null
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
          <p><strong>ID:</strong> {{ pokemonDetail?.id }}</p>
          <p><strong>Height:</strong> {{ (pokemonDetail?.height || 0) / 10 }} m</p>
          <p><strong>Weight:</strong> {{ (pokemonDetail?.weight || 0) / 10 }} kg</p>
          <p><strong>Base Stats:</strong></p>
          <ul>
            <li v-for="stat in pokemonDetail?.stats || []" :key="stat.stat.name">
              {{ capitalize(stat.stat.name) }}: {{ stat.base_stat }}
            </li>
          </ul>
          <p><strong>Pokedex Entry:</strong></p>
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
