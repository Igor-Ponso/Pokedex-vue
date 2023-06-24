<script setup lang="ts">
  /**
   * First page after App->router-view.
   * @name 'IndexPage'
   * @version 1.0.0
   */
  import { useHead } from '@vueuse/head';

  useHead({
    title: 'PokéDex Vite Pinia',
    meta: [
      {
        name: 'description',
        content: 'Pokedex made with Vue + Typescript + Pinia + Vite',
      },
    ],
  });

  const router = useRouter();
  onMounted(() => {
    router.push('/pokemonList');
  });
</script>

<template>
  <router-view />
</template>

<style scoped></style>

<route lang="yaml">
meta:
  layout: default
</route>
