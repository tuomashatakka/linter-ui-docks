'use babel'
import { render } from 'react-dom'
import autobind from 'autobind-decorator'
import React, { Component } from 'react'
import prop from 'prop-types'
import Badge from './components/Badge'
import { ICON_SEVERITY, groupMessages } from './constants'

export class BaseComponent extends Component {

  static create (props) {
    let element = document.createElement('div')
    let Component = this
    return new Promise (resolve =>
      render(<Component {...props} />, element, () => {
        resolve(element.firstElementChild)
    }))
  }
}


export default class LinterStatusBarItem extends BaseComponent {

  static propTypes = {
    adapter: prop.object.isRequired,
    toggle:  prop.func.isRequired,
  }

  constructor (props) {
    super(props)
    this.state = {
      count:   0,
      error:   [],
      warning: [],
      info:    [],
    }
    props.adapter.onUpdate(this.linterDidUpdate)
    props.adapter.onEnd(this.linterDidUpdate)
  }

  @autobind
  linterDidUpdate (changes={}) {

    let messages = changes.messages || []
    let count    = messages.length
    messages = groupMessages('severity', messages)
    this.setState({ ...messages, count })
  }

  render () {
    let type   = kind => this.state[kind].length ? kind : null

    return <section
      onClick={() => this.props.toggle()}
      className='linter-state'>

      <Badge
        type={type('error')}
        icon={ICON_SEVERITY.error}
        text={this.state.error.length} />

      <Badge
        type={type('warning')}
        icon={ICON_SEVERITY.warning}
        text={this.state.warning.length} />

      <Badge
        type={type('info')}
        icon={ICON_SEVERITY.info}
        text={this.state.info.length} />

    </section>
  }
}
