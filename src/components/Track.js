import React from 'react'
import style from './Track.module.css'

export default function Track(props) {
    const song = props.song
    const artist = props.artist 
    const album = props.album
    const cover = props.cover
    return (
        <div className={style.trackContainer}>
            <div className={style.track}>
                <div className={style.cover}>
                    <img alt={`${song} Album Cover`} src={cover} />
                </div>
                <div className={style.details}>
                    <h3 className={style.title}>{song}</h3>
                    <h4 className={style.artist}>{artist} | {album}</h4>
                </div>
            </div>
            <button className={style.button} onClick={props.handleSongUpdate} id={props.id}>{props.buttonValue}</button>
        </div>
    )
}