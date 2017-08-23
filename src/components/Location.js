'use babel'
// @flow

import React from 'react'
import prop from 'prop-types'

const Location = ({ position }) => {

  Location.propTypes = {
    position: prop.object.isRequired,
    file: prop.string.isRequired,
  }

  let { start } = position
  let length = position.toDelta()

  if (position.isSingleLine())
    length = `${length.column}`
  else
    length = `${length.row}, ${length.column}`

  // let filename = parseFilename(file)
  return <address className='location'>
    <span className='co'>{start.row}, {start.column}</span>
    <span className='len'>{length}</span>
    {/* <span className='fp'>{filename}</span> */}
  </address>
}


export default Location
