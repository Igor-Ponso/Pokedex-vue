/**
 * Composable para efeito holográfico em cards
 * Segue Single Responsibility Principle - apenas gerencia efeito holográfico
 */

import { ref } from 'vue';

export const useCardHolographic = () => {
  const isHovered = ref(false);
  const holoX = ref(50);
  const holoY = ref(50);
  const rotateX = ref(0);
  const rotateY = ref(0);

  const handleMouseMove = (e: MouseEvent, element: HTMLElement | null) => {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert mouse position to percentage
    holoX.value = (x / rect.width) * 100;
    holoY.value = (y / rect.height) * 100;

    // Calculate 3D rotation based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    rotateY.value = ((x - centerX) / centerX) * 10; // -10 to 10 degrees
    rotateX.value = ((centerY - y) / centerY) * 10; // -10 to 10 degrees
  };

  const handleMouseEnter = () => {
    isHovered.value = true;
  };

  const handleMouseLeave = () => {
    isHovered.value = false;
    holoX.value = 50;
    holoY.value = 50;
    rotateX.value = 0;
    rotateY.value = 0;
  };

  const getTransformStyle = () => {
    if (!isHovered.value) {
      return 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)';
    }
    return `translateY(-12px) scale(1.03) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg)`;
  };

  return {
    isHovered,
    holoX,
    holoY,
    rotateX,
    rotateY,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    getTransformStyle
  };
};
