import React from 'react'
import style from './Playlist.module.css'

export default function Playlist (props) {

  return(
    <>
        <form onSubmit={props.handleSubmit}>
            <input className={style.input} type='text' placeholder='New Playlist' value={props.playlistName} onChange={props.handleChange}/>
            <ul>
                {props.selectionList}
            </ul>
            <button className={style.button}>Create New Playlist</button>
        </form>

    </>
  )
}
