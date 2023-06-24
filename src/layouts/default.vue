<script setup lang="ts">
  /**
   * Help Layout.
   * @name 'LayoutDefault'
   * @version 1.0.0
   * @note
   * Please be aware this is a
   * template proposal for the
   * default layout
   */
</script>

<template>
  <v-app>
    <v-main>
      <v-container :class="['fill-height']">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>
