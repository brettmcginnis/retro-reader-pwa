<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'

const ref = useTemplateRef('content-ref')

defineProps<{ msg: string }>()

function reduceSizeToContainer(content: HTMLParagraphElement) {
  let currentFontSize = parseInt(window.getComputedStyle(content, null).getPropertyValue('font-size'))

  while (content.scrollWidth > content.clientWidth) {
    currentFontSize--
    content.style.fontSize = currentFontSize + 'px'
  }
}

// todo: increase size incrementally by .1

onMounted(() => {
  if (ref.value) {
    reduceSizeToContainer(ref.value)
  }
});
</script>

<template>
  <p ref="content-ref" class="read-the-docs">{{ msg }}</p>
</template>

<style scoped>
.read-the-docs {
  font-size: 50px;
  color: #888;
  /* padding: 0; */
}
</style>