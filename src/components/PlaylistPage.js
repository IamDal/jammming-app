import React, {useState, useEffect, useCallback, useRef} from 'react'
import style from './css_modules/PlaylistPage.module.css'
import logo from './Spotify_Primary_Logo_RGB_White.png'

export default function PlaylistPage(props) {
    const {
        images, names, count, url, 
        goToPage, getCurrentPlaylist, activePage 
    } = props

    const [imageIndex, setImageIndex] = useState(0)
    const imageIndexRef = useRef(imageIndex);

    const increaseIndex = useCallback(() => {
        if (imageIndex < images.length-1){
            setImageIndex((prev)=> prev + 1)
        }else{
            setImageIndex(0)
        }
    },[setImageIndex, imageIndex, images])
    
    const decreaseIndex = useCallback(() => {
        if (imageIndex > 0){
            setImageIndex((prev)=> prev - 1)
        }else{
            setImageIndex(images.length-1)
        }
    },[imageIndex,setImageIndex,images])

    function handleClick(e) {
        const id = e.target.id
        const selectedIndex = parseInt(id.slice(5),10)
        setImageIndex(selectedIndex)
        imageIndexRef.current=selectedIndex
    }

    function modify(e) {
        getCurrentPlaylist(imageIndex)
        goToPage(e)
    }

    const playlistData = []
    for (let i = 0; i < names.length; i++){
        playlistData.push(
            <div key={`container-${i}`} id='imageContainer' className={activePage==='Playlists' ? 
            `${style.container}`:`${style.homeContainer}`}>
                <div key={`image-${i}`} className={`${style.imageContainer}`}>
                    {images === 'null'? 
                        <h1>blank Image</h1> 
                        : <img className={i===imageIndex? `${style.fadeIn}`:''} 
                        key={i} alt='Playlist Album Covers' src={images[i]}/>}
                </div>
                <h1 key={`h1-${i}`}>{names[i]}</h1>
                <h4 key={`h4-${i}`}>{count[i]} Songs</h4>
                <div key={`dots-${i}`} className={style.dots}>
                    {names.map((name,index)=>{return index === i? <div key={`dota-${index}`} id={`dota-${index}`} className={style.current}></div>:<div id={`dota-${index}`} key={`dotb-${index}`} onClick={handleClick}></div> })}
                </div>
                <a href={url[i]}>Listen on Spotify <img src={logo} className={style.linkLogo} alt="spotify logo"/></a>
            </div>
        )
    }

    useEffect(()=>{
        const timeoutId = setTimeout(()=>{
            if (imageIndexRef.current < images.length - 1){
                setImageIndex(imageIndexRef.current + 1)
                imageIndexRef.current = imageIndexRef.current + 1
            } else {
                setImageIndex(0)
                imageIndexRef.current = 0
            }
        }, 8000)
        return () => clearTimeout(timeoutId)

    },[images, imageIndex])

    return (
        <div className={style.carousel}>
            {playlistData[imageIndex]}
            <button className={style.modify} 
                    id={'modify'} 
                    onClick={modify}>Modify Playlist</button>
            <div className={style.carouselButtons} >
                <button className={activePage === 'Playlists' ? 
                    `${style.prev}` : `${style.homePrev}`} 
                    onClick={decreaseIndex}>&#10094;</button>

                <button className={activePage === 'Playlists' ? 
                    `${style.next}` : `${style.homeNext}`} 
                    onClick={increaseIndex}>&#10095;</button>
            </div>

        </div>
    )
  
}
