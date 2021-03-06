'use babel'

import { CompositeDisposable, Disposable } from 'atom'
import LinterGUI from './LinterGUI'
import LinterGUIView from './views/LinterGUIView'
import LinterStatusBarItem from './views/LinterStatusBarItem'


const CONFIG_KEY_STATUS_BAR_LOCATION = 'linter-ui-docks.layout.statusBarLocation'

const linterURI = uri => 0 === 'linter://'.indexOf(uri)

export default {

  subscriptions: null,
  config: require('./configuration.json'),

  activate () {
    this.togglePanel   = this.togglePanel.bind(this)
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(
      registerOpener(LinterGUI),
      registerViewProvider(LinterGUI, LinterGUIView),
      registerCommands(this),
      observeConfig(this)
    )
  },

  deactivate () {
    this.subscriptions.dispose()
    if (this.gui)
      this.gui.dispose()
  },

  togglePanel () {
    if (!this.gui)
      throw new ReferenceError(`Linter docks gui is not defined`)
    if (this.gui.isVisible())
      this.gui.open()
    else
      this.gui.close()
  },

  provideLinterUI () {
    if (!this.gui)
      this.gui = new LinterGUI()
    return this.gui
  },

  async consumeStatusbar (bar) {
    let location = atom.config.get(CONFIG_KEY_STATUS_BAR_LOCATION)

    let item = await LinterStatusBarItem.create({
      adapter: this.gui,
      toggle:  this.togglePanel.bind(this)
    })

    boundSetStatusbarLocation = setLocationForStatusbarItem.bind(bar, item)
    boundSetStatusbarLocation(location)
    this.subscriptions.add(new Disposable(() => item.remove()))
  },
}

let boundSetStatusbarLocation

function setLocationForStatusbarItem (item, location) {
  if (location === 'disabled') {
    let tile =
      this.getLeftTiles().find(o => o.item == item) ||
      this.getRightTiles().find(o => o.item == item) ||
      null
    return tile.destroy()
  }
  else if (location === 'right')
    this.addRightTile({ item })
  else
    this.addLeftTile({ item })
}

function observeConfig (main) {
  let handler = (cf) => {
    if (boundSetStatusbarLocation)
      boundSetStatusbarLocation(cf.layout.statusBarLocation)
  }
  return atom.config.observe('linter-ui-docks', handler)
}


function registerCommands (main) {
  let el = document.querySelector('atom-workspace')
  let ns = 'linter-ui-docks:toggle'
  let fn = (ev) => main.togglePanel(ev)
  return atom.commands.add(el, ns, fn)
}

function registerOpener (viewClass) {

  let op = function(uri) {
    if (linterURI(uri))
      return new viewClass(uri)
  }

  return atom.workspace.addOpener(op)
}


/**
 * Registers a new view provider to the global view registry. Also assigns
 *
 * @method registerViewProvider
 *
 * @param  {constructor}             model A class for the model that a view is registered for
 * @param  {constructor}             view  Bound view's constructor
 *
 * @return {Disposable}             A disposable for the registered view provder
 */

function registerViewProvider (model, view) {

  if (!(view.item &&
        view.getItem ||
       (view.prototype && view.prototype.getItem)))
    throw new Error("The view " + view.name + " should implement a getItem method")

  model.prototype.getElement = function () {
    if (this.element)
      return this.element
  }

  const provideView = (/*obj*/) => {
    return new view()
    // let v          = new view()
    // v.model        = obj
    // obj.view       = v
    // return typeof v.getItem === 'function' ? v.getItem() : v.item
  }

  return atom.views.addViewProvider(model, provideView)
}
