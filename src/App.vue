<script setup lang="ts">
import Add from './document/Add.vue'
import List from './document/List.vue'
</script>

<template>
  <div class="reader">
    <Add />
    <List />
    <!-- <Content :content="walkthrough" /> -->
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
