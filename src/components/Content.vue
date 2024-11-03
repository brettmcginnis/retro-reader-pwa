<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'

const ref = useTemplateRef('content-ref')

const { content } = defineProps<{ content: string[] }>()

function getTextWidth(text: string, font:string): number {
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d");
  context!.font = font;

  return context!.measureText(text).width;
}

function getCssStyle(element: HTMLElement, prop: string) {
  return window.getComputedStyle(element, null).getPropertyValue(prop);
}

function getCanvasFont(el = document.body) {
  const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
  const fontSize = getCssStyle(el, 'font-size') || '16px';
  const fontFamily = getCssStyle(el, 'font-family') || 'monospace';

  return `${fontWeight} ${fontSize} ${fontFamily}`;
}

function maxWidth(): number {
  return Math.max(...content.map(str => str.length))
}

onMounted(() => {
  if (ref.value) {
    const fontSize = getTextWidth("".padStart(maxWidth(), "0"), getCanvasFont(ref.value))

    ref.value.style.transform = `scale(${ref.value.clientWidth / fontSize})`
  }
});
</script>

<template>
  <div ref="content-ref" class="read-the-docs">
    <p v-for="line in content">
      {{ line }}
    </p>
  </div>
</template>

<style scoped>
.read-the-docs {
  text-align: left;
  white-space: pre;
  font-family: monospace;
  font-size: 5rem;
  color: #888;
  transform-origin: top left;
}

.read-the-docs p {
  margin: 0;
}
</style>
