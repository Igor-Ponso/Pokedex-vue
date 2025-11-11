import { ref, watch, type Ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';

export function useDebounce<T>(value: Ref<T>, delay = 500) {
  const debouncedValue = ref<T>(value.value) as Ref<T>;

  const updateDebouncedValue = useDebounceFn((newValue: T) => {
    debouncedValue.value = newValue;
  }, delay);

  watch(value, (newValue) => {
    updateDebouncedValue(newValue);
  });

  return {
    debouncedValue
  };
}
