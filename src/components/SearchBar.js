import React from 'react';
import style from './css_modules/SearchBar.module.css'

export default function SearchBar(props) {
    const {handleChange, handleSubmit, searchValue} = props
    return(
        <>
            <form onSubmit={handleSubmit}>
                <div  className={style.container}>
                    <input id="search-bar"
                        className={style.searchBar}
                        placeholder={`Hi ${localStorage.getItem('user')}, what are you looking for?`}
                        value={searchValue}
                        onChange={handleChange}
                    />
                    <button>GO</button>
                </div>
            </form>
        </>
    )
}