<!-- src/components/PokemonCard.vue -->
<script lang="ts" setup>
  import { padWithLeadingZeros } from '@/composables/useUtils'
  import { capitalize } from 'vue'

  type PokemonType =
    | 'normal'
    | 'fire'
    | 'water'
    | 'electric'
    | 'grass'
    | 'ice'
    | 'fighting'
    | 'poison'
    | 'ground'
    | 'flying'
    | 'psychic'
    | 'bug'
    | 'rock'
    | 'ghost'
    | 'dragon'
    | 'dark'
    | 'steel'
    | 'fairy';

  interface OfficialArtwork {
    front_default: string | null;
    front_shiny: string | null;
  }

  interface PokemonSprites {
    front_default: string | null;
    front_shiny: string | null;
    other: {
      'official-artwork': OfficialArtwork;
      home: {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
  }

  interface Pokemon {
    id: number;
    name: string;
    image: string;
    types: PokemonType[];
    abilities: string[];
    sprites: PokemonSprites;
  }

  const props = defineProps<{
    pokemon: Pokemon;
  }>()

  const shinyForm = ref(false)

  const toggleShiny = () => {
    shinyForm.value = !shinyForm.value
  }

  const pokemonImage = computed(() => {
    const sprites = props.pokemon.sprites

    if (shinyForm.value) {
      return (
        sprites.other['official-artwork'].front_shiny ||
        sprites.other.home.front_shiny ||
        sprites.front_shiny ||
        props.pokemon.image
      )
    } else {
      return (
        sprites.other['official-artwork'].front_default ||
        sprites.other.home.front_default ||
        sprites.front_default ||
        props.pokemon.image
      )
    }
  })

  const pokemonTypePath = (typeName: PokemonType) => {
    return new URL(`/src/assets/svgs/type/${typeName}.svg`, import.meta.url).href
  }

  const typeColors: Record<PokemonType, string> = {
    normal: '#a0a29f',
    fire: '#ffb971',
    water: '#8cc4e2',
    electric: '#ffe662',
    grass: '#78dd81',
    ice: '#8cf5e4',
    fighting: '#da7589',
    poison: '#d881ef',
    ground: '#e69a74',
    flying: '#99ccff',
    psychic: '#f57ec3',
    bug: '#bfe760',
    rock: '#c9bb8a',
    ghost: '#8291e0',
    dragon: '#88a2e8',
    dark: '#8e8c94',
    steel: '#9fb8b9',
    fairy: '#ee90e6',
  }

  const checkTypes = (types: PokemonType[]) => {
    if (types.length === 2) {
      return {
        background: `linear-gradient(${typeColors[types[0]]}, ${typeColors[types[1]]})`,
      }
    } else {
      return {
        background: typeColors[types[0]],
      }
    }
  }
</script>

<template>
  <v-card
    class="pokemon-card pa-3 elevation-2 cursor-pointer"
    :style="checkTypes(props.pokemon.types)"
  >
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ padWithLeadingZeros(props.pokemon.id, 3) }}</span>
      <v-btn icon @click.stop="toggleShiny">
        <v-icon>mdi-star</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-subtitle class="d-flex justify-center">
      <transition name="fade">
        <v-img
          :key="pokemonImage"
          :alt="props.pokemon.name"
          class="mx-auto"
          loading="lazy"
          max-width="150"
          :src="pokemonImage"
        />
      </transition>
    </v-card-subtitle>
    <v-card-text class="text-center">
      <h3>{{ capitalize(props.pokemon.name) }}</h3>
      <div class="d-flex justify-center">
        <v-chip
          v-for="type in props.pokemon.types"
          :key="type"
          class="ma-1"
          :color="typeColors[type]"
          dark
        >
          <v-img
            alt=""
            class="shrink-0"
            contain
            loading="lazy"
            max-height="24"
            max-width="24"
            :src="pokemonTypePath(type)"
          />
          {{ type }}
        </v-chip>
      </div>
      <div class="abilities mt-2">
        <strong>Abilities:</strong>
        <div v-for="ability in props.pokemon.abilities" :key="ability">
          {{ capitalize(ability) }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
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
</style>
