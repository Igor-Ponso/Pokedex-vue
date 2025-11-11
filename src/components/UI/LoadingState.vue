<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  loading?: boolean;
  text?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'pokemon' | 'api' | 'initial';
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  text: '',
  size: 'medium',
  type: 'pokemon'
});

const sizeClasses = computed(() => {
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };
  
  return sizes[props.size] || sizes.medium;
});

const typeClasses = computed(() => {
  const types = {
    pokemon: 'border-blue-500',
    api: 'border-gray-500',
    initial: 'border-purple-500'
  };
  
  return types[props.type] || types.pokemon;
});
</script>

<template>
  <div class="loading-overlay" v-if="loading">
    <div class="loading-container" :class="[sizeClasses, typeClasses]">
      <div class="loading-spinner">
        <div class="pokeball">
          <div class="pokeball-top"></div>
          <div class="pokeball-center"></div>
          <div class="pokeball-bottom"></div>
        </div>
      </div>
      <p v-if="text" class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.loading-spinner {
  position: relative;
}

.pokeball {
  width: 3rem;
  height: 3rem;
  position: relative;
  animation: bounce 1.5s infinite ease-in-out;
}

.pokeball-top {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 45%;
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  border-radius: 1.5rem 1.5rem 0 0;
}

.pokeball-center {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
  width: 30%;
  height: 20%;
  background: #000;
  border-radius: 50%;
  z-index: 2;
}

.pokeball-bottom {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 60%;
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  border-radius: 0 0 1.5rem 1.5rem;
}

.loading-text {
  font-family: var(--primary-font);
  font-size: 1rem;
  font-weight: 500;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
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
    transform: translateY(-10px) rotate(5deg);
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

/* Size variations */
.w-8.h-8 {
  width: 2rem;
  height: 2rem;
}

.w-12.h-12 {
  width: 3rem;
  height: 3rem;
}

.w-16.h-16 {
  width: 4rem;
  height: 4rem;
}

/* Type variations */
.border-blue-500 {
  border-color: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.border-gray-500 {
  border-color: #6b7280;
  box-shadow: 0 0 20px rgba(107, 114, 128, 0.3);
}

.border-purple-500 {
  border-color: #8b5cf6;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .loading-overlay {
    background: rgba(0, 0, 0, 0.9);
  }
  
  .loading-container {
    background: rgba(30, 30, 30, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .loading-text {
    color: rgba(255, 255, 255, 0.9);
  }
}
</style>