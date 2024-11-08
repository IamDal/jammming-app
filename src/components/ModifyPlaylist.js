import React from 'react'
import style from './css_modules/Playlist.module.css'
import Track from './Track'

export default function ModifyPlaylist(props) {
    const {
        removeSong, handleSubmit, dragstartHandler, 
        dragoverHandler, dropHandler, dragEnter,
        dragLeave, handleChange, playlistName, 
        tracksCopy, setNowPlaying
    } = props

    return (
        <>
            <form id='Modify-Playlist' name='Modify-Playlist' onSubmit={handleSubmit}>
                <input className={style.input} type='text' placeholder='Name'  
                    value={playlistName} onChange={handleChange}/>
                <div className={style.container}>
                    <ul id='target' onDrop={dropHandler} onDragOver={dragoverHandler}>
                        {tracksCopy.map((track) =>{ 
                        return ( 
                            <li id={track.uri} key={track.uri}
                                draggable="true" onDragStart={dragstartHandler}
                                onDragEnter={dragEnter} onDragLeave={dragLeave}>
                                <Track track={track} buttonValue="-"
                                    handleSongUpdate={removeSong} prefix='' 
                                    setNowPlaying={setNowPlaying}/>
                            </li>
                        )})}
                    </ul>
                </div>
                <button className={style.button}>Modify Playlist</button>
            </form>
        </>
    )
}

