require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:
const SpotifyWebApi = require(`spotify-web-api-node`)

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

spotifyApi.clientCredentialsGrant()
    .then(data=>{spotifyApi.setAccessToken(data.body[`access_token`])})
    .catch(error=>{console.log(`Something went wrong when retrieving an access token`, error)});

// Our routes go here:

app.get(`/`, (req, res)=>{
    res.render(`home`);
})

app.get(`/artist-search`, (req, res)=>{
    const artist = req.query.artist;

    spotifyApi.searchArtists(artist)
        .then(data=>{
            console.log(`Search tracks by`, artist);
            res.render(`artist-search-results`,  {result:data.body.artists.items})
        })
        .catch(error=>{
            console.error(`Something went wrong`, error);
        })
})

app.get(`/albums/:artistId`, (req, res, next)=>{

    const artistId = req.params.artistId;

    spotifyApi.getArtistAlbums(artistId)
        .then((data)=>{
            console.log(`API RESPONSE:`, data.body.items);
            res.render(`albums`, {albums: data.body.items , artist: data.body.items[0].artists[0].name })
        })
        .catch((error)=>{
            console.error(`Something went wrong`, error)
        })
})

app.get(`/tracks/:albumId`, (req, res, next)=>{
    const albumId = req.params.albumId;

    spotifyApi.getAlbumTracks(albumId, {limit:20, offset: 1})
        .then((trackData)=>{
            spotifyApi.getAlbum(albumId)
                .then((albumData =>{
                    console.log(`API RESPONSE:`, trackData.body.items);
                    res.render(`tracks`, {tracks: trackData.body.items, albumName:albumData.body.name, artist:albumData.body.artists[0].name})
                }))
                .catch((error)=>{
                console.error(`Something went wrong`, error);
        })
        })
        .catch((error)=>{
            console.error(`Something went wrong`, error);
        })
})

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
