import getUpdatedTrackLocations from "./reorder.js"

const clientId = process.env.REACT_APP_CLIENT_ID;
const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
const tokenURL = "https://accounts.spotify.com/api/token";
const apiURL = "https://api.spotify.com/v1/";
//const redirectUri = 'https://jammmingwithdal.netlify.app/';
const redirectUri = 'http://localhost:3000';
const tokenType="Bearer"
const accessToken = localStorage.getItem('access_token');

  // Stores the Access Token response in local variable
const currentToken = {
    get user () {
        return localStorage.getItem('user') || null;
    },
    get access_token() { 
        return localStorage.getItem('access_token') || null; 
    },
    get refresh_token() { 
        return localStorage.getItem('refresh_token') || null; 
    },
    get expires_in() { 
        return localStorage.getItem('expires_in') || null; 
    },
    get expires() { 
        return localStorage.getItem('expires') || null; 
    },
  
    save(response) {
        const { access_token, refresh_token, expires_in } = response;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('expires_in', expires_in);
        const now = new Date();
        const expiry = new Date(now.getTime() + (expires_in * 1000));
        localStorage.setItem('expires', expiry);
    }
  };


  const currentUser = {
    _userId: null,
    _userName: null,
    _profileImage: null,
    _country: null,
    _followers: null,
    _spotifyURL: null,

    get userId (){
        return this._userId
    },
    get userName() {
        return this._userName
    },
    get profileImage() {
        return this._profileImage
    },
    get country() {
        return this._country
    },
    get followers() {
        return this._followers
    },
    get spotifyURL() {
        return this._followers
    },
    setUserId(id) {
        this._userId = id
        console.log(`User ID updated!`)
    },
    setUserName(name) {
        this._userName = name
        localStorage.setItem('user', this._userName)
        console.log(`User name updated!`)
    },
    setProfileImage(url) {
        this._profileImage = url
        localStorage.setItem('img_url', this._profileImage)
        console.log(`User display image updated!`)
    },
    setCountry(country) {
        this._country = country
        localStorage.setItem('country', this._country)
        console.log(`User country updated!`)
    },
    setFollowers(follower) {
        this._followers = follower
        localStorage.setItem('followers', this._followers)
        console.log(`User followers updated!`)
    },
    setSpotifyURL(url) {
        this._spotifyURL = url
        localStorage.setItem('spotify_url', this._spotifyURL)
        console.log(`url updated!`)
    },
  }

// Calls Spotify API for a list of tracks
async function getTrack(searchTerm) {
    const query = `search?q=${encodeURIComponent(searchTerm)}&type=track`
    const limit = "&limit=50"
    const urlToFetch = apiURL+query+limit
    const headers = { "Authorization":`${tokenType} ${accessToken}` }

    try {
        const response = await fetch(urlToFetch, { headers });
        if (!response.ok) {
            throw new Error(`Error loading tracks: ${response.status}`)
        }
        const data = await response.json()
        const trackData = await data['tracks']['items']

        const tracks = trackData.map(items => {
            const albumCover = items['album']['images'].slice(-1)[0]
            return {
                artist: items['artists'].map(artist => artist.name).join(', '),
                song: items['name'],
                album: items['album']['name'],
                uri: items['uri'],
                id: items['id'],
                preview: items['preview_url'],
                url:items['external_urls']['spotify'],
                cover: albumCover['url'],
                added: false,
                removed: false
            }
        })
        return tracks
    } catch (error) {
        console.log(error.message)
    }
}

// Makes the relevant API calls to update Existing Playlist
async function modifyUserPlaylist(playlistObject){
    const addedTracks = playlistObject.added
    const removedTracks = playlistObject.removed
    const playlistId = playlistObject.playlistId
    const sortedURI = playlistObject.sorted
    const snapshotId = playlistObject.snapshotId

    if (addedTracks.length > 0){
        await addTracksToPlaylist(addedTracks, playlistId)
    }
    if (removedTracks.length > 0){
        await removeTracksFromPlaylist(removedTracks, playlistId, snapshotId)
    }
    if (playlistObject.name !== playlistObject.newName){
        await updatePlaylistName(playlistId, playlistObject.newName)
    }
    await updateTracks(sortedURI, playlistId)
}

// Calls Spotify API for a specific Playlist(In this case the latest playlist)
async function getPlaylist(playlistId){
    const endpoint = apiURL + `playlists/${await playlistId}`
    const headers = {             
        "Authorization": `${tokenType} ${accessToken}`,
    }
    try {
        const response = await fetch(endpoint,{
            method: "GET", headers
        })
        if (!response.ok){
            throw new Error(`Error if request: ${response.status}`)
        }
        const data = await response.json()
        const playlistUris = data["tracks"]["items"].map(item => item["track"]["uri"])
        return {
            uri: playlistUris,
            snapshotId: data["snapshot_id"],
        }
    } catch (error) {
        console.log(error)
    }
}

