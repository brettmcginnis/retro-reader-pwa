<template>
  <p>Title: {{ title }}</p>
  <input v-model="title" placeholder="edit me" />

  <textarea v-model="content" placeholder="add multiple lines"></textarea>

  <button @click="add">Add</button>
</template>

<script setup lang="ts">
import { defineModel } from 'vue';
import { add as dbAdd } from './api';

const title = defineModel({ default: "" })
const content = defineModel('content', { default: "" })

function add() {
  dbAdd(title.value, content.value.split("\n").map((l) => l.trimEnd()))
}
</script>
