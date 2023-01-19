<script setup lang="ts">
  /**
   * Component template for Cards.
   * @name 'Modal'
   * @see Card.vue
   * @version 1.0.0
   */

  import { ref } from 'vue';
  import { useModalStore } from '@/stores/Modal';
  import { usePokemonStore } from '@/stores/Pokemon';
  import { storeToRefs } from 'pinia';
  import { onClickOutside } from '@vueuse/core';

  const modalStore = useModalStore();
  const pokemonStore = usePokemonStore();
  const { isOpen, pokemonData } = storeToRefs(modalStore);
  const { pokemonEntries } = storeToRefs(pokemonStore);
  const modal = ref(null);

  onClickOutside(modal, () => (isOpen.value = false));
 
</script>

<template>
  <Transition name="modal">
    <div class="modal-bg" v-if="isOpen">
      <div class="modal" ref="modal">
        <button @click="isOpen = false" class="close-btn">X</button>
        <p>{{ pokemonData.name }}</p>
        <img :src="pokemonData.sprites.other.home.front_shiny" alt="" />
        <img :src="pokemonData.sprites.front_default" />
        <img :src="pokemonData.sprites.front_shiny" />
      </div>
    </div>
  </Transition>
</template>

<style lang="stylus" scoped>
  .modal-bg
    position fixed
    top 0
    left 0
    width 100%
    height 100%
    background-color rgba(0,0,0, 0.6)
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