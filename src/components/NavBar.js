import React from 'react'
import style from './css_modules/NavBar.module.css'

export default function NavBar({handleLogout, changePage}) {
    const links = ["Home", "Profile", "Playlists", "Logout"]
    const nav = links.map((link,index) => {
        return (   
            <li key={`nav-${index}`}>
                <button id={link} className={style.buttons} onClick={link === "Logout"? handleLogout:changePage}>{link}</button>
            </li>
        )
    })

    return (
        <nav>
            <ul className={style.menu}>
                {nav}
            </ul>
        </nav>
    )
}
