<script setup lang="ts">
  import { Pokemon } from '@/interfaces/Pokemon';

  const props = defineProps<{
    pokemon: Pokemon;
  }>();

  const pokemonGifPath = (id: number) => {
    return `/PokeApi-vue/public/svgs/pokemons/${id}.svg`;
  };

  const pokemonTypePath = (type_name: string) => {
    return `/PokeApi-vue/public/svgs/type/${type_name}.svg`;
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
</script>

<template>
  <div class="card" :style="checkTypes(props.pokemon.types.length)">
    <div class="card-header">
      <span>{{ props.pokemon.id }}</span>
      <button>Shiny</button>
    </div>
    <img :src="pokemonGifPath(pokemon.id)" alt="" class="card-image" />

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
  .card-header
    display flex
    justify-content space-between

  .card-image
    height: 150px;

  .card-type
    width: 40px;
    height: 40px;
    border-radius: 100%;
    background red
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-align-content: center;
    align-content: center;
    -webkit-align-items: center;
    align-items: center;

  .card-type-item
    width: 20px;
    height: 20px;

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
