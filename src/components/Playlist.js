import React from 'react'
import style from './css_modules/Playlist.module.css'

export default function Playlist (props) {

  const {
    handleSubmit, playlistName, handleSubmitPlaylist,dragoverHandler,
    handleChange, selectionList,page, modifiedList,dropHandler
  } = props

  const formId = ['New-Playlist', 'Modify-Playlist']
  const content = (
        <>
            <input id='playlist-name' className={style.input} type='text' 
            placeholder='Playlist Name' value={playlistName} 
            onChange={handleChange}/>

            <div className={style.container}>
                <ul id='target' onDrop={dropHandler} onDragOver={dragoverHandler}>
                    {page === 'new'? selectionList:modifiedList}
                </ul>
            </div>

            <button id="playlist-submit" className={style.button}>
                {page === 'new'?'Create New Playlist':'Modify Playlist'}
            </button>
        </>
    )

  return(
    <form name={formId[page === 'new' ? 0 : 1]}  id={formId[page === 'new' ? 0 : 1]} 
          onSubmit={page === 'new' ? handleSubmit : handleSubmitPlaylist}>
        {content}
    </form>
  )
}
