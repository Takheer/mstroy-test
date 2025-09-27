<template>
  <ag-grid-vue
    :columnDefs="colDefs"
    :rowData="treeData.getAll()"
    :autoGroupColumnDef="autoGroupColumnDef"
    :getDataPath="data => getDataPath(data)"
    treeData
    rowNumbers
    :getRowStyle="rowStyle"
    style="height: 98vh"
  />
</template>

<script setup lang="ts">
import { AgGridVue } from "ag-grid-vue3";
import { ref } from 'vue'
import type { TFlatTreeItem } from '@/types.ts'
import { TreeStore } from '@/TreeStore.ts'
import { type ColDef, type RowClassParams, type ValueGetterParams } from 'ag-grid-enterprise'

const treeData = ref<TreeStore<TFlatTreeItem>>(new TreeStore([
  { id: 1, parent: null, label: 'Айтем 1' },

  { id: '91064cce', parent: 1,  label: 'Айтем 2' },
  { id: 3, parent: 1,  label: 'Айтем 3' },

  { id: 4, parent: '91064cce',  label: 'Айтем 4' },
  { id: 5, parent: '91064cce',  label: 'Айтем 5' },
  { id: 6, parent: '91064cce',  label: 'Айтем 6' },

  { id: 7, parent: 4,  label: 'Айтем 7' },
  { id: 8, parent: 4,  label: 'Айтем 8' },
]));

const colDefs = ref<ColDef<TFlatTreeItem>[]>([
  {
    field: "label",
    headerName: "Наименование",
    valueGetter: (p: ValueGetterParams) => treeData.value.getItem(p.data?.id)?.label ?? ''
  },
]);

const autoGroupColumnDef = ref<ColDef<TFlatTreeItem>>({
  field: "parent",
  headerName: "Категория",
  width: 400,
  valueGetter: (p: ValueGetterParams) => treeData.value.getChildren(p.data?.id).length ? 'Группа' : 'Элемент',
  cellRendererParams: {
    suppressCount: true,
  },
})

function getDataPath(data: TFlatTreeItem) {
  return treeData.value.getAllParents(data.id).map(c => c.id.toString()).reverse()
}

const rowStyle = (params: RowClassParams<TFlatTreeItem>) => {
  if (!params.node.data) return;
  if (treeData.value.getChildren(params.node.data.id).length) {
    return { fontWeight: 700 };
  }
};

</script>

<style lang="scss">

</style>
