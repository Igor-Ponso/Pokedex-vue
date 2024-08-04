 <!-- src/components/PokemonCard.vue -->
<script lang="ts" setup>
  import { padWithLeadingZeros } from '@/composables/useUtils'
  import { capitalize, computed, ref } from 'vue'
  import type { Pokemon } from 'pokenode-ts'

  const props = defineProps<{
    pokemon: Partial<Pokemon>
  }>()

  const shinyForm = ref(false)

  const toggleShiny = () => {
    shinyForm.value = !shinyForm.value
  }

  const pokemonImage = computed(() => {
    const sprites = props.pokemon.sprites as any // Bypass TypeScript checking here

    return shinyForm.value
      ? sprites?.other?.['official-artwork']?.front_shiny
      : sprites?.other?.['official-artwork']?.front_default
  })

  const pokemonTypePath = (typeName: string) => {
    return new URL(`/src/assets/svgs/types/${typeName}.svg`, import.meta.url).href
  }

  const checkTypes = (types: { type: { name: string } }[] | undefined) => {
    if (!types) return {}
    if (types.length === 2) {
      return {
        background: `linear-gradient(var(--color-type-${types[0].type.name}), var(--color-type-${types[1].type.name}))`,
      }
    } else {
      return {
        background: `var(--color-type-${types[0].type.name})`,
      }
    }
  }
</script>

<template>
  <v-card
    class="pokemon-card pa-3 elevation-2 cursor-pointer pokemon-font"
    :style="checkTypes(props.pokemon.types)"
    @click="$emit('show-details' as 'showDetails', props.pokemon.name)"
  >
    <v-card-title class="d-flex justify-space-between align-center pokemon-font">
      <span>{{ padWithLeadingZeros(props.pokemon.id!, 3) }}</span>
      <v-btn icon @click.stop="toggleShiny">
        <v-icon>mdi-star</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-subtitle class="d-flex justify-center">
      <transition name="fade">
        <v-img
          :key="pokemonImage"
          :alt="props.pokemon.name || 'Pokemon Image'"
          class="mx-auto"
          loading="lazy"
          max-width="150"
          :src="pokemonImage"
        />
      </transition>
    </v-card-subtitle>
    <v-card-text class="text-center pokemon-font">
      <h3>{{ capitalize(props.pokemon.name || '') }}</h3>
      <div class="d-flex justify-center">
        <div
          v-for="type in props.pokemon.types || []"
          :key="type.type.name"
          class="type-icon ma-1"
          :style="{ backgroundColor: `var(--color-type-${type.type.name}-icon)` }"
        >
          <img
            :alt="type.type.name"
            class="type-img"
            :src="pokemonTypePath(type.type.name)"
          >
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
@import '@/styles/settings';

.pokemon-card {
  transition: transform 0.3s ease-out;
}
.pokemon-card:hover {
  transform: scale(1.05);
}
.cursor-pointer {
  cursor: pointer;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.abilities {
  text-align: center;
}
.v-card-subtitle {
  opacity: unset;
}

.type-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.type-img {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
