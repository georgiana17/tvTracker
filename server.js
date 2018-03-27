var express = require('express');
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
var fetch = require('isomorphic-fetch');

require('dotenv').config({path: 'access_keys.env'})

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.sendFile('index.html' , { root : path.join(__dirname, "public")});
});

// var greysUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${process.env.TMDB_KEY}&language=en-US&page=1`;
var greysUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_KEY}&language=en-US&sort_by=vote_count.desc&page=1`;
app.get('/topSeries', function (req, res) {
  fetch(`${greysUrl}`)
      .then(response => response.json())
      .then(movie => res.send(movie))
      .catch(error => res.send(error))
});

app.listen(3000);

//    background-image: radial-gradient(circle at 20% 50%, rgba(76.86%, 6.27%, 41.96%, 0.98) 0%, rgba(43.92%, 3.92%, 56.86%, 0.88) 100%);