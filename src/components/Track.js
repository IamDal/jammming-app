import React from 'react'
import style from './css_modules/Track.module.css'
import images from './Spotify_Primary_Logo_RGB_White.png'
 
export default function Track({track, handleSongUpdate, buttonValue, prefix, setNowPlaying}) {
    const song = track.song
    const artist = track.artist 
    const album = track.album
    const cover = track.cover
    const id = prefix+track.uri
    const url = track.url

    const setAudioPreview = () => {
        setNowPlaying(track.id)
    }

    return (
        <div id={`id-${track.uri}`} className={style.trackContainer} onClick={setAudioPreview}>
            <div className={style.track}>
                <div className={style.cover}>
                    <img alt={`${song} Album Cover`} src={cover} />
                </div>
                <div className={style.details}>
                    <h3 className={style.title}>{song}</h3>
                    <h4 className={style.artist}>{artist} | {album}</h4>
                </div>
            </div>
            <div>
                <a href={url}><img className={style.spotifyImage} src={images} alt='Spotify logo'/></a>
                <button className={style.button} onClick={handleSongUpdate} id={id}>{buttonValue}</button>
            </div>
        </div>
    )
}