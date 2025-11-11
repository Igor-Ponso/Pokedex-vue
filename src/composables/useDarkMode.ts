import { ref, watch, onMounted } from 'vue';
import { usePreferredDark, useStorage } from '@vueuse/core';

export function useDarkMode() {
  const prefersDark = usePreferredDark();
  const isDark = useStorage('darkMode', prefersDark.value);

  const toggleDarkMode = () => {
    isDark.value = !isDark.value;
  };

  const applyDarkMode = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  watch(isDark, (newValue) => {
    applyDarkMode(newValue);
  }, { immediate: true });

  onMounted(() => {
    applyDarkMode(isDark.value);
  });

  return {
    isDark,
    toggleDarkMode
  };
}
