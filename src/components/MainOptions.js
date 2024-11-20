import React from 'react'
import style from './css_modules/MainOptions.module.css'
import PlaylistPage from './PlaylistPage'

export default function MainOptions(props) {
    const { 
        changePage, images, names, count, 
        url, id, getCurrentPlaylist, activePage } = props

    return (
        <div className={style.container}>
            <div className={style.optionsL}>
                <h1 id='new' className={style.optionsH1} onClick={changePage}>New Playlist</h1>
            </div>
            <div className={style.optionsR}>
                <PlaylistPage 
                    activePage={activePage} images={images} 
                    names={names} count={count} url={url} 
                    goToPage={changePage} id={id} 
                    getCurrentPlaylist={getCurrentPlaylist}/>
            </div>
        </div>
    )

}
