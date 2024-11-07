<template>
  <ul>
    <li v-for="document in documents" :key="document.id">
      {{ document.title }}, {{ document.content.length }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useObservable } from "@vueuse/rxjs";
import { all } from "./api";
import { from } from "rxjs";

const documents = useObservable(from(all)
</script>