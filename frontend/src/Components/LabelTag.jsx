import React from 'react'

function LabelTag(props) {
  return (
   <>
   <div>
    <label htmlFor={props.connect} className={props.className}>{props.title}</label>
   </div>
   </>
  )
}

export default LabelTag
