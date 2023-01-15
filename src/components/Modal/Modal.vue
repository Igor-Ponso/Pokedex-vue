<script setup lang="ts">
  /**
   * Component template for Cards.
   * @name 'Modal'
   * @see Card.vue
   * @version 1.0.0
   */
  import { Pokemon } from '@/interfaces/Pokemon';
  import { useModalStore } from '@/stores/Modal'

  const isOpen = useModalStore().isOpen;
  const props = defineProps<{
    pokemon: Pokemon;
  }>();
</script>

<template>
  <div class="root">
    <teleport to="body">
      <div class="modal" v-if="isOpen">
        <div>
          <h2>{{ props.pokemon.name }}</h2>
          <button @click="isOpen = false">Close</button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style lang="stylus" scoped>
  .root
      position relative

  .modal
      position absolute
      top 0
      left 0
      background-color rgba(0,0,0, .1)
      width 100%
      height 100%
      display flex
      justify-content center
      align-items center
      & > div
        background-color #fff
        color #000
        padding 50px
        border-radius 10px
</style>
