<script setup lang="ts">
  import { onMounted } from 'vue';
  import Cards from '@/components/Cards/Cards.vue';
  import Modal from './components/Modal/Modal.vue';
  import { usePokemonStore } from '@/stores/Pokemon';
  import { fetchPokemonsData } from './services/fetchPokemons';
  import { useModalStore } from '@/stores/Modal';
  import { storeToRefs } from 'pinia';

  const pokemonsData = usePokemonStore().pokemonList;

  const modalStore = useModalStore();
  const { isOpen, pokemonData } = storeToRefs(modalStore);
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

  .modal-bg
    position fixed
    top 0
    left 0
    width 100vw
    height 100vh
    background-color rgba(0,0,0,.5)
    display flex
    justify-content center
    align-items center

  .modal
    position relative
    background white
    color black
    padding 50px 100px
    border-radius 5px
    box-shadow 0px 10px 5px 2px rgba(0,0,0,.1)
   .close-btn
    position absolute
    top 10px
    right 10px
    color black
    background none
    border none
    cursor pointer

  .modal-enter-active,
  .modal-leave-active
    transition all .25s ease

  .modal-enter-from,
  .modal-leave-to
    opacity 0
    transform scale(1.1)
</style>
