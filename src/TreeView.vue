<template>
  <ag-grid-vue
    :columnDefs="colDefs"
    treeData
    :rowData="treeData.getAll()"
    :autoGroupColumnDef="autoGroupColumnDef"
    :getDataPath="data => getDataPath(data)"
    style="height: 98vh"
  />
</template>

<script setup lang="ts">
import { AgGridVue } from "ag-grid-vue3";
import { ref } from 'vue'
import type { TFlatTreeItem } from '@/types.ts'
import { TreeStore } from '@/TreeStore.ts'

const treeData = ref<TreeStore<TFlatTreeItem>>(new TreeStore([
  { id: 1, parent: null, label: 'Child 1' },

  { id: '91064cce', parent: 1,  label: 'Child 2' },
  { id: 3, parent: 1,  label: 'Child 3' },

  { id: 4, parent: '91064cce',  label: 'Child 4' },
  { id: 5, parent: '91064cce',  label: 'Child 5' },
  { id: 6, parent: '91064cce',  label: 'Child 6' },

  { id: 7, parent: 4,  label: 'Child 7' },
  { id: 8, parent: 4,  label: 'Child 8' },
]));

const colDefs = ref([
  { field: "id", hide: true },
  { field: "label", headerName: "Наименование", valueGetter: p => treeData.value.getItem(p.data?.id)?.label },
]);

const autoGroupColumnDef = ref({
  field: "parent",
  headerName: "Категория",
  valueGetter: p => treeData.value.getChildren(p.data?.id)?.length ? 'Группа' : 'Элемент',
  cellRendererParams: {
    suppressCount: true,
  },
})

function getDataPath(data: TFlatTreeItem) {
  return treeData.value.getAllParents(data.id).map(c => c.id.toString()).reverse()
}

</script>

<style lang="scss">

</style>
