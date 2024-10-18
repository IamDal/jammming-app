import React from 'react'
import style from './Track.module.css'

export default function Track(props) {
    const song = props.song
    const artist = props.artist 
    const album = props.album
    return (
        <div className={style.trackContainer}>
            <div>
                <h3 className={style.title}>{song}</h3>
                <h4 className={style.artist}>{artist} | {album}</h4>
            </div>
            <button className={style.button} onClick={props.handleClick} id={props.id}>{props.buttonValue}</button>
        </div>
    )
}