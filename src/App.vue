<script setup lang="ts">
import Content from './components/Content.vue'
import { walkthrough } from './content/ff7.ts'

const content = walkthrough.join('\n')
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <div class="reader">
    <Content :msg="content"  />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.reader {
  width: 50%;
  display: inline-block;
  justify-content: start;
  text-align: left;
  white-space: pre;
  font-family: monospace;
}
</style>
