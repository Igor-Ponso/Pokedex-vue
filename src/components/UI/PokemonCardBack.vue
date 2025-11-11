<script setup lang="ts">
/**
 * Componente para mostrar a parte de trás da carta Pokemon durante o loading
 * Usa a imagem oficial do Pokemon TCG
 */
</script>

<template>
  <div class="card-back">
    <img
      src="https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg"
      alt="Pokemon card back"
      class="card-back-image"
    />
  </div>
</template>

<style scoped>
.card-back {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;
}

.card-back-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 1.5rem;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.02);
    opacity: 1;
  }
}
</style>
