<template>
  <div style="text-align: center">
    <h1 v-if="greetingUser" class="title">{{ greetingUser }}</h1>
    <UiButton v-else class="button" @click="start">Click here to start greeting a random user</UiButton>
  </div>
</template>

<script lang="ts" setup>
import { useDemoGreetingStore } from '@/stores/xo-rest-api/demo-greeting.store'
import UiButton from '@core/components/button/UiButton.vue'

const { greetingUser, start } = useDemoGreetingStore().subscribe({ defer: true })
</script>

<style lang="postcss" scoped>
.title {
  font-family: monospace;
  white-space: pre;
}

.title,
.button {
  margin-top: 10rem;
}
</style>