// Calls Spotify API and replaces a specific playlist name
async function updatePlaylistName(playlistId, nameOfPlaylist) {
    const endpoint = apiURL + `playlists/${playlistId}`
    const headers = {             
        "Authorization": `${tokenType} ${accessToken}`,
        "Content-Type": "application/json"
    }
    const description = `${nameOfPlaylist} description`
    try {
        const response = await fetch(endpoint,{
            method:"PUT",
            headers: headers,
            body: JSON.stringify({
                "name": nameOfPlaylist,
                "description": description,
                "public": false
            })
        })
        if(!response.ok){
            throw new Error(`Error renaming playlist: ${response.status}`)
        }
        alert('Name Changed successful')
    } catch (error) {
        console.log(error.message)
    }
}

// Calls Spotify API and reorders the tracks
async function updateTracks(final, playlistId) {
    const updatedPlaylist = await getPlaylist(playlistId)
    const moveList = getUpdatedTrackLocations(updatedPlaylist.uri, final)
    if(JSON.stringify(updatedPlaylist.uri) === JSON.stringify(final)){
        return
    }
    const endpoint = apiURL + `playlists/${await playlistId}/tracks`
    const headers = {             
        "Authorization": `${tokenType} ${accessToken}`,
        "Content-Type": "application/json"
    }
    
    for (let index=0; index<moveList.length; index++) {
        const move = moveList[index]
        try {
            const response = await fetch(endpoint,{
                method:"PUT",
                headers:headers,
                body: JSON.stringify({ 
                    range_start: move.range_start, 
                    insert_before: move.insert_before, 
                    range_length: move.range_length, 
                    snapshot_id: updatedPlaylist.snapshotId 
                })
            })
            if (!response.ok){
                throw new Error(`Error while trying to update: ${response.status}`)
            }
        } catch (error) {
            console.log(error)
        }
    }
    alert('Songs Updated Successfully')
}

// Calls Spotify API and removes tracks from an existing playlist
async function removeTracksFromPlaylist(urisToRemove, playlistId, snapshotId){
    const endpoint = apiURL + `playlists/${playlistId}/tracks`
    const headers = {             
        "Authorization": `${tokenType} ${accessToken}`,
        "Content-Type": "application/json"
    }
    const uriObjects = urisToRemove.map(uri => {
        return { "uri" : uri }
    })
    const data = JSON.stringify({ 
        "tracks" : uriObjects, 
        "snapshot_id" : snapshotId 
    })
    console.log(uriObjects, playlistId, snapshotId)
    try {
        const response = await fetch(endpoint, {
            method:"DELETE", 
            headers:headers, 
            body:data
        })
        if (!response.ok) {
            throw new Error(`Error Deleting Tracks: ${response.status}`)
        }
        console.log('Songs Deleted Successfully')
    } catch (error) {
        console.log(`Error during request: ${error}`)
    }
}

// Calls Spotify API for the tracks in a specific playlist
async function getPlaylistTracks(playlistId) {
    const endpoint = apiURL + `playlists/${playlistId}/tracks`
    const headers = { "Authorization":`${tokenType} ${accessToken}` }
    try {
        const response = await fetch(endpoint, { headers });
        if (!response.ok) {
            throw new Error(`Response Status: ${response.status}`)
        }
        const responseAsJson = await response.json()
        const trackData = await responseAsJson['items']
        if (trackData['items'] < 1){
            return {
                artist: null,
                song: null,
                album: null,
                uri: null,
                id: null,
                url:null,
                cover: null,
                added: false,
                removed: false
            }
        }
        const tracks = trackData.map((items, index) => {
            const albumCover = items['track']['album']['images'].slice(-1)[0]
            return {
                artist: items['track']['artists'].map(artist => artist.name).join(', '),
                song: items['track']['name'],
                album: items['track']['album']['name'],
                uri: items['track']['uri'],
                id: items['track']['id'],
                url:items['track']['external_urls']['spotify'],
                cover: albumCover['url'],
                added: false,
                removed: false
            }
        })
        return tracks
    } catch (error) {
        console.log(error.message)
    }
}

// Calls Spotify API for the current user details
async function getCurrentUser(accessToken) {
    if (!localStorage.userName){
        const endpoint = apiURL + "me"
        const headers = {
            "Authorization": `${tokenType} ${accessToken}`
        }
        try{
            const response = await fetch(endpoint,{ headers })
            if (!response.ok){
                alert(`Error: ${response.status}`)
                throw new Error(`Error: ${response.status}`)
            }
            
            const data = await response.json()
            currentUser.setUserName(data['display_name'])
            currentUser.setUserId(data['id'])
            if (data['images'].length === 0){
                currentUser.setProfileImage(null)
            } else {
                currentUser.setProfileImage(data['images'][0]['url'])
            }
            currentUser.setCountry(data['country'])
            currentUser.setFollowers(data['followers']['total'])
            currentUser.setSpotifyURL(data['external_urls']['spotify'])
            return currentUser
        } catch (error) {
            console.log(error.message)
        }
    }
}

