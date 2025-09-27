<script setup lang="ts">
import { onMounted } from 'vue'
import { TreeStore } from '@/TreeStore.ts'

onMounted(() => {
  type TData = { id: number | string; parent: null | number | string; custom: string }
  const treeStore = new TreeStore<TData>([
    { id: 4, parent: null, custom: 'abc' },
    { id: 31, parent: 4, custom: '12' },
    { id: 'ae1941ff', parent: 418, custom: 'de' },
    { id: 1, parent: 418, custom: 'ZZZz' },
    { id: 418, parent: null, custom: 'ü' },
  ])
})
</script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style>
