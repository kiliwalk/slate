
import Normalize from '../utils/normalize'
import uid from '../utils/uid'

/**
 * Add mark to text at `offset` and `length` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {Number} length
 * @param {Mixed} mark
 * @return {Transform}
 */

export function addMarkOperation(transform, path, offset, length, mark) {
  const inverse = [{
    type: 'remove_mark',
    path,
    offset,
    length,
    mark,
  }]

  const operation = {
    type: 'add_mark',
    path,
    offset,
    length,
    mark,
    inverse,
  }

  return transform.applyOperation(operation)
}

/**
 * Insert a `node` at `index` in a node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} index
 * @param {Node} node
 * @return {Transform}
 */

export function insertNodeOperation(transform, path, index, node) {
  const inversePath = path.slice().concat([index])
  const inverse = [{
    type: 'remove_node',
    path: inversePath,
  }]

  const operation = {
    type: 'insert_node',
    path,
    index,
    node,
    inverse,
  }

  return transform.applyOperation(operation)
}

/**
 * Insert `text` at `offset` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {String} text
 * @param {Set} marks (optional)
 * @return {Transform}
 */

export function insertTextOperation(transform, path, offset, text, marks) {
  const inverseLength = text.length
  const inverse = [{
    type: 'remove_text',
    path,
    offset,
    length: inverseLength,
  }]

  const operation = {
    type: 'insert_text',
    path,
    offset,
    text,
    marks,
    inverse,
  }

  return transform.applyOperation(operation)
}

/**
 * Move a node by `path` to a `newPath` and `newIndex`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Array} newPath
 * @param {Number} newIndex
 * @return {Transform}
 */

export function moveNodeOperation(transform, path, newPath, newIndex) {
  const { state } = transform
  const { document } = state
  const parentPath = path.slice(0, -1)
  const parentIndex = path[path.length - 1]
  const inversePath = newPath.slice().concat([newIndex])

  const inverse = [{
    type: 'move_node',
    path: inversePath,
    newPath: parentPath,
    newIndex: parentIndex,
  }]

  const operation = {
    type: 'move_node',
    path,
    newPath,
    newIndex,
    inverse,
  }

  return transform.applyOperation(operation)
}

/**
 * Remove mark from text at `offset` and `length` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @return {Transform}
 */

export function removeMarkOperation(transform, path, offset, length, mark) {
  const inverse = [{
    type: 'add_mark',
    path,
    offset,
    length,
    mark,
  }]

  const operation = {
    type: 'remove_mark',
    path,
    offset,
    length,
    mark,
    inverse,
  }

  return transform.applyOperation(operation)
}

/**
 * Remove a node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @return {Transform}
 */

export function removeNodeOperation(transform, path) {
  const { state } = transform
  const { document } = state
  const node = document.assertPath(path)
  const inversePath = path.slice(0, -1)
  const inverseIndex = path.slice(-1)

  const inverse = [{
    type: 'insert_node',
    path: inversePath,
    index: inverseIndex,
    node,
  }]

  const operation = {
    type: 'remove_node',
    path,
    inverse,
  }

  return transform.applyOperation(operation)
}

/**
 * Remove text at `offset` and `length` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {Number} length
 * @return {Transform}
 */

export function removeTextOperation(transform, path, offset, length) {
  const { state } = transform
  const { document } = state
  const node = document.assertPath(path)
  const ranges = node.getRanges()
  const inverse = []

  ranges.reduce((start, range) => {
    const { text, marks } = range
    const end = start + text.length
    if (start > offset + length) return
    if (end <= offset) return

    const endOffset = Math.min(end, offset + length)
    const string = text.slice(offset, endOffset)

    inverse.push({
      type: 'insert_text',
      path,
      offset,
      text: string,
      marks,
    })

    return end
  }, 0)

  const operation = {
    type: 'remove_text',
    path,
    offset,
    length,
    inverse,
  }

  return transform.applyOperation(operation)
}

/**
 * Set `properties` on mark on text at `offset` and `length` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @return {Transform}
 */

export function setMarkOperation(transform, path, offset, length, mark, properties) {
  const inverseProps = {}

  for (const k in properties) {
    inverseProps[k] = mark[k]
  }

  const inverse = [{
    type: 'set_mark',
    path,
    offset,
    length,
    mark,
    properties: inverseProps,
  }]

  const operation = {
    type: 'set_mark',
    path,
    offset,
    length,
    mark,
    properties,
    inverse,
  }

  return transform.applyOperation(operation)
}

/**
 * Set `properties` on a node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Object || String} properties
 * @return {Transform}
 */

export function setNodeOperation(transform, path, properties) {
  const { state } = transform
  const { document } = state
  const node = document.assertPath(path)
  const inverseProps = {}

  for (const k in properties) {
    inverseProps[k] = node[k]
  }

  const inverse = [{
    type: 'set_node',
    path,
    properties: inverseProps
  }]

  const operation = {
    type: 'set_node',
    path,
    properties,
    inverse,
  }

  return transform.applyOperation(operation)
}

/**
 * Set the selection to a new `selection`.
 *
 * @param {Transform} transform
 * @param {Mixed} selection
 * @return {Transform}
 */

export function setSelectionOperation(transform, properties) {
  properties = Normalize.selectionProperties(properties)

  const { state } = transform
  const { selection } = state
  const prevProps = {}

  if (properties.marks == selection.marks) {
    properties.marks = null
  }

  for (const k in properties) {
    prevProps[k] = selection[k]
  }

  const inverse = [{
    type: 'set_selection',
    properties: prevProps
  }]

  const operation = {
    type: 'set_selection',
    properties,
    inverse,
  }

  return transform.applyOperation(operation)
}

/**
 * Split a node by `path` at `offset`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @return {Transform}
 */

export function splitNodeOperation(transform, path, offset) {
  const inverse = []

  const operation = {
    type: 'split_node',
    path,
    offset,
    inverse,
  }

  return transform.applyOperation(operation)
}