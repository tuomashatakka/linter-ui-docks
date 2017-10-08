'use babel'

export class BaseView {

  constructor ({ tagName, }) {
    this.item = document.createElement(tagName || 'div')
  }

  getItem () {
    return this.item
  }

}

export default class LinterGUIView extends BaseView {

  constructor (opts={}) {
    super(opts)
    this.model = opts.model || null
  }

}
