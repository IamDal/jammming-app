import React from 'react'
import style from './css_modules/Playlist.module.css'

export default function Playlist (props) {

  const {
    handleSubmit, playlistName, 
    handleChange, selectionList
  } = props

  return(
    <>
        <form onSubmit={handleSubmit}>
            <input className={style.input} type='text' 
                placeholder='New Playlist' value={playlistName} 
                onChange={handleChange}/>
            <div className={style.container}>
                <ul>
                    {selectionList}
                </ul>
            </div>
            <button className={style.button}>Create New Playlist</button>
        </form>
    </>
  )
}
