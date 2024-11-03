<script setup lang="ts">
import Content from './components/Content.vue'
import { walkthrough } from './content/ff7.ts'
</script>

<template>
  <div class="reader">
    <Content :content="walkthrough" />
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
  width: 50vw;
  display: inline-block;
  justify-content: start;
}
</style>
