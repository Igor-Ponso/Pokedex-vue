<script setup lang="ts">
  import { Pokemon } from '@/interfaces/Pokemon';
  import { PokemonEntries } from '@/interfaces/PokemonEntries';

const props = defineProps<{
  pokemonData: Pokemon;
  pokemonEntries: PokemonEntries;
}>();

const padWithLeadingZeros = (num: number, totalLength: number) => {
  return String(num).padStart(totalLength, '0');
};
</script>

<template>
  <article id="pokemon_container">
    <div class="pokemon_number">
      #{{ padWithLeadingZeros(pokemonData.id, 3) }}
    </div>
    <div class="pokemon_info">
      <div class="pokemon_data">
        <div>
          <p>{{ pokemonData.name }}</p>
          <!-- <p>{{ pokemonData.types }}</p> -->
          <p>{{ $t('pokemon.weight') }} {{ pokemonData.weight / 10 }}KG</p>
          <p>{{ $t('pokemon.height') }} {{ pokemonData.height / 10 }}M</p>
          <div class="pokemon_abilities">
            {{ $t('pokemon.abilities') }}
            <div>
              <span v-for="(ability, index) in pokemonData.abilities" :key="ability.ability.name">
                {{ ability.ability.name }}
              </span>
            </div>
          </div>
        </div>
        <div class="pokemon_stats">
          <span>{{ $t('pokemon.stats') }}</span>
          <div class="stats_info">
            <div v-for="(stat, index) in pokemonData.stats" :key="stat.stat.name">
              <span>{{ stat.stat.name.toUpperCase() }}</span>
              <span>{{ stat.base_stat }}</span>
            </div>
          </div>
        </div>
      </div>
      <img :src="pokemonData.sprites.other['official-artwork'].front_default" alt="" class="pokemon_image" />
    </div>
    <div>
      {{ pokemonEntries.flavor_text_entries[9].flavor_text }}
      <!-- {{ pokemonEntries[pokemonId - 1].evolution_chain }} -->
    </div>
  </article>
</template>

<style lang="stylus" scoped>

  .pokemon_info
    display flex
    justify-content: space-evenly
    align-items center
    flex-wrap wrap
    position relative
  .pokemon_image
    width: 100%
    height: auto
    max-width: 500px
  .pokemon_data
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

  .pokemon_abilities
    display flex
    justify-content space-around
  .pokemon_stats
    display flex
    align-items center
    gap .5rem
  .stats_info
    display: flex
    flex-direction: column
    gap: 0.5rem
    flex-grow: 1
    > div
      display flex
      justify-content space-between
      flex-gap .5rem

  .pokemon_number
    position absolute
    top 20%
    left 10%
    text-align center
    width 100%
    color var(--color-white-2)
    font-family Montserrat
    font-weight 900
    text-shadow none
    font-size 20rem
    z-index 0
</style>
