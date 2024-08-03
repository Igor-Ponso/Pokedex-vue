<!-- src/components/PokemonCard.vue -->
<script lang="ts" setup>
/**
 * Component template for Cards.
 * @name 'Cards'
 * @see App
 * @version 1.0.0
 */
  import { computed, ref } from 'vue'
  import type { Pokemon } from 'pokenode-ts'

  const props = defineProps<{
    pokemon: Pokemon;
  }>()

  const shinyForm = ref(false)

  const toggleShiny = () => {
    shinyForm.value = !shinyForm.value
  }

  const pokemonImage = computed(() => {
    return shinyForm.value
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${props.pokemon.id}.png`
      : props.pokemon.sprites.other['official-artwork'].front_default
  })

  const pokemonTypePath = (type_name: string) => {
    return new URL(`/src/assets/svgs/type/${type_name}.svg`, import.meta.url).href
  }

  const checkTypes = (types: number) => {
    if (types === 2) {
      return {
        background: `linear-gradient(var(--color-${props.pokemon.types[0].type.name}), var(--color-${props.pokemon.types[1].type.name}))`,
      }
    } else {
      return {
        background: `linear-gradient(var(--color-${props.pokemon.types[0].type.name}), var(--color-${props.pokemon.types[0].type.name}))`,
      }
    }
  }

</script>

<template>
  <v-card class="pa-3" elevation="2" :style="checkTypes(props.pokemon.types.length)">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ props.pokemon.id }}</span>
      <v-btn icon @click.stop="toggleShiny">
        <v-icon>mdi-star</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-subtitle class="d-flex justify-center">
      <v-img
        :alt="props.pokemon.name"
        class="mx-auto"
        max-width="150"
        :src="pokemonImage"
      />
    </v-card-subtitle>
    <v-card-text class="text-center">
      <h3>{{ props.pokemon.name }}</h3>
      <div class="d-flex justify-center">
        <v-chip
          v-for="item in props.pokemon.types"
          :key="item.type.url"
          class="ma-1"
          :color="`var(--color-type-${item.type.name})`"
          dark
        >
          <v-img
            alt=""
            class="shrink-0"
            contain
            max-height="24"
            max-width="24"
            :src="pokemonTypePath(item.type.name)"
          />
          {{ item.type.name }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.card {
  height: 17.5rem;
  width: 12.5rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  user-select: none;
  cursor: pointer;
  transition: all 0.3s ease-out;
}

.card:hover {
  transform: scale(1.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
}

.card-image {
  height: 9.375rem;
}

.card-type,
.shiny-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
}

.card-type-item {
  width: 1.25rem;
  height: 1.25rem;
}

.shiny-btn {
  width: 1.5rem;
  height: 1.5rem;
  padding: 0.2rem;
  background: var(--color-white-2);
}

.pokemon_data {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  gap: 0.5rem;
}

.pokemon_type {
  display: flex;
  gap: 0 20px;
  justify-content: center;
}
</style>
