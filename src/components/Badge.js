'use babel'

import React from 'react'
import prop from 'prop-types'

const Badge = ({ text=null, icon=null, type=null }) => {

  Badge.propTypes = {
    text: prop.oneOfType([prop.string, prop.number]),
    icon: prop.string,
    type: prop.string,
  }

  let className = `label badge${type ? ' badge-' + type : ''}` + (icon ? ' icon ' + icon : '')

  return (
    <span className={className}>
      {text}
    </span>
  )
}


export default Badge
