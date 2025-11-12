<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { TCGCard } from '@/services/PokemonTCGService';

interface Props {
  card: TCGCard;
  pokemonName: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

// Estados para efeitos holográficos
const cardElement = ref<HTMLElement | null>(null);
const isInteracting = ref(false);
const pointerX = ref(50);
const pointerY = ref(50);
const rotateX = ref(0);
const rotateY = ref(0);
const scale = ref(1);

// Calcula variáveis CSS dinâmicas para efeitos holográficos
const cardStyle = computed(() => {
  const centerDistance = Math.sqrt(
    Math.pow(pointerX.value - 50, 2) + Math.pow(pointerY.value - 50, 2)
  ) / 50;

  return {
    '--pointer-x': `${pointerX.value}%`,
    '--pointer-y': `${pointerY.value}%`,
    '--pointer-from-center': Math.min(centerDistance, 1),
    '--pointer-from-top': pointerY.value / 100,
    '--pointer-from-left': pointerX.value / 100,
    '--rotate-x': `${rotateX.value}deg`,
    '--rotate-y': `${rotateY.value}deg`,
    '--card-opacity': isInteracting.value ? 1 : 0,
    '--card-scale': scale.value,
  };
});

const handleMouseMove = (e: MouseEvent) => {
  if (!cardElement.value) return;

  const rect = cardElement.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Converte para percentual
  pointerX.value = (x / rect.width) * 100;
  pointerY.value = (y / rect.height) * 100;

  // Calcula rotação 3D
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  rotateY.value = ((x - centerX) / centerX) * 20; // -20 a 20 graus
  rotateX.value = ((centerY - y) / centerY) * 20; // -20 a 20 graus

  isInteracting.value = true;
};

const handleMouseLeave = () => {
  pointerX.value = 50;
  pointerY.value = 50;
  rotateX.value = 0;
  rotateY.value = 0;
  isInteracting.value = false;
};

const handleClose = (e: Event) => {
  if (e.target === e.currentTarget) {
    emit('close');
  }
};

// Previne scroll do body quando modal está aberto
onMounted(() => {
  document.body.style.overflow = 'hidden';
  // Animação de entrada - scale menor para não quebrar em telas pequenas
  setTimeout(() => {
    scale.value = 1.05;
  }, 100);
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

// Fecha com ESC
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close');
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div class="tcg-modal-overlay" @click="handleClose">
      <div class="tcg-modal-content" @click.stop>
        <!-- Botão fechar -->
        <button class="close-btn" @click="emit('close')" title="Close (ESC)">
          <v-icon name="bi-x-lg" fill="white" scale="1.5" />
        </button>

        <!-- Card com efeitos holográficos -->
        <div
          ref="cardElement"
          class="holo-card"
          :style="cardStyle"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        >
          <!-- Imagem do card (alta resolução) -->
          <img
            :src="card.images.large"
            :alt="`${pokemonName} TCG Card`"
            class="card-image"
          />

          <!-- Camadas de efeitos holográficos -->
          <div class="holo-layers">
            <!-- Shine effect (scanlines + rainbow) -->
            <div class="card__shine"></div>

            <!-- Glare effect (light reflection) -->
            <div class="card__glare"></div>
          </div>
        </div>

        <!-- Info do card -->
        <div class="card-info">
          <h2 class="card-name">{{ card.name }}</h2>
          <div class="card-details">
            <span class="card-set">{{ card.set.name }}</span>
            <span class="card-number">#{{ card.number }}</span>
            <span class="card-rarity">{{ card.rarity }}</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="stylus">
.tcg-modal-overlay
  position fixed
  inset 0
  background rgba(0, 0, 0, 0.92)
  backdrop-filter blur(20px)
  display flex
  align-items center
  justify-content center
  z-index 10000
  animation fadeIn 0.3s ease
  padding 2rem

.tcg-modal-content
  position relative
  display flex
  flex-direction column
  align-items center
  gap 2rem
  max-width 90vw
  max-height 90vh
  animation slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)

.close-btn
  position absolute
  top -1rem
  right -1rem
  width 3rem
  height 3rem
  border-radius 50%
  border 2px solid rgba(255, 255, 255, 0.3)
  background rgba(0, 0, 0, 0.8)
  backdrop-filter blur(10px)
  cursor pointer
  display flex
  align-items center
  justify-content center
  transition all 0.3s ease
  z-index 10

  &:hover
    background rgba(255, 255, 255, 0.2)
    border-color rgba(255, 255, 255, 0.6)
    transform scale(1.1) rotate(90deg)

// Holo card container
.holo-card
  position relative
  width min(450px, 70vw)
  max-width 450px
  aspect-ratio 0.718
  border-radius 2rem
  transform-style preserve-3d
  perspective 1000px
  transform rotateY(var(--rotate-y, 0deg)) rotateX(var(--rotate-x, 0deg)) scale(var(--card-scale, 1))
  transition transform 0.1s ease-out, box-shadow 0.4s ease
  box-shadow 0 0 60px rgba(255, 255, 255, 0.1), 0 40px 80px rgba(0, 0, 0, 0.6)
  animation cardEntrance 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)

