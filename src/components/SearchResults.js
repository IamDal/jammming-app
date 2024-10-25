import React, {useState, useEffect, useCallback} from "react";
import Tracklist from './Tracklist';
import Playlist from './Playlist';
import Track from "./Track";
import { createPlaylist } from "./spotify-requests";


export default function SearchResults({ searchResults, searchValue }) {

    const [selection, setSelection ] = useState([])
    const [playlistName, setPlaylistName] = useState('')
    const [tracklist, setTracklist] = useState([])
    const [selectionList, setSelectionList] = useState([])
    
    // Function to update playlist name
    const onChange = useCallback((e)=>{
        setPlaylistName(e.target.value)
    },[])

    // Function to handle new playlist submission
    const handleFormSubmit = useCallback((e) => {
        e.preventDefault()
        const selectionUri = selection.map((track)=>track['uri'])
        createPlaylist(playlistName, selectionUri)
        setSelection([])
        setTracklist([])
    },[playlistName, selection])

    // Function to add new song to playlist
    const addSong = useCallback((e) => {
        e.preventDefault()
        const trackId = e.target.id
        const songToAdd = searchResults.filter(track => {
            return track.uri === trackId
        })
        setSelection((prev)=>[...prev, songToAdd[0]])
    },[searchResults])

    // Function to remove song from playlist
    const removeSong = useCallback((e) => {
        e.preventDefault()
        const trackId = e.target.id
        setSelection((prev)=>{
            const selectionUpdate = prev.filter((track,index) => {
                return track.uri !== trackId
            })
            return selectionUpdate
        })
    },[])

    // Returns a list of tracks from search
    const updateTracklist = useCallback(() => {
        setTracklist(() => {
            if (!searchResults || !searchValue){
                return []
            }
            const newSearch =  searchResults.map((track) => {
                if (!track) {
                    return []
                }
                return(
                    <li key={track.uri}>
                        <Track song={track.song} artist={track.artist} 
                            album={track.album} cover={track.cover} 
                            id={track.uri} buttonValue='+'
                            handleSongUpdate={addSong}/>
                    </li>
                )
            })
            return newSearch
        })
    },[addSong,searchResults,searchValue])

    // Returns a list of tracks that have been selected
    const updateSelectionList = useCallback(() => {
        setSelectionList(()=>{
            const newSelection = selection.map((track)=>{
                return (
                    <li key={track.uri}>
                        <Track song={track.song} artist={track.artist}
                            album={track.album} cover={track.cover} 
                            id={track.uri} buttonValue='-' 
                            handleSongUpdate={removeSong} />
                    </li>
                )
            })
            return newSelection
        })
    },[selection,removeSong])

    // Effect updates track list on change
    useEffect(()=>{
        updateTracklist()
    },[searchResults, updateTracklist])

    // Effect updates selection on change
    useEffect(()=>{
        updateSelectionList()
    },[selection, updateSelectionList])

    return (
        <>
            <div className="App-container">
                <Tracklist tracklist={tracklist} handleClick={addSong}/>
                <Playlist selectionList={selectionList} 
                    handleSubmit={handleFormSubmit} 
                    playlistName= {playlistName} 
                    handleChange={onChange}/>
            </div>
        </>
    )
}
