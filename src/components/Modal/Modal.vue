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
  import PokemonInfo from './PokemonInfo.vue';

  const modalStore = useModalStore();
  const { isOpen, pokemonData, pokemonId } = storeToRefs(modalStore);
  const pokemonStore = usePokemonStore();
  const { pokemonEntries } = storeToRefs(pokemonStore);

  const modal = ref(null);

  onClickOutside(modal, () => (isOpen.value = false));
</script>

<template>
  <Transition name="modal">
    <div class="modal-bg" v-if="isOpen">
      <div
        class="modal"
        ref="modal"
        :style="{
          background: `linear-gradient(var(--color-${pokemonData.types[0].type.name}), var(--color-type-${pokemonData.types[0].type.name}))`,
        }"
      >
        <button @click="isOpen = false" class="close-btn">X</button>
        <PokemonInfo
          :pokemon-data="pokemonData"
          :pokemon-entries="pokemonEntries[pokemonId - 1]"
        />
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
    height 70%
    width 90%
    max-width 1200px
    max-height 700px
    position relative
    color var(--color-white-default)
    text-shadow: 5px 3px 9px rgba(0,0,0,0.5)
    padding 2rem
    border-radius 10px
    box-shadow 0px 10px 5px 2px rgba(0,0,0,.1)
   .close-btn
    position absolute
    top 10px
    right 10px
    width 2rem
    height 2rem
    font-size 1rem
    border-radius 50%
    background var(--color-white-2)
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
