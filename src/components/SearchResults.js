import React, {useState, useEffect, useCallback} from "react";
import Tracklist from './Tracklist';
import Playlist from './Playlist';
import Track from "./Track";
import style from './css_modules/SearchResults.module.css'
import { createPlaylist, getPlaylistTracks, modifyUserPlaylist } from "./SpotifyRequests";


export default function SearchResults(props) {
    const { searchResults, searchValue, setSearchValue, 
        activePage, playlistToModify, playlistSnapshotId, 
        playlistName, setPlaylistName, changePage, getUserPlaylists } = props

    const [selection, setSelection ] = useState([])
    const [currentPlaylistName, setCurrentPlaylistName ] = useState(playlistName)
    const [tracklist, setTracklist] = useState([])
    const [selectionList, setSelectionList] = useState([])
    const [modifiedSelectionList, setModifiedSelectionList] = useState([])
    const [playlistTracks, setPlaylistTracks] = useState([])
    const [tracksCopy, setTracksCopy] = useState([])
    const [modifiedUris, setModifiedUris] = useState([])
    const [nowPlaying, setNowPlaying] = useState("")


    const updateModifiedList = useCallback(() => {
        const list = document.getElementById('target')
        let uris = []
        for (let child of list.children){
            uris.push(child.id)
        }
        setModifiedUris(uris)
    },[setModifiedUris])

    // Define dragging Functionality
	function dragstartHandler(e){
        e.dataTransfer.setData("text/plain", e.target.id)
        e.dataTransfer.effectAllowed = "move"
	}


    function dragoverHandler(e){
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }


    function dropHandler(e){
        e.preventDefault()
        const draggedId = e.dataTransfer.getData("text/plain");
        const draggedElement = document.getElementById(draggedId);
    
        const targetList = e.currentTarget; // Ensures targeting `ul`
        const closestLi = e.target.closest("li");
    
        if (closestLi && closestLi !== draggedElement) {
            targetList.insertBefore(draggedElement, closestLi);
            
        } else {
            targetList.appendChild(draggedElement); // Fallback: append to end if target isn’t suitable
        }
        updateModifiedList()
        getTrackModifications()
    }


    function dragEnter(e) {
        e.preventDefault();
        e.target.classList.add('over');
    }
    

    function dragLeave(e) {
        e.target.classList.remove('over');
    }


    const fetchTracks = useCallback(async () => {
        const tracks = await getPlaylistTracks(playlistToModify)
        setPlaylistTracks(tracks)
        setTracksCopy(tracks)
    },[playlistToModify])


    useEffect(()=>{
        if(playlistToModify && activePage === "modify")
            fetchTracks()
    },[playlistToModify, fetchTracks, activePage])


    const getTrackModifications = useCallback(()=>{
        const originalPlaylistUris = playlistTracks.map(track => track.uri)
        const addedTracks = modifiedUris.filter((mUri)=>{
            return !originalPlaylistUris.some(uri => uri === mUri)
        })

        const removedTracks = originalPlaylistUris.filter((uri)=>{
            return !modifiedUris.some(mUri => uri === mUri)
        })

        const playlistMod = {
            newName: playlistName,
            name: currentPlaylistName,
            added: addedTracks,
            removed: removedTracks,
            sorted: modifiedUris,
            original: originalPlaylistUris,
            snapshotId: playlistSnapshotId,
            playlistId: playlistToModify
        }
        return playlistMod
    },[modifiedUris, playlistSnapshotId, playlistToModify, playlistTracks, playlistName, currentPlaylistName])


    async function submitPlaylist(e){
        e.preventDefault()
        const playlistObject = getTrackModifications()
        await modifyUserPlaylist(playlistObject)
        setTracklist([])
        setSearchValue('')
        setPlaylistName('')
        changePage('new')
        setCurrentPlaylistName('')
        getUserPlaylists()
    }

    // Function to update playlist name
    const onChange = useCallback((e)=>{
        setPlaylistName(e.target.value)
    },[setPlaylistName])

    // Function to handle new playlist submission
    const handleFormSubmit = useCallback((e) => {
        e.preventDefault()
        const selectionUri = selection.map((track)=>track['uri'])
        createPlaylist(playlistName, selectionUri)
        setSelection([])
        setTracklist([])
        setPlaylistName('')
        setSearchValue('')
        getUserPlaylists()
    },[playlistName, selection, setPlaylistName, setSearchValue, getUserPlaylists])

    // Function to add new song to playlist
    const addSong = useCallback((e) => {
        e.preventDefault()
        let trackId = e.target.id
        trackId = trackId.slice(6)
        const songToAdd = searchResults.filter(track => {
            return track.uri === trackId
        })
        songToAdd[0].added = true
        if (activePage === 'new'){
            setSelection((prev)=>[...prev, songToAdd[0]])
        }
        if (activePage === 'modify'){
            setTracksCopy((prev)=>[...prev, songToAdd[0]])
        }
    },[searchResults, activePage])

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
    },[setSelection])

    const removeFromExistingPlaylist = useCallback((e) => {
        e.preventDefault()
        const trackId = e.target.id
        setTracksCopy((prev)=>{
            const selectionUpdate = prev.filter((track,index) => {
                return track.uri !== trackId
            })
            return selectionUpdate
        })
    },[setTracksCopy])

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
                        <Track track={track} buttonValue='+' prefix='track-'
                            handleSongUpdate={addSong} setNowPlaying={setNowPlaying}/>
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
                    <li id={track.uri} key={track.uri}
                        draggable="true" onDragStart={dragstartHandler}
                        onDragEnter={dragEnter} onDragLeave={dragLeave}>
                        <Track track={track} buttonValue='-' prefix=''
                            handleSongUpdate={removeSong} setNowPlaying={setNowPlaying}/>
                    </li>
                )
            })
            return newSelection
        })
    },[selection,removeSong])

    const updateModifiedSelection = useCallback(()=>{
        setModifiedSelectionList(()=>{
            const modification = tracksCopy.map((track) => { 
                return ( 
                    <li id={track.uri} key={track.uri}
                        draggable="true" onDragStart={dragstartHandler}
                        onDragEnter={dragEnter} onDragLeave={dragLeave}>
                        <Track track={track} buttonValue="-" prefix=''
                            handleSongUpdate={removeFromExistingPlaylist} setNowPlaying={setNowPlaying}/>
                    </li>
                )
            })
            return modification
        })
    },[tracksCopy, removeFromExistingPlaylist]) 

    // Effect updates track list on change
    useEffect(()=>{
        updateTracklist()

        if(searchValue === ''){
            setNowPlaying("")
        }
    },[searchResults, updateTracklist, playlistTracks, searchValue])

    // Effect updates selection on change
    useEffect(()=>{
        if (selection.length>0){
            updateSelectionList()
        } else if (tracksCopy.length>0){
            updateModifiedSelection()
        }

    },[selection, updateSelectionList,tracksCopy,updateModifiedSelection])

    // Effect updates moved tracks new location
    /*
    useEffect(()=>{
        updateModifiedSelection()
    },[tracksCopy, updateModifiedSelection])
    */

    // Effect updates list of all modified uri
    useEffect(()=>{
        if(modifiedSelectionList){
            updateModifiedList()
        }
    },[modifiedSelectionList,updateModifiedList])

    return (
        <>
            <div className={style.appContainer}>
                <Tracklist tracklist={tracklist} handleClick={addSong}/>
                <Playlist selectionList={selectionList} modifiedList={modifiedSelectionList} handleSubmit={handleFormSubmit} 
                    playlistName= {playlistName} handleChange={onChange} handleSubmitPlaylist={submitPlaylist} page={activePage}
                    dropHandler={dropHandler} dragoverHandler={dragoverHandler} updateModifiedList={updateModifiedList}
                    />
            </div>
            <div>
            {nowPlaying && <iframe className={style.mediaPlayer} title="Media Player" src={`https://open.spotify.com/embed/track/${nowPlaying}`} 
                width="80%" height="80" frameBorder="0"
                allowtransparency="true" allow="encrypted-media"></iframe>}
            </div>
        </>
    )
}