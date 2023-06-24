<script setup lang="ts">
  /**
   * Page to render a virtual list with scroll.
   * @name 'PokemonListPage'
   * @version 1.0.0
   */
  import { storeToRefs } from 'pinia';

  import { usePokemonStore } from '@/stores/Pokemon';
  import { useModalStore } from '@/stores/Modal';
  const modalStore = useModalStore();
  const { isOpen, pokemonData, pokemonId } = storeToRefs(modalStore);

  const pokemonStore = usePokemonStore();
  const { pokemonList } = storeToRefs(pokemonStore);

  const fetchPokemon = async (): Promise<void> => {
    await pokemonStore.fetchPokemonList();
  };

  onMounted(fetchPokemon);
</script>

<template>
  <h1>{{ $t('greetings') }}</h1>
  <div id="card-area">
    <template v-for="pokemon in pokemonList" :key="pokemon.id">
      <Cards
        :pokemon="pokemon"
        @click="
          isOpen = true;
          pokemonData = pokemon;
          pokemonId = pokemon.id;
        "
      />
    </template>

    <Teleport to="#modal">
      <Modal></Modal>
    </Teleport>
  </div>
</template>

<style lang="stylus" scoped>
  #card-area
    display inline-flex
    flex-wrap wrap
    justify-content center
    gap: 3rem;
</style>
