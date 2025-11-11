<script setup lang="ts">
import { Pokemon } from '@/interfaces/Pokemon';
import { PokemonEntries } from '@/interfaces/PokemonEntries';
import { computed } from 'vue';

const props = defineProps<{
  pokemonData: Pokemon;
  pokemonEntries?: PokemonEntries;
}>();

const padWithLeadingZeros = (num: number, totalLength: number) => {
  return String(num).padStart(totalLength, '0');
};

const flavorText = computed(() => {
  if (!props.pokemonEntries?.flavor_text_entries) return 'Descrição não disponível';

  // Procura por texto em inglês
  const englishEntry = props.pokemonEntries.flavor_text_entries.find(
    entry => entry.language?.name === 'en'
  );

  return englishEntry?.flavor_text || props.pokemonEntries.flavor_text_entries[0]?.flavor_text || 'Descrição não disponível';
});
</script>

<template>
  <article id="pokemon_container">
    <div class="pokemon_number">
      #{{ padWithLeadingZeros(pokemonData.id, 3) }}
    </div>
    <div class="pokemon_info">
      <div class="pokemon_data">
        <div>
          <h2 class="pokemon-name">{{ pokemonData.name }}</h2>
          <div class="pokemon-types">
            <span
              v-for="type in pokemonData.types"
              :key="type.type.name"
              class="type-badge"
              :style="{ background: `var(--color-type-${type.type.name})` }"
            >
              {{ type.type.name }}
            </span>
          </div>
          <p>{{ $t('pokemon.weight') }} {{ pokemonData.weight / 10 }}KG</p>
          <p>{{ $t('pokemon.height') }} {{ pokemonData.height / 10 }}M</p>
          <div class="pokemon_abilities">
            {{ $t('pokemon.abilities') }}
            <div>
              <span v-for="(ability, index) in pokemonData.abilities" :key="ability.ability.name">
                {{ ability.ability.name }}{{ index < pokemonData.abilities.length - 1 ? ', ' : '' }}
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
    <div class="pokemon-description">
      <p>{{ flavorText }}</p>
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

  .pokemon-name
    font-size 2rem
    font-weight 700
    text-transform capitalize
    margin 0 0 1rem 0

  .pokemon-types
    display flex
    gap 0.5rem
    margin-bottom 1rem

  .type-badge
    padding 0.4rem 0.8rem
    border-radius 0.5rem
    color white
    font-weight 600
    text-transform uppercase
    font-size 0.8rem
    text-shadow 0 1px 2px rgba(0,0,0,0.5)

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
    opacity 0.1

  .pokemon-description
    margin-top 2rem
    padding 1rem
    background rgba(255, 255, 255, 0.1)
    border-radius 0.8rem

    p
      line-height 1.6
      font-size 1rem
</style>