// Calls Spotify API to create a playlist
async function createPlaylist(nameOfPlaylist, tracks) {
    try {
        const user = await getCurrentUser(accessToken)
        const userId = user.userId //"31j7onrgr45a5sso427rl7ddzwoy"//
        const endpoint = `${apiURL}users/${userId}/playlists`
        const description = `${nameOfPlaylist} description`
        const headers = {
            "Authorization": `${tokenType} ${accessToken}`,
            "Content-Type": "application/json"
        };
        const body = JSON.stringify({
            "name": nameOfPlaylist,
            "description": description,
            "public": false
        })
        const response = await fetch(endpoint, {
            method:"POST", headers, body
        })
        if(!response.ok) {
            throw new Error(`Error: ${response.status}`)
        }
        try {
            const playlistId = await getPlaylistId(nameOfPlaylist)
            await addTracksToPlaylist(tracks, playlistId)
        } catch(error){
            console.log(error.message)
        }
        console.log('Playlist created')
    } catch (error) {
        console.log(error.message)
    }
}

// Calls Spotify API to get all current users playlist
async function getAllPlaylists() {
    const endpoint = apiURL + 'me/playlists'
    const headers = {             
        "Authorization": `${tokenType} ${accessToken}`
    }
    try {
        const response = await fetch(endpoint, { headers })
        if(!response.ok) {
            throw new Error(`Error:${response.status}`)
        }
        const responseAsJson = await response.json()
        return responseAsJson['items']
    } catch (error) {
        console.log(error.message)
    }
}

// Calls Spotify API retrieve a specific playlist id
async function getPlaylistId(playlistName) {
    const endpoint = apiURL + 'me/playlists'
    const headers = {             
        "Authorization": `${tokenType} ${accessToken}`
    }
    try {
        const response = await fetch(endpoint, { headers })
        if(!response.ok) {
            throw new Error(`Error:${response.status}`)
        }
        const responseAsJson = await response.json()
        const playlist = responseAsJson['items'].filter((playlistObject) => {
            return playlistObject['name'] === playlistName
        })
        return playlist[0]['id']
    } catch (error) {
        console.log(error.message)
    }
}

// Calls Spotify API to add tracks to a playlist
async function addTracksToPlaylist(tracks, playlistId) {
    const endpoint = apiURL + `playlists/${await playlistId}/tracks`
    const headers = {             
        "Authorization": `${tokenType} ${accessToken}`,
        "Content-Type": "application/json"
    }
    const body = JSON.stringify({
        "uris": tracks
    })
    try {
        const response = await fetch(endpoint, {
            method:"POST", 
            headers:headers, 
            body:body
        })
        if (!response.ok) {
            throw new Error(`Error ${response.status}`)
        }
        alert('Songs added successfully!')
    } catch (error) {
        console.log(error.message)
    }
}

// implement authorization tokens
// Redirect to spotify to get authorization code
async function redirectToSpotifyAuthorize() {
    const generateRandomString = (length) => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce((acc, x) => acc + possible[x % possible.length], "");
    }

    const base64encode = (input) => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
          .replace(/=/g, '')
          .replace(/\+/g, '-')
          .replace(/\//g, '_');
    }

    const sha256 = async (plain) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(plain)
        return window.crypto.subtle.digest('SHA-256', data)
    }
    
    const codeVerifier  = generateRandomString(64);
    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64encode(hashed)
    const scope = 'user-read-private user-read-email playlist-modify-public playlist-read-private playlist-modify-private playlist-modify-public playlist-modify-private';
    const authUrl = new URL("https://accounts.spotify.com/authorize")
    window.localStorage.setItem('code_verifier', codeVerifier);

    const params =  {
    response_type: 'code',
    client_id: clientId,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
    }

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
}

// Call spotify token url to get access token
async function getAuthorizedToken(code) {
    try {
        const code_verifier = localStorage.getItem('code_verifier');

        const payload = {
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: code_verifier,
        }),
        }
    
        const body = await fetch(tokenURL, payload);
        const response = await body.json();
        // store token locally
        return response
    } catch (error) {
        console.log(error.message)
    }
}

// refresh spotify token
async function refreshToken(){
    try {
        const refreshToken = localStorage.getItem('refresh_token')
        const url = "https://accounts.spotify.com/api/token";
        const payload = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
              })
        }

        const response = await fetch(url, payload);
        if (!response.ok){
            throw new Error(`Error refreshing token: ${response.status}`)
        }
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error.message)
    }
}

export {
    getTrack, createPlaylist, getAuthorizedToken, 
    redirectToSpotifyAuthorize, currentToken, refreshToken,
    getCurrentUser, currentUser, getAllPlaylists, getPlaylistTracks, modifyUserPlaylist
}