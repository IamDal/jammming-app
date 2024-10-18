import React, {useState} from "react";
import Tracklist from './Tracklist';
import Playlist from './Playlist';
import Track from "./Track";

const searchResults = [
  {artist:'Dalton',
    song: 'Cookie and Cream',
    album: 'Mixing Sweets',
    uri: 'sample_uri'},
  {artist:'Dalton',
    song: 'Peaches and Cream',
    album: 'Mixing Sweets',
    uri: 'sample_uri_2'}
  ]

export default function SearchResults(props) {
    const [selection, setSelection ] = useState([])
    const [playlistName, setPlaylistName] = useState('')

    function onChange(e){
        setPlaylistName(e.target.value)
    }

    function handleFormSubmit(e){
        e.preventDefault()
        const selectionUri = selection.map((track)=>track['uri'])
        console.log(selectionUri)
        setSelection([])
    }

    function addSong(e){
        const trackId = e.target.id
        const songToAdd = searchResults[trackId]
        setSelection(()=>[...selection, songToAdd])
    }

    function removeSong(e){
        const trackId = e.target.id
        setSelection(()=>{
            const selectionUpdate = selection.filter((track,index) => index != trackId)
            return selectionUpdate
        })
    }

    const tracklist = searchResults.map((track,index)=>{
        return(
            <li key={track.uri}>
                <Track song={track.song} artist={track.artist} 
                    album={track.album} id={index} buttonValue='+'
                    handleClick={addSong}/>
            </li>
        )
    })

    const selectionList = selection.map((track,index)=>{
        return(
            <li key={track.uri}>
                <Track song={track.song} artist={track.artist}
                    album={track.album} id={index} buttonValue='-' 
                    handleClick={removeSong} />
            </li>
        )
    })

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
