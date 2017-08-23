'use babel'

import Component from './LinterDockItemComponent'
import autobind from 'autobind-decorator'
import { CompositeDisposable, Disposable, Emitter } from 'atom'

const FOCUS_DELAY = 150


export default class LinterGUI {

  static DEFAULT_LOCATION = 'right'

  constructor () {
    this.changes       = {}
    this.emitter       = new Emitter()
    this.subscriptions = new CompositeDisposable()

    // Remove the possible old elements
    document.querySelectorAll('.linter-dock').forEach(el => el.remove())
    this.open()
  }

  get name () { return 'Linter' }

  get item () { return this.open() }

  getTitle () { return this.name }

  @autobind
  render (props) {
    this.open()
    this.updateComponent(props)
  }

  isVisible () {
    let pn = pane(this.item)
     return pn && pn.getActiveItem() !== this.item
  }

  open () {

    let display = item =>
      this._item.element.appendChild(item)

    let remove = new Disposable(() => {
      this.close()
      if (this._item)
        this._item.element.remove()
    })

    if (!this._item) {
      Component.create({ adapter: this }).then(display)

      this.subscriptions.add(remove)

      this._item = createItem({
        name: this.name, location: LinterGUI.DEFAULT_LOCATION })
    }

    return openItem(this._item)
  }

  close () {
    closeItem(this.item)
  }

  dispose () {
    this.subscriptions.dispose()
  }

  @autobind
  updateComponent (changes={ added: 0, removed: 0, messages: 0 }) {
    this.changes = changes
    if (changes.added || changes.messages || changes.removed)
      this.emitter.emit('did-update', changes)
  }

  requestUpdate (scope, linter) {
    this.updateComponent({ scope, linter })
  }

  @autobind
  didBeginLinting ({ linter, path }) {
    let { messages } = this.changes
    this.emitter.emit('lint-start', { linter, path, messages })
    this.requestUpdate(path || 'global', linter)
  }

  @autobind
  didFinishLinting ({ linter, path }) {
    let { messages } = this.changes
    this.requestUpdate(path || 'global', linter)
    this.emitter.emit('lint-end', { linter, path, messages })
  }

  onUpdate  = (callback) => this.subscriptions.add(this.emitter.on('did-update', data => callback(data)))

  onStart   = (callback) => this.subscriptions.add(this.emitter.on('lint-start', ({ linter, path }) => callback(path, linter)))

  onEnd     = (callback) => this.subscriptions.add(this.emitter.on('lint-end', ({ linter, path }) => callback(path, linter)))

}

let focusedElement

function createItem (options={}) {
  return {
    getTitle: () => options.name,
    getDefaultLocation: () => options.location,
    element: document.createElement('div'),
  }
}

function openItem (item) {
  focusedElement = document.activeElement

  if (pane(item))
    activateItem(item)
  else
    atom.workspace.open(item)
    .then(restoreFocus)
  return item
}

function restoreFocus () {
  if (focusedElement) {
    focusedElement.focus()
    activateItem(focusedElement)
    focusedElement = null
  atom.workspace.getCenter().activate()
  }
}

function closeItem (item) {
  let pn = pane(item)
  return pn ? pn.removeItem(item) : null
}

function activateItem (item) {
  let pn = pane(item)
  let dn = pn ? pn.activateItem(item) : null
  setTimeout(() =>
    atom.workspace.getCenter().activate(),
    FOCUS_DELAY
  )
  return dn
}

function pane (item) {
  return atom.workspace.paneForItem(item)
}
