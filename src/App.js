import './App.css';
import { useState, useEffect, useCallback } from 'react';
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
	const [playlistToModify, setPlaylistToModify] = useState('');
	const [playlistName, setPlaylistName] = useState('');
	// Playlist states
	const [playlistImages, setPlaylistImages] = useState([]);
	const [playlistNames, setPlaylistNames] = useState([]);
	const [playlistCounts, setPlaylistCounts] = useState(null);
	const [playlistUrl, setPlaylistUrl] = useState([]);
	const [playlistId, setPlaylistId] = useState([]);
	const [playlistSnapshotId, setPlaylistSnapshotId] = useState([]);
	const [currentSnapshotId, setCurrentSnapshotId] = useState('');
	
	// Logs in current user
	async function loginWithSpotifyClick() {
    	await redirectToSpotifyAuthorize();
  	}

	// get all playlists
	async function getUserPlaylists(){
		const playlistData = await getAllPlaylists()

		setPlaylistImages(()=>{
			const images = playlistData.map(item => {
				if (!item['images']){
					return null
				}
				return item['images'][0]['url']
			})
			return images
		})
		setPlaylistNames(()=>{
			const names = playlistData.map(item => {
				return item['name']
			})
			return names
		})
		setPlaylistCounts(()=>{
			const count = playlistData.map(item => {
				return item['tracks']['total']
			})
			return count
		})
		setPlaylistUrl(()=>{
			const url = playlistData.map(item => {
				return item['external_urls']['spotify']
			})
			return url
		})
		setPlaylistId(()=>{
			const id = playlistData.map(item => {
				return item['id']
			})
			return id
		})
		setPlaylistSnapshotId(()=>{
			const snapshotId = playlistData.map(item => {
				return item['snapshot_id']
			})
			return snapshotId
		})	
	}

	// Function to update api token
	const updateToken = useCallback( async () => {
    	const args = new URLSearchParams(window.location.search);
    	const code = args.get('code');
		// Update token if valid code in search parameter
    	if (code) {
			try{
				const token = await getAuthorizedToken(code)
				if (!token['access_token']){
					return
				}
				currentToken.save(token)
				await getCurrentUser(token['access_token'])
				getUserPlaylists()
			} catch (error) {
				console.log(error.message)
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
  		} else if(refreshToken){
			try{
				const token = await getAuthorizedToken(refreshToken)
				if (!token['access_token']){
					return
				}
				currentToken.save(token)
				await getCurrentUser(token['access_token'])
				getUserPlaylists()
			} catch (error) {
				console.log(error.message)
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
		}
	},[])

	const callUpdateToken = useCallback( async () =>{
		if(currentToken.access_token === 'undefined' || !currentToken.access_token || currentToken.access_token === 'null'){
		  await updateToken()
		}
  	},[updateToken])

	// Effect to get new token if none 
	useEffect(()=>{
		const args = new URLSearchParams(window.location.search);
    	const code = args.get('code');
		if(code){
			callUpdateToken()
		}
  	},[callUpdateToken])


	const callRefreshToken = useCallback(async () => {
		const newToken = await refreshToken();
		return newToken;
	}, []);

	// Gets new token on expiry
	useEffect(()=>{
		if (!currentToken.expires) return;

		async function handleTokenRefresh() {
			const timer = new Date(currentToken.expires);
			const now = new Date(Date.now());
	
			if (timer - now <= 0) return; // If expired or close to expiring
	
			const token = await callRefreshToken(); // Wait for the token to resolve
			if (token && token.access_token) {
				console.log("New token:", token);
				currentToken.save(token); // Update the token if successful
			} else {
				console.log("Failed to refresh token", token);
			}
		}
	
		handleTokenRefresh();
	}, [activePage, callRefreshToken]);


	useEffect(()=>{
		if(currentToken.user){
			getUserPlaylists()
		}
	}, [activePage])

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

	function handleLogout(){
		localStorage.clear()
		setActivePage('login')
		window.location.reload()
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
					{activePage === 'Home' && 
						<MainOptions changePage={goToPage} url={playlistUrl} 
							images={playlistImages} names={playlistNames} 
							count={playlistCounts} id={playlistId} 
							activePage={activePage} 
							getCurrentPlaylist={getCurrentPlaylist}/>}

					{(activePage === 'new' || activePage === 'modify') && 
						<SearchContainer handleSubmit={handleSubmit} 
								handleChange={handleChange} searchValue={searchValue} changePage={setActivePage}
								activePage={activePage} setSearchValue={setSearchValue} 
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