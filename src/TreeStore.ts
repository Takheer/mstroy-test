type TId = number | string

export type Ids = {
  id: TId
  parent: TId | null
}

export interface TreeItem<D extends Ids = Ids> {
  children: TreeItem<D>[]
  data?: D
}

export interface ITreeStore<D extends Ids = Ids> {
  getAll(): D[];
  getItem(key: TId): D | null;
  getChildren(key: TId): D[];
  getAllChildren(key: TId): D[];
  getAllParents(key: TId): D[];
  addItem(item: D): void;
  removeItem(key: TId): void;
  updateItem(item: D): void;
}

export class TreeStore<D extends Ids> implements ITreeStore<D> {
  // входящие элементы
  private items: D[]

  // Итоговое дерево
  private rootItems: TreeItem<D>[] = []

  // Хранит все посещённые ноды, из ссылок на которые потом соберем дерево
  private lookup: { [id: TId]: TreeItem<D> } = {}

  // Отображения айди нод в списки потомков и родителей.
  // Наполним их при инициализации, чтобы чтение было всегда за O(1)
  private itemIdToDirectChildren: { [id: TId]: D[] } = {}
  private itemIdToAllChildren: { [id: TId]: D[] } = {}
  private itemIdToAllParents: { [id: TId]: D[] } = {}

  private placeElementIntoLookup(item: D) {
    const itemId = item.id
    const parent = item.parent

    if (!Object.prototype.hasOwnProperty.call(this.lookup, itemId)) {
      this.lookup[itemId] = { children: [] }
      this.itemIdToDirectChildren[itemId] = []
    }

    this.lookup[itemId].data = item

    const treeItem = this.lookup[itemId]

    if (parent === null || parent === undefined) {
      this.rootItems.push(treeItem)
    } else {
      if (!Object.prototype.hasOwnProperty.call(this.lookup, parent)) {
        this.lookup[parent] = { children: [] }
        this.itemIdToDirectChildren[parent] = []
      }

      this.lookup[parent].children.push(treeItem)
      this.itemIdToDirectChildren[parent].push(item)
    }
  }

  constructor(items: D[]) {
    this.items = items

    for (const item of items) {
      this.placeElementIntoLookup(item)
    }

    if (this.countNodes(this.rootItems) < Object.keys(this.lookup).length) {
      throw new Error(`The items array contains nodes with a circular parent/child relationship.`)
    }

    for (const [key, item] of Object.entries(this.lookup)) {
      this.itemIdToAllChildren[key] = this.getAllNodesBFS(item)
      this.itemIdToAllParents[key] = this.setAllParents(key)
    }
  }

  private countNodes(tree: TreeItem<D>[]): number {
    return tree.reduce((sum, n) => sum + 1 + (n.children && this.countNodes(n.children)), 0)
  }

  // O(1)
  getAll(): D[] {
    return this.items
  }

  // O(1)
  getItem(key: TId): D | null {
    return this.lookup[key]?.data ?? null
  }

  // O(1)
  getChildren(key: TId): D[] {
    return this.itemIdToDirectChildren[key] ?? []
  }

  // O(1)
  getAllChildren(key: TId): D[] {
    return this.itemIdToAllChildren[key] ?? []
  }

  // O(1)
  getAllParents(key: TId): D[] {
    return this.itemIdToAllParents[key] ?? []
  }

  // O(1), если не считать распаковку массива.
  addItem(item: D): void {
    if (item.id in this.lookup) {
      throw new Error('Айтем с таким айди уже добавлен!')
    }
    if (item.parent && !(item.parent in this.lookup)) {
      throw new Error('Нельзя добавить элемент для родителя с таким id!')
    }
    this.items.push(item)
    this.lookup[item.id] = { data: item, children: [] }
    this.itemIdToAllChildren[item.id] = []
    this.itemIdToDirectChildren[item.id] = []

    if (!item.parent) return

    this.itemIdToAllChildren[item.parent].push(item)
    this.itemIdToDirectChildren[item.parent].push(item)
    this.itemIdToAllParents[item.id] = [
      this.getItem(item.parent),
      ...this.itemIdToAllParents[item.parent],
    ].filter((c) => !!c)
  }

  // O(n*m), где n -- количество элементов в списке, а m -- количество потомков удаляемого элемента
  removeItem(key: TId): void {
    const itemsToDelete = [...this.getAllChildren(key), this.getItem(key)].filter((c) => !!c)
    for (const item of itemsToDelete) {
      const indexToDelete = this.items.findIndex((c) => c.id === item.id)
      this.items.splice(indexToDelete, 1)

      delete this.lookup[item.id]
      delete this.itemIdToAllChildren[item.id]
      delete this.itemIdToDirectChildren[item.id]
      delete this.itemIdToAllParents[item.id]
    }
  }

  updateItem(item: D) {
    if (!(item.id in this.lookup)) {
      throw new Error('Нельзя обновить элемент, которого нет в дереве!')
    }
    if (item.parent && !(item.parent in this.lookup)) {
      throw new Error('Неверный родительский элемент!')
    }
    const indexToReplace = this.items.findIndex(i => i.id === item.id)
    this.items.splice(indexToReplace, 1, item)

    // TODO пересчитывать не всё дерево, а только то, что действительно изменилось
    this.lookup = {}
    for (const item of this.items) {
      this.placeElementIntoLookup(item)
    }

    for (const [key, item] of Object.entries(this.lookup)) {
      this.itemIdToAllChildren[key] = this.getAllNodesBFS(item)
      this.itemIdToAllParents[key] = this.setAllParents(key)
    }
  }

  // O(n^2), потому что BFS должен быть запущен для каждой ноды.
  // Можем себе позволить, если делать не на каждое чтение, а при инициализации
  // и при изменении дерева
  private getAllNodesBFS(root: TreeItem<D>): D[] {
    const allNodes: D[] = []
    if (!root) {
      return allNodes
    }

    const queue = [...root.children] // Initialize a queue with the root node children

    while (queue.length > 0) {
      const currentNode = queue.shift() // Dequeue the first node
      if (currentNode?.data) {
        allNodes.push(currentNode.data) // Add it to the list
      }

      if (currentNode?.children) {
        for (const child of currentNode.children) {
          queue.push(child) // Enqueue all children
        }
      }
    }
    return allNodes
  }

  private setAllParents(key: TId): D[] {
    const parents = []
    let item
    item = this.getItem(key)
    do {
      if (!item?.parent) {
        return parents.filter((p) => !!p)
      }
      parents.push(this.getItem(item.parent))
      item = this.getItem(item.parent)
    } while (item?.parent !== null)

    return parents.filter((p) => !!p)
  }
}
