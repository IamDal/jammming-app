
const clientId = process.env.REACT_APP_CLIENT_ID;
const tokenURL = "https://accounts.spotify.com/api/token";
const apiURL = "https://api.spotify.com/v1/";
const redirectUri = 'http://localhost:3000';
const tokenType="Bearer"
const accessToken = localStorage.getItem('access_token');

const currentToken = {
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

/*
async function getValidToken() {

    const accessToken = localStorage.getItem('access_token');
    const tokenExpiresIn = localStorage.getItem('tokenExpiresIn');
    if (!accessToken || Date.now() >= tokenExpiresIn) {
        console.log('Token expired or not available, requesting a new one...');
        await getAuthorizedToken(); 
    } else {
        console.log('Using cached token.');
    }
}
*/

async function getTrack(searchTerm) {
    const query = `search?q=${encodeURIComponent(searchTerm)}`
    const typeAndLimit = "&type=track&limit=30"
    const urlToFetch = apiURL+query+typeAndLimit
    const headers = { "Authorization":`${tokenType} ${accessToken}` }

    try {
        const response = await fetch(urlToFetch, { headers });

        if (!response.ok) {
            throw new Error(`Response Status: ${response.status}`)
        }

        const responseAsJson = await response.json()
        const trackData = await responseAsJson['tracks']['items']

        const tracks = trackData.map(items => {
            const albumCover = items['album']['images'].slice(-1)[0]
            return {
                artist: items['artists'].map(artist => artist.name).join(', '),
                song: items['name'],
                album: items['album']['name'],
                uri: items['uri'],
                cover: albumCover['url']
            }
        })
        return tracks
    } catch (error) {
        console.log(error.message)
    }
}


async function createPlaylist(nameOfPlaylist, tracks) {
    try {
        const userId =  "31j7onrgr45a5sso427rl7ddzwoy"//await getCurrentUser()
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


        alert('Playlist created')
    } catch (error) {
        console.log(error.message)
    }
}

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
        console.log('Songs added successfully!')
    } catch (error) {
        console.log(error.message)
    }
}

// implement authorization tokens
async function redirectToSpotifyAuthorize() {
    const generateRandomString = (length) => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce((acc, x) => acc + possible[x % possible.length], "");
    }

    const sha256 = async (plain) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(plain)
        return window.crypto.subtle.digest('SHA-256', data)
    }
    
    const base64encode = (input) => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
          .replace(/=/g, '')
          .replace(/\+/g, '-')
          .replace(/\//g, '_');
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

export {getTrack, createPlaylist, getAuthorizedToken, redirectToSpotifyAuthorize, currentToken}