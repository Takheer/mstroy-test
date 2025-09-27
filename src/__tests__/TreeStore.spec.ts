import { describe, expect, it } from 'vitest'
import  { TreeStore } from '@/TreeStore'
import type { TFlatTreeItem } from '@/types.ts'

const exampleTree: TFlatTreeItem[] = [
  { id: 1, parent: null, label: 'Child 1' },

  { id: '91064cce', parent: 1,  label: 'Child 2' },
  { id: 3, parent: 1,  label: 'Child 3' },

  { id: 4, parent: '91064cce',  label: 'Child 4' },
  { id: 5, parent: '91064cce',  label: 'Child 5' },
  { id: 6, parent: '91064cce',  label: 'Child 6' },

  { id: 7, parent: 4,  label: 'Child 7' },
  { id: 8, parent: 4,  label: 'Child 8' },
]

describe('TreeStore', () => {
  it('Правильно рендерит дерево из примера', () => {
    const copiedTree = JSON.parse(JSON.stringify(exampleTree))
    const treeStore = new TreeStore<TFlatTreeItem>(copiedTree)
    expect(treeStore.getAll().length).toEqual(8);
    expect(treeStore.getItem('91064cce')).toEqual({ id: '91064cce', parent: 1,  label: 'Child 2' });
    expect(treeStore.getChildren('91064cce').length).toEqual(3)
    expect(treeStore.getAllChildren('91064cce').length).toEqual(5)
    expect(treeStore.getAllParents(4).length).toEqual(2)
  })

  it('Добавляет валидную ноду', () => {
    const copiedTree = JSON.parse(JSON.stringify(exampleTree))
    const treeStore = new TreeStore<TFlatTreeItem>(copiedTree)
    expect(treeStore.getAll().length).toEqual(8)
    treeStore.addItem({ id: 123, parent: null, label: 'Adjacent root' })
    expect(treeStore.getAll().length).toEqual(9)
  })

  it('Не добавляет невалидную ноду', () => {
    const copiedTree = JSON.parse(JSON.stringify(exampleTree))
    const treeStore = new TreeStore<TFlatTreeItem>(copiedTree)
    expect(treeStore.getAll().length).toEqual(8)
    expect(
      () => treeStore.addItem({ id: 123, parent: 'non_existent_parent', label: 'Adjacent root' })
    ).toThrowError()
  })

  it('Меняет правильно переданную ноду', () => {
    const copiedTree = JSON.parse(JSON.stringify(exampleTree))
    const treeStore = new TreeStore<TFlatTreeItem>(copiedTree)

    expect(treeStore.getAll().length).toEqual(8)
    expect(treeStore.getChildren('91064cce').length).toEqual(3)
    expect(treeStore.getAllChildren('91064cce').length).toEqual(5)
    expect(treeStore.getChildren(3).length).toEqual(0)
    expect(treeStore.getAllChildren(3).length).toEqual(0)

    treeStore.updateItem({ id: 4, parent: 3,  label: 'Child 4 -> Parent 3' })

    expect(treeStore.getAll().length).toEqual(8);
    expect(treeStore.getChildren('91064cce').length).toEqual(2)
    expect(treeStore.getAllChildren('91064cce').length).toEqual(2)
    expect(treeStore.getChildren(3).length).toEqual(1)
    expect(treeStore.getAllChildren(3).length).toEqual(3)
  })

  it('Не меняет неправильно переданную ноду', () => {
    const copiedTree = JSON.parse(JSON.stringify(exampleTree))
    const treeStore = new TreeStore<TFlatTreeItem>(copiedTree)

    expect(treeStore.getAll().length).toEqual(8)
    expect(treeStore.getChildren('91064cce').length).toEqual(3)
    expect(treeStore.getAllChildren('91064cce').length).toEqual(5)
    expect(treeStore.getChildren(3).length).toEqual(0)
    expect(treeStore.getAllChildren(3).length).toEqual(0)

    expect(
      () => treeStore.updateItem({ id: 4, parent: 'non-existent',  label: 'Child 4 -> Parent 3' })
    ).toThrowError()

    expect(treeStore.getAll().length).toEqual(8)
    expect(treeStore.getChildren('91064cce').length).toEqual(3)
    expect(treeStore.getAllChildren('91064cce').length).toEqual(5)
    expect(treeStore.getChildren(3).length).toEqual(0)
    expect(treeStore.getAllChildren(3).length).toEqual(0)
  })

  it('Каскадно удаляет существующий элемент', () => {
    const copiedTree = JSON.parse(JSON.stringify(exampleTree))
    const treeStore = new TreeStore<TFlatTreeItem>(copiedTree)

    expect(treeStore.getAll().length).toEqual(8)
    expect(treeStore.getChildren('91064cce').length).toEqual(3)
    expect(treeStore.getAllChildren('91064cce').length).toEqual(5)

    treeStore.removeItem('91064cce')

    expect(treeStore.getAll().length).toEqual(2)
    expect(treeStore.getItem('91064cce')).toBeNull()
    expect(treeStore.getChildren('91064cce').length).toEqual(0)
    expect(treeStore.getAllChildren('91064cce').length).toEqual(0)
  })

  it('Не удаляет несуществующий элемент', () => {
    const copiedTree = JSON.parse(JSON.stringify(exampleTree))
    const treeStore = new TreeStore<TFlatTreeItem>(copiedTree)

    expect(treeStore.getAll().length).toEqual(8)

    treeStore.removeItem('non-existent')

    expect(treeStore.getAll().length).toEqual(8)
  })
})