  &:hover
    box-shadow 0 0 100px rgba(255, 255, 255, 0.3), 0 50px 100px rgba(0, 0, 0, 0.8)

.card-image
  width 100%
  height 100%
  object-fit cover
  border-radius 2rem
  display block
  transform translateZ(1px)
  filter brightness(1.05)

// Holo layers
.holo-layers
  position absolute
  inset 0
  border-radius 2rem
  overflow hidden
  pointer-events none
  z-index 2

.card__shine
  position absolute
  inset 0
  border-radius inherit
  opacity var(--card-opacity, 0)
  transition opacity 0.3s ease
  mix-blend-mode color-dodge
  filter brightness(0.85) contrast(2.75) saturate(0.65)

  // Rainbow gradient com scanlines
  background-image repeating-linear-gradient(
      110deg,
      hsl(283, 100%, 73%) 0%,
      hsl(2, 100%, 73%) 5%,
      hsl(53, 100%, 69%) 10%,
      hsl(93, 100%, 69%) 15%,
      hsl(176, 100%, 76%) 20%,
      hsl(228, 100%, 74%) 25%,
      hsl(283, 100%, 73%) 30%
    ),
    repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 1) 0px,
      rgba(0, 0, 0, 1) 2px,
      rgba(102, 102, 102, 1) 2px,
      rgba(102, 102, 102, 1) 4px
    )

  background-position calc(((50% - var(--pointer-x)) * 2.6) + 50%) calc(((50% - var(--pointer-y)) * 3.5) + 50%),
    center center
  background-size 400% 400%, cover
  background-blend-mode overlay

.card__glare
  position absolute
  inset 0
  border-radius inherit
  opacity calc(var(--card-opacity, 0) * 0.8)
  transition opacity 0.3s ease
  mix-blend-mode overlay
  filter brightness(0.8) contrast(1.5)
  transform translateZ(1.41px)

  background-image radial-gradient(
    farthest-corner circle at var(--pointer-x) var(--pointer-y),
    hsla(0, 0%, 100%, 0.8) 10%,
    hsla(0, 0%, 100%, 0.65) 20%,
    hsla(0, 0%, 0%, 0.5) 90%
  )

// Card info
.card-info
  text-align center
  color white
  animation fadeIn 0.6s ease 0.2s backwards

  .card-name
    font-family var(--retro-font)
    font-size 2rem
    margin 0 0 1rem
    text-shadow 2px 2px 8px rgba(0, 0, 0, 0.8)

  .card-details
    display flex
    gap 1rem
    justify-content center
    flex-wrap wrap
    font-size 0.9rem
    opacity 0.9

    span
      padding 0.4rem 0.8rem
      background rgba(255, 255, 255, 0.1)
      border-radius 0.5rem
      backdrop-filter blur(10px)
      border 1px solid rgba(255, 255, 255, 0.2)

// Animations
@keyframes fadeIn
  from
    opacity 0
  to
    opacity 1

@keyframes slideUp
  from
    opacity 0
    transform translateY(40px)
  to
    opacity 1
    transform translateY(0)

@keyframes cardEntrance
  0%
    opacity 0
    transform rotateY(-180deg) scale(0.8)
  60%
    transform rotateY(20deg) scale(1.1)
  100%
    opacity 1
    transform rotateY(0deg) scale(1)

// Responsive
@media (max-width: 768px)
  .tcg-modal-content
    padding 1rem

  .holo-card
    width 85vw
    max-width 85vw

  .card-info .card-name
    font-size 1.5rem

  .close-btn
    top 0.5rem
    right 0.5rem

@media (max-width: 480px)
  .holo-card
    width 90vw
    max-width 90vw

  .card-info
    .card-name
      font-size 1.2rem

    .card-details
      font-size 0.75rem
</style>
