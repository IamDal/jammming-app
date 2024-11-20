import './App.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import Login from './components/Login';
import MainOptions from './components/MainOptions';
import ProfilePage from './components/ProfilePage';
import PlaylistPage from './components/PlaylistPage';
import Header from './components/Header';
import SearchContainer from './components/SearchContainer';
import {
	getTrack, getAuthorizedToken, 
	redirectToSpotifyAuthorize, currentToken,
	getCurrentUser, getAllPlaylists, refreshToken
} from "./components/SpotifyRequests";

 
function App() {
	const [searchResults, setSearchResults] = useState([]);
	const [searchValue, setSearchValue] = useState('');
	const [activePage, setActivePage] = useState('Home');
	const [playlistToModify, setPlaylistToModify] = useState(null);
	const [playlistName, setPlaylistName] = useState('New Playlist');

	// variables to handle Playlist states
	const [playlistImages, setPlaylistImages] = useState([]);
	const [playlistNames, setPlaylistNames] = useState([]);
	const [playlistCounts, setPlaylistCounts] = useState(null);
	const [playlistUrl, setPlaylistUrl] = useState([]);
	const [playlistId, setPlaylistId] = useState([]);
	const [playlistSnapshotId, setPlaylistSnapshotId] = useState([]);
	const [currentSnapshotId, setCurrentSnapshotId] = useState('');
	const timeoutRef = useRef(null)
	const autoLogout = useRef(null)
	
	// Implement flash messages
	function flash(message,duration = 3000){
		const flashMessage = document.getElementById('flash-message')
		flashMessage.textContent = message
		flashMessage.backgroundColor = "#b00387"
		flashMessage.classList.remove("hidden")

		setTimeout(() => {
			flashMessage.classList.add('hidden')
		}, duration)
	}

	// Redirect to spotify authentication
	async function loginWithSpotifyClick() {
    	await redirectToSpotifyAuthorize();
  	}

	// handles Log out from app 
	const handleLogout = useCallback(()=>{
		localStorage.clear()
		setActivePage('login')
		window.location.reload()
	},[])

	// automatically logs out user after 1 hour of inactivity
	const timedLogout = useCallback(()=>{
		if (!localStorage.user){
			return
		}

		const timer  = localStorage.expires_in * 1000

		if (timeoutRef || autoLogout){
			clearTimeout(timeoutRef.current)
			clearTimeout(autoLogout.current)
		}

		timeoutRef.current = setTimeout(()=>{
			flash('Logging out after 5 minutes of inactivity!', 2000)
			autoLogout.current = setTimeout(()=>{
				handleLogout()
			}, 18000)
			return () => clearTimeout(autoLogout.current)
		}, timer - 18000)
		return () => clearTimeout(timeoutRef.current)
	},[handleLogout])

	// Get all current users playlists
	async function getUserPlaylists(){
		const playlistData = await getAllPlaylists()
		setPlaylistImages(()=>{
			return playlistData.map(item => {
				if (!item['images']){
					return null
				}
				return item['images'][0]['url']
			})
		})
		setPlaylistNames(() => {
			return playlistData.map(item => item['name'])
		})
		setPlaylistCounts(() => {
			return playlistData.map(item => item['tracks']['total'])
		})
		setPlaylistUrl(() => {
			return playlistData.map(item => item['external_urls']['spotify'])
		})
		setPlaylistId(() => {
			return playlistData.map(item => item['id'])
		})
		setPlaylistSnapshotId(() => {
			return playlistData.map(item => item['snapshot_id'])
		})
	}

	// Function to update api token
	const updateToken = useCallback( async () => {
    	const args = new URLSearchParams(window.location.search);
    	const code = args.get('code');
		// Get new token if valid code in search parameter
    	if (code) {
			try{
				const token = await getAuthorizedToken(code)
				if (!token['access_token']){
					return
				}
				currentToken.save(token)
				await getCurrentUser(token['access_token'])
				getUserPlaylists()
				timedLogout()
			} catch (error) {
				console.log(error.message)
			}
			// Removed code goes here
		// Update expired token if valid refresh token
  		} else if(currentToken["refresh_token"]){
			try{
				const token = await getAuthorizedToken(currentToken["refresh_token"])
				if (!token['access_token']){
					return
				}
				currentToken.save(token)
				await getCurrentUser(token['access_token'])
				getUserPlaylists()
				timedLogout()
			} catch (error) {
				console.log(error.message)
			}
		} else {
			return
		}
		// Remove code from URL so we can refresh correctly.
		const url = new URL(window.location.href);
		url.searchParams.delete("code");

		const updatedUrl = url.search ? 
			url.href : url.href.replace('?', '');

		window.history.replaceState(
			{}, document.title, updatedUrl
		);
		window.location.reload()
	},[timedLogout])


	// Effect to get new token if none 
	useEffect(()=>{
		const callUpdateToken = async () =>{
			const invalidTokens = [undefined, null, 'undefined', 'null', '']

			if(invalidTokens.includes(currentToken.access_token)){
			  await updateToken()
			}
		  }

		const args = new URLSearchParams(window.location.search);
    	const code = args.get('code');
		if(code){
			callUpdateToken()
		}
  	},[updateToken])


	// Gets new token on expiry
	useEffect(()=>{
		if (!currentToken.expires) return;

		const callRefreshToken = async () => {
			const newToken = await refreshToken();
			return newToken;
		};

		async function handleTokenRefresh() {
			const timer = new Date(currentToken.expires);
			const now = new Date(Date.now());
			
			// If expired or close to expiring
			if (!(timer - now <= 25000)){ 
				return
			}; 
			try{
				// Wait for the token to resolve
				const token = await callRefreshToken(); 
				// Update the token if successful
				if (token && token.access_token) {
					currentToken.save(token); 
				}
			} catch(e) {
				console.log("Failed to refresh token", e);
			}
		}
	
		handleTokenRefresh();
		timedLogout()
	}, [activePage, timedLogout]);


	useEffect(()=>{
		if(currentToken.user){
			getUserPlaylists()
		}
	}, [])

	// Updates Search list
	async function newSearch() {
		try{
			const trackDetails = await getTrack(searchValue)
			setSearchResults(()=>{
        		return trackDetails
      		})
		} catch (error) {
			console.error(error.message)
		}
  	}

	// Updates tracks when the searchbar changes
	function handleChange(e){
		setSearchValue(e.target.value)
		newSearch()
	}

	// Handle search bar submission
	function handleSubmit(e){
		e.preventDefault()
		newSearch()
	}

	function goToPage (e) {
		const pageId = e.target.id
		setActivePage(pageId)
	}

	function getCurrentPlaylist(index) {
		setPlaylistToModify(playlistId[index])
		setCurrentSnapshotId(playlistSnapshotId[index])
		setPlaylistName(playlistNames[index])
	}

	return (
		<div className="App">
			{ currentToken.user === 'undefined' || !currentToken.user ?
			<Login handleClick={loginWithSpotifyClick}/>
				:<div className="App-rows">
					<Header handleLogout={handleLogout} changePage={goToPage}/>
					<div id= "flash-message" className="hidden flash-message"></div>
					{activePage === 'Home' && 
						<MainOptions changePage={goToPage} url={playlistUrl} 
							images={playlistImages} names={playlistNames} 
							count={playlistCounts} id={playlistId} 
							activePage={activePage} 
							getCurrentPlaylist={getCurrentPlaylist}/>}

					{(activePage === 'new' || activePage === 'modify') && 
						<SearchContainer handleSubmit={handleSubmit} 
								handleChange={handleChange} searchValue={searchValue} changePage={setActivePage}
								activePage={activePage} setSearchValue={setSearchValue} getUserPlaylists={getUserPlaylists}
								searchResults={searchResults} playlistName={playlistName} 
								setPlaylistName={setPlaylistName} getCurrentPlaylist={getCurrentPlaylist} 
								playlistToModify={playlistToModify} playlistSnapshotId={currentSnapshotId}/>}

					{activePage === 'Profile' && 
						<ProfilePage/>}

					{activePage === 'Playlists' && 
						<PlaylistPage goToPage={goToPage} url={playlistUrl} 
							activePage={activePage} playlistSnapshotId={currentSnapshotId}
							images={playlistImages} names={playlistNames} count={playlistCounts} 
							id={playlistId} getCurrentPlaylist={getCurrentPlaylist}/>}
				</div> }
		</div>
	);
}

export default App;