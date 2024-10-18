import React, { useState } from 'react'
import Track from './Track'

export default function Playlist (props) {

  return(
    <>
        <form onSubmit={props.handleSubmit}>
            <input type='text' placeholder='Name your Playlist' value={props.playlistName} onChange={props.handleChange}/>
            <ul>
                {props.selectionList}
            </ul>
            <button>submit</button>
        </form>

    </>
  )
}
