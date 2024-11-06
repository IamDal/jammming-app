import React from 'react'
import style from './css_modules/Login.module.css'
import images from './Spotify_Full_Logo_RGB_White.png'

export default function Login({handleClick}){
    return(
        <div className={style.container}>
            <h1 className={style.loginH1}>
                Ja<span className='App-span'>mmm</span>ing
            </h1>
            <p>powered by</p>
            <img className={style.spotifyImage}src={images} alt='Spotify logo'/>
            <button className={style.loginButton} onClick={handleClick}>Login</button>
        </div>

    )
}