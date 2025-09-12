import React from 'react'

function Buttons(props) {
  return (
    <div>
      <button className={props.classN} onClick={props.onClick}>
            {props.title} 
        </button>
    </div>
  )
}

export default Buttons
