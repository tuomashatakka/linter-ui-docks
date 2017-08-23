'use babel'
import { render } from 'react-dom'
import autobind from 'autobind-decorator'
import React, { Component } from 'react'
import prop from 'prop-types'
import { groupMessages } from './LinterDockItemComponent'
import Badge from './components/Badge'


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
    return <section
      onClick={() => this.props.toggle()}
      className='linter-state'>

      <Badge type='error' text={this.state.error.length} />
      <Badge type='warning' text={this.state.warning.length} />
      <Badge type='info' text={this.state.info.length} />

    </section>
  }
}
