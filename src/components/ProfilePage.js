import React from 'react'
import style from './css_modules/ProfilePage.module.css'
export default function ProfilePage() {
    const image = localStorage.getItem('img_url')
    const user = localStorage.getItem('user')
    const location = localStorage.getItem('country')
    const followerCount = localStorage.getItem('followers')
    const url = localStorage.getItem('spotify_url')

    return (
        <div className={style.container}>
            <div className={style.imageContainer}>
                {image === 'null'? 
                <h1>{user[0]}</h1>:<img alt='user profile' src={image}/>}
            </div>

            <h1>
                {user}
            </h1>
            <h3>
                {location}
            </h3>
            <p>
                Followers
            </p>
            <h4>
                {followerCount}
            </h4>
            <button className={style.button}>
                <a href={url}>see on spotify</a>
            </button>
        </div>
    )
}
