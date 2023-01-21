<script></script>

<script setup lang="ts">
  /**
   * Component template for Cards.
   * @name 'Cards'
   * @see App
   * @version 1.0.0
   */
  import { ref, computed } from 'vue';
  import { Pokemon } from '@/interfaces/Pokemon';
  
  const props = defineProps<{
    pokemon: Pokemon;
  }>();

  const pokemonTypePath = (type_name: string) => {
    return new URL(`/src/assets/svgs/type/${type_name}.svg`, import.meta.url)
      .href;
  };

  const checkTypes = (types: number) => { 
    if (types === 2) {
      return {
        background: `linear-gradient(var(--color-${props.pokemon.types[0].type.name}), 
        var(--color-${props.pokemon.types[1].type.name}))`,
      };
    } else {
      return {
        background: `linear-gradient(var(--color-${props.pokemon.types[0].type.name}), 
        var(--color-${props.pokemon.types[0].type.name}))`,
      };
    }
  };

  const padWithLeadingZeros = (num: number, totalLength: number) => {
    return String(num).padStart(totalLength, '0');
  };

  const shinyUrl =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/';
  const shinyForm = ref(false);
</script>

<template>
  <div
    class="card"
    ref="cardTarget"
    :style="checkTypes(props.pokemon.types.length)"
  >
    <div class="card-header">
      <span>{{ padWithLeadingZeros(props.pokemon.id, 3) }}</span>
      <v-icon
        name="bi-stars"
        @click.stop="shinyForm = !shinyForm"
        animation="wrench"
        speed="slow"
        hover
        fill="var(--color-white-default)"
        class="shiny-btn"
      />
    </div>
    <img
      :src="
        !shinyForm
          ? props.pokemon.sprites.other['official-artwork'].front_default
          : `${shinyUrl}${pokemon.id}.png`
      "
      alt=""
      class="card-image"
    />
    <div class="pokemon_data">
      {{ pokemon.name }}
      <div class="pokemon_type">
        <div
          v-for="item in props.pokemon.types"
          :key="item.type.url"
          class="card-type"
          :style="{
            background: `var(--color-type-${item.type.name})`,
            boxShadow: `0 0 20px var(--color-type-${item.type.name})`,
          }"
        >
          <img
            :src="pokemonTypePath(item.type.name)"
            alt=""
            class="card-type-item"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="stylus">

  .card
    height 17.5rem
    width 12.5rem
    border-radius 1rem
    padding 1rem
    display flex
    flex-direction column
    justify-content space-between;
    color #252a41
    text-transform: capitalize;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    cursor pointer
    transition: all 0.3s ease-out

    &:hover
      transform scale(1.1)
   
  .card-header
    display flex
    justify-content space-between

  .card-image
    height: 9.375rem;

  .card-type,
  .shiny-btn
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-align-content: center;
    align-content: center;
    -webkit-align-items: center;
    align-items: center;

  .card-type-item
    width: 1.25rem;
    height: 1.25rem;

  .shiny-btn
    width 1.5rem
    height 1.5rem
    padding .2rem
    background var(--color-white-2);
  .pokemon_data
    display flex
    flex-direction column
    justify-content space-evenly;
    gap: 1.25rem;

  .pokemon_type
    display flex
    grid-gap: 0 10px;
    grid-gap: 0 20px;
    gap: 0 20px;
    -webkit-justify-content: center;
    justify-content: center;
</style>
