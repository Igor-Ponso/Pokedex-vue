<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import Cards from '@/components/Cards/Cards.vue';
  import Modal from './components/Modal/Modal.vue';
  import { usePokemonStore } from '@/stores/Pokemon';
  import { fetchPokemonsData } from '@/services/Pokemon';
  import { useModalStore } from '@/stores/Modal';
  import { storeToRefs } from 'pinia';

  //TODO: implement virtualList with Infinite Scrolling
  //import { useVirtualList } from '@vueuse/core';

  const pokemonsData = usePokemonStore().pokemonList;

  const modalStore = useModalStore();
  const { isOpen, pokemonData, pokemonId } = storeToRefs(modalStore);
  onMounted(fetchPokemonsData);
</script>

<template>
  <h1>{{ $t('greetings') }}</h1>
  <div id="card-area">
    <template v-for="pokemon in pokemonsData" :key="pokemon.id">
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
