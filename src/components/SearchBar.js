import React from 'react';

export default function SearchBar({handleChange, handleSubmit, searchValue}) {

    return(
        <>
            <form onSubmit={handleSubmit}>
                <input id="search-bar"
                    placeholder='Enter song name or title'
                    value={searchValue}
                    onChange={handleChange}
                />
                <button>search</button>
            </form>
        </>
    )
}