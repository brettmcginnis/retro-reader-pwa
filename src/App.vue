<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { walkthrough } from './content/ff7.ts'

const asdf = walkthrough.join('\n\n')
console.log(asdf)
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
    <HelloWorld :msg="asdf"  />
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
  justify-content: start;
  font-size: xx-small;
  font-family: monospace;
  /* font-size: clamp(.1rem, 1vw, 3rem); */
}
</style>
