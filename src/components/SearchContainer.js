import React from 'react'
import SearchBar from './SearchBar'
import SearchResults from './SearchResults'

export default function SearchContainer(props) {
    const {
        activePage, handleSubmit, handleChange, searchValue,
        setSearchValue, searchResults, playlistName,
        setPlaylistName, getCurrentPlaylist, playlistToModify,
        playlistSnapshotId, changePage, getUserPlaylists
    } = props

    return (
        <div>
            <SearchBar handleSubmit={handleSubmit} 
                handleChange={handleChange} 
                searchValue={searchValue}/>

            <SearchResults activePage={activePage} changePage={changePage} getUserPlaylists={getUserPlaylists}
                searchValue={searchValue} setSearchValue={setSearchValue} 
                searchResults={searchResults} playlistName={playlistName} 
                setPlaylistName={setPlaylistName} getCurrentPlaylist={getCurrentPlaylist} 
                playlistToModify={playlistToModify} playlistSnapshotId={playlistSnapshotId}/>
        </div>
    )
}