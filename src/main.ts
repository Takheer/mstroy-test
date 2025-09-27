import { createApp } from 'vue'
import App from './App.vue'
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise'

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  TreeDataModule,
  ...(import.meta.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);

createApp(App).mount('#app')

