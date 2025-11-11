<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  text: 'Carregando...'
});

const sizeClasses = {
  small: 'w-8 h-8',
  medium: 'w-16 h-16',
  large: 'w-24 h-24'
};
</script>

<template>
  <div class="loading-container">
    <div class="pokeball-loader" :class="sizeClasses[size]">
      <div class="pokeball-top"></div>
      <div class="pokeball-center"></div>
      <div class="pokeball-bottom"></div>
    </div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.pokeball-loader {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  animation: bounce 1.5s infinite ease-in-out;
}

.pokeball-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 48%;
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  border-radius: 50% 50% 0 0;
}

.pokeball-center {
  position: absolute;
  top: 48%;
  left: 50%;
  transform: translateX(-50%);
  width: 20%;
  height: 4%;
  background: #000;
  z-index: 2;
}

.pokeball-center::after {
  content: '';
  position: absolute;
  top: -200%;
  left: 50%;
  transform: translateX(-50%);
  width: 150%;
  height: 400%;
  background: #fff;
  border-radius: 50%;
  border: 2px solid #000;
  z-index: 3;
}

.pokeball-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48%;
  background: linear-gradient(135deg, #ffffff 0%, #cccccc 100%);
  border-radius: 0 0 50% 50%;
}

.loading-text {
  font-family: var(--primary-font);
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(-5deg);
  }
  50% {
    transform: translateY(0) rotate(0deg);
  }
  75% {
    transform: translateY(-5px) rotate(5deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

.w-8 {
  width: 2rem;
}

.h-8 {
  height: 2rem;
}

.w-16 {
  width: 4rem;
}

.h-16 {
  height: 4rem;
}

.w-24 {
  width: 6rem;
}

.h-24 {
  height: 6rem;
}
</style>