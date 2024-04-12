<template>
  <FontAwesomeLayers :class="{ border }" class="complex-icon">
    <slot />
  </FontAwesomeLayers>
</template>

<script lang="ts" setup>
import { FontAwesomeLayers } from '@fortawesome/vue-fontawesome'

defineProps<{
  border?: boolean
}>()
</script>

<style lang="postcss" scoped>
.complex-icon {
  font-size: 1.6rem;

  :nth-child(2) {
    font-size: 0.5em;
    transform: translate(100%, 80%);
  }

  &.border :nth-child(2) :deep(path) {
    stroke: var(--color-grey-600);
    stroke-width: 8rem;
    stroke-linejoin: round;
    paint-order: stroke;
  }
}
</style>
