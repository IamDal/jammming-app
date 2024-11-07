import React from 'react'
import NavBar from './NavBar'

export default function Header(props) {
    const {handleLogout, changePage} = props
    return (
        <header className="App-header">
            <h1 className='title'>
                Ja<span className='App-span shake-text-a'>m</span>
                <span className='App-span shake-text-b'>m</span>
                <span className='App-span shake-text-c'>m</span>ing
            </h1>
            <NavBar handleLogout={handleLogout} changePage={changePage}/>
        </header>  
    )
}
