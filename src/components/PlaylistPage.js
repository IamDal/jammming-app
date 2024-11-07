import React, {useState, useEffect, useCallback} from 'react'
import style from './css_modules/PlaylistPage.module.css'

export default function PlaylistPage(props) {
    const {
        images, names, count, url, 
        goToPage, getCurrentPlaylist, activePage 
    } = props

    const [imageIndex, setImageIndex] = useState(0)

    const increaseIndex = useCallback(() => {
        if (imageIndex < images.length-1){
            setImageIndex((prev) => prev + 1)
        }else{
            setImageIndex(0)
        }
    },[setImageIndex, imageIndex, images])
    
    const decreaseIndex = () => {
        if (imageIndex > 0){
            setImageIndex((prev) => prev - 1)
        }else{
            setImageIndex(images.length-1)
        }
    }

    function modify(e) {
        getCurrentPlaylist(imageIndex)
        goToPage(e)
    }

    const playlistData = []
    for (let i = 0; i < names.length; i++){
        playlistData.push(
            <div id='imageContainer' className={activePage==='Playlists' ? 
            `${style.container}`:`${style.homeContainer}`}>
                <div className={`${style.imageContainer}`}>
                    {images === 'null'? 
                        <h1>blank Image</h1> 
                        : <img className={i===imageIndex? `${style.fadeIn}`:''} 
                        key={i} alt='Playlist Album Covers' src={images[i]}/>}
                </div>
                <h1>{names[i]}</h1>
                <h4>{count[i]} Songs</h4>
                <div className={style.dots}>
                    {names.map((name,index)=>{return index === i? <div className={style.current}></div>:<div></div> })}
                </div>
                <a href={url[i]}>Listen on Spotify</a>
                <button className={style.modify} 
                    id={'modify'} 
                     onClick={modify}>Modify playlist</button>
            </div>
        )
    }

    useEffect(()=>{
        const timeout = setTimeout(()=>{
            increaseIndex()
        },8000)
        return () => clearTimeout(timeout)

    },[increaseIndex])

    return (
        <div className='carousel'>
            {playlistData[imageIndex]}
            <button className={activePage === 'Playlists' ? 
                `${style.prev}` : `${style.homePrev}`} 
                onClick={decreaseIndex}>&#10094;</button>

            <button className={activePage === 'Playlists' ? 
                `${style.next}` : `${style.homeNext}`} 
                onClick={increaseIndex}>&#10095;</button>
        </div>
    )
  
}
