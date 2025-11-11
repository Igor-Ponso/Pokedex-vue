<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const { locale, availableLocales } = useI18n();

const currentLocale = computed({
  get: () => locale.value,
  set: (value) => {
    locale.value = value;
    localStorage.setItem('userLanguage', value);
  }
});

const languages = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'pt', label: 'PT', flag: '🇧🇷' }
];

const toggleLanguage = () => {
  currentLocale.value = currentLocale.value === 'en' ? 'pt' : 'en';
};
</script>

<template>
  <div class="language-selector">
    <button
      class="lang-toggle"
      @click="toggleLanguage"
      :aria-label="`Switch to ${currentLocale === 'en' ? 'Portuguese' : 'English'}`"
    >
      <span class="lang-flag">{{ currentLocale === 'en' ? '🇺🇸' : '🇧🇷' }}</span>
      <span class="lang-code">{{ currentLocale.toUpperCase() }}</span>
      <span class="lang-arrow">⇄</span>
    </button>
  </div>
</template>

<style scoped>
.language-selector {
  display: flex;
  align-items: center;
}

.lang-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  font-family: var(--retro-font);
  font-size: 0.6rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

.lang-flag {
  font-size: 1.2rem;
  line-height: 1;
}

.lang-code {
  font-weight: 700;
  letter-spacing: 0.1em;
}

.lang-arrow {
  font-size: 0.8rem;
  opacity: 0.7;
  transition: transform 0.3s ease;
}

.lang-toggle:hover .lang-arrow {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .lang-toggle {
    padding: 0.5rem 0.8rem;
    font-size: 0.55rem;
  }

  .lang-flag {
    font-size: 1rem;
  }
}
</style>
