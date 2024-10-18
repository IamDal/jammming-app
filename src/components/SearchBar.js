import React from 'react'

export default function SearchBar() {
    return(
        <>
            <form>
                <input id="search-bar"
                    placeholder='Enter song name or title'
                />
                <button>search</button>
            </form>
        </>
    )
}