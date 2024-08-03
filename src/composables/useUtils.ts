// src/composables/useUtils.ts

export const padWithLeadingZeros = (num: number, totalLength: number) => {
  return String(num).padStart(totalLength, '0')
}
