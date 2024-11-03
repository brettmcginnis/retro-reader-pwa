<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'

const ref = useTemplateRef('content-ref')

defineProps<{ msg: string }>()

function getTextWidth(text: string, font:string): number {
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
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

onMounted(() => {
  if (ref.value) {
    const fontSize = getTextWidth("12345678901234567890123456789012345678901234567890123456789012345678901234567890", getCanvasFont(ref.value))
    console.log({
      fontSize,
      client: ref.value.clientWidth,
      scale: ref.value.clientWidth / fontSize
    })
    
    ref.value.style.transform = `scale(${ref.value.clientWidth / fontSize})`
  }
});
</script>

<template>
  <p ref="content-ref" class="read-the-docs">{{ msg }}</p>
</template>

<style scoped>
.read-the-docs {
  text-align: left;
  white-space: pre;
  font-family: monospace;
  font-size: 50px;
  color: #888;
  transform-origin: top left;
}
</style>
