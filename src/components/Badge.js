'use babel'

import React from 'react'
import prop from 'prop-types'

const Badge = ({ text=null, type=null }) => {

  Badge.propTypes = {
    text: prop.string,
    type: prop.string,
  }

  return <span className={`label badge${type ? ' text-' + type : ''}`}>
    {text}
  </span>
}


export default Badge
