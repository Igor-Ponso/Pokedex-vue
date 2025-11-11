<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

interface Props {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  position: 'top-right'
});

const isVisible = ref(false);
let timeoutId: ReturnType<typeof setTimeout> | null = null;

const showToast = () => {
  isVisible.value = true;
  
  // Auto-hide after duration
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  
  timeoutId = setTimeout(() => {
    isVisible.value = false;
    timeoutId = null;
  }, props.duration);
};

const hideToast = () => {
  isVisible.value = false;
  
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
};

// Expose methods to parent
defineExpose({
  show: showToast,
  hide: hideToast
});

// Keyboard shortcut to hide
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    hideToast();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});
</script>

<template>
  <Teleport to="toast">
    <Transition name="toast">
      <div 
        v-if="isVisible" 
        class="toast-container"
        :class="[`toast-${props.type}`, `toast-${props.position}`]"
      >
        <div class="toast-icon">
          <span v-if="props.type === 'success'">✅</span>
          <span v-else-if="props.type === 'error'">❌</span>
          <span v-else-if="props.type === 'warning'">⚠️</span>
          <span v-else>ℹ️</span>
        </div>
        <div class="toast-message">{{ props.message }}</div>
        <button class="toast-close" @click="hideToast">✕</button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 400px;
  border-left: 4px solid;
}

/* Type-specific styles */
.toast-success {
  border-color: #4caf50;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(76, 175, 80, 0.7));
}

.toast-error {
  border-color: #f44336;
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.9), rgba(244, 67, 54, 0.7));
}

.toast-warning {
  border-color: #ff9800;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.9), rgba(255, 152, 0, 0.7));
}

.toast-info {
  border-color: #2196f3;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.9), rgba(33, 150, 243, 0.7));
}

/* Position-specific styles */
.toast-top-right {
  top: 1rem;
  right: 1rem;
}

.toast-top-center {
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.toast-bottom-right {
  bottom: 1rem;
  right: 1rem;
}

.toast-bottom-center {
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.toast-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.toast-message {
  color: white;
  font-family: var(--primary-font);
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  flex: 1;
}

.toast-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 0.8rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: auto;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-enter-to {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 768px) {
  .toast-container {
    max-width: 90%;
    padding: 0.8rem 1rem;
  }
}
</style>