<script setup lang="ts">
  /**
   * Component template for Cards.
   * @name 'Modal'
   * @see Card.vue
   * @version 1.0.0
   */

  import { ref } from 'vue';
  import { useModalStore } from '@/stores/Modal';
  import { storeToRefs } from 'pinia';
  import { onClickOutside } from '@vueuse/core';

  const modalStore = useModalStore();
  const { isOpen, pokemonData } = storeToRefs(modalStore);
  const modal = ref(null);

  onClickOutside(modal, () => (isOpen.value = false));
</script>

<template>
  <Transition name="modal">
    <div class="modal-bg" v-if="isOpen">
      <div class="modal" ref="modal">
        <button @click="isOpen = false" class="close-btn">X</button>
        <p>{{ pokemonData.name }}</p>
      </div>
    </div>
  </Transition>
</template>

<style lang="stylus" scoped>
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
