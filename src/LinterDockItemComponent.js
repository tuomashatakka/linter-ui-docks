'use babel'

import React from 'react'
import prop from 'prop-types'
import autobind from 'autobind-decorator'
import { basename } from 'path'
import { BaseComponent } from './LinterStatusBarItem'
import { GROUP_BY } from './constants'

import Message from './components/Message'
import Badge from './components/Badge'

const CONFIG_KEY_COMPACT_LAYOUT = 'linter-ui-docks.layout.compact'
const LOADING_OUT_DELAY         = 2000

const pagaqe                    = require('../package.json')


export default class LinterDockItem extends BaseComponent {

  static propTypes = {
    adapter: prop.object.isRequiredd,
  }

  constructor (props) {
    super(props)
    if (!('adapter' in props && props.adapter.name))
      throw new Error("An instance of LinterGUI was not passed to the LinterDockItemComponent")

    this.adapter = props.adapter
    this.state = {
      order:    'filename',
      count:    0,
      loading:  [],
      messages: [],
      loadingState: null,
    }
  }

  componentWillMount () {
    this.adapter.onUpdate(this.linterDidUpdate)
    this.adapter.onStart(this.showLoader)
    this.adapter.onEnd(this.hideLoader)
  }

  @autobind
  showLoader (path, linter) {
    let entry = { path, linter, state: 'processing' }
    let loading = this.state.loading.filter(item => item.path !== path).concat([ entry ])
    this.setState({ loading, loadingState: 'processing' })
  }

  @autobind
  hideLoader (path, linter) {

    const markEntry = (status) => {
      let loading = this.state.loading
      let id = loading.findIndex(item => item.path === path)
      let entry = { path, linter, state: status }
      if (id > -1)
        loading.splice(id, 1, entry)
      this.setState({ loading, loadingState: status })
    }

    const removeEntry = () => {
      let loading = this.state.loading.filter(item => item.path !== path)
      this.setState({ loading, loadingState: null })
    }

    setTimeout(function () {
      removeEntry()
    }, LOADING_OUT_DELAY)
    markEntry('success')
  }

  @autobind
  linterDidUpdate ({ messages, /*added, removed*/ }) {
    let count = messages.length
    this.setState({ messages, count })
    if (count === 0 && atom.config.get(pagaqe.name + '.layout.hideIfEmpty') === true)
      this.adapter.close()
  }

  renderMessages (items=[]) {

    const groups = groupMessages(this.state.order, items)
    const toggleTree = ({ currentTarget}) => toggleNext(currentTarget)
    const toggleNext = target => {
      let parent = target.parentElement
      let next   = target.nextElementSibling
      let isHidden = !next.classList.contains('hidden')
      next.classList.toggle('hidden', isHidden)
      parent.classList.toggle('collapsed', isHidden)
    }

    let title = name =>
      <span className='title icon icon-file-text'>
        {parseFilename(name)}
      </span>

    return Object.keys(groups).map(key =>
      <li
        key={key}
        className='message-group list-nested-item'>

        <div
          className='list-item'
          onClick={toggleTree}>

          {title(key)} <Badge text={groups[key].length} />

        </div>

        <ul className='list-tree entries has-flat-children'>

          {groups[key].map(msg =>
          <Message
            linterName={msg.linterName}
            severity={msg.severity}
            excerpt={msg.excerpt}
            location={msg.location}
            key={msg.key} />)}
        </ul>
      </li>
    )
  }

  renderLoader (entries) {
    return entries.map(item =>
      <span
        key={item.key}
        className={'highlight highlight-' + item.state}>

        <label>{item.linter.name}</label>
        <address>{item.path}</address>
      </span>
    )
  }

  render () {
    let { messages, count, loadingState } = this.state
    let messageElements = this.renderMessages(messages)
    // let loadingPaths    = this.renderLoader(loading)
    let compact = atom.config.get(CONFIG_KEY_COMPACT_LAYOUT)? ' compact' : ''

    return <article className={'tool-panel linter-dock' + compact}>

      <header className='panel-header padded'>
        <h3 className='align-center'>Linter</h3>
        <div className='btn-group'>
          <button className='btn' onClick={() => this.setState({ order: 'filename' })}>Filename</button>
          <button className='btn' onClick={() => this.setState({ order: 'severity' })}>Severity</button>
        </div>
        <Badge text={count} />
        <div className='loader'>
          {/* {loadingPaths} */}
          <div className={`loading loading-spinner-small loading-${loadingState}`} />
          {/* <progress className={`loading-${loadingState}`} /> */}
        </div>
      </header>

      <ul className='messages padded panel-body list-tree has-collapsable-children'>
        {messageElements}
      </ul>
    </article>
  }
}


export function groupMessages (key, messages) {
  return GROUP_BY[key](messages)
}


function parseFilename (file) {
  file = basename(file)
  return file
}
