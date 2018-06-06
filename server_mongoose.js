var express = require('express');
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
var fetch = require('isomorphic-fetch');
var mongoose = require('mongoose');



app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

require('dotenv').config({path: 'access_keys.env'})

// var TVDB = require('node-tvdb');
// var tvdb = new TVDB(process.env.TVDB_KEY);

app.use(express.static(path.join(__dirname, "/")));
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1/db');

var usersSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

var User = mongoose.model('user', usersSchema);

module.exports = User;

app.get("/", function(req, res) {
  res.sendFile('index.html' , { root : path.join(__dirname, "/")});
});

var bcrypt = require("bcrypt");
const saltRounds = 10;


app.post("/user", function(req,res){
  var userDetail = req.body;
    bcrypt.genSalt(saltRounds, function(err,salt){
      bcrypt.hash(userDetail.password, salt, function(err, hash){
        var user = new User({id: userDetail.id, username: userDetail.username, email:userDetail.email, password: hash})
        
        user.save(function(err){
          if(err)
            console.log(err);
            else
            console.log("User successfully saved!");
        });
      })
    });
 
});

app.get('/users', function (req, res) {
  User.find((err, users) => {
    if(err) 
      return res.status(500).send(err);
      return res.status(200).send(users);
  });
});

app.get('/users/:userName', function (req, res) {
  User.find({"username": req.params.userName}, (err, users) => {
    if(err) 
      return res.status(500).send(err);
      return res.status(200).send(users);
  });
});

app.get('/email/:email', function (req, res) {
  User.find({"email": req.params.email}, (err, email) => {
    if(err) 
      return res.status(500).send(err);
      return res.status(200).send(email);
  });
});

app.get('/login/:userName/:password', function (req, res) {
  User.find({"username": req.params.userName}, (err, users) => {
    if(err) 
      return res.status(500).send();
    else {
        if(users.length != 0) {
          bcrypt.compare(req.params.password, users[0].password, function(err, resp){
            var data = {userData: users, passwordMatch: resp};
            return res.status(200).send(data);
          });
        }
        else {
          res.status(200).send(users);
        }
      }
  });
});

app.get('/randomImage/:id', function(req, res){
  var imageUrl = `http://api.themoviedb.org/3/tv/${req.params.id}?api_key=${process.env.TMDB_KEY}&language=en-US`;
  fetch(`${imageUrl}`)
      .then(response => response.json())
      .then(image => res.send(image))
      .catch(error => res.send(error))
  
});

app.get('/show/:id', function(req,res){
  var showDetail = `http://api.themoviedb.org/3/tv/${req.params.id}?api_key=${process.env.TMDB_KEY}&append_to_response=videos,external_ids`;
  console.log(showDetail);
  fetch(`${showDetail}`)
      .then(response => response.json())
      .then(info => res.send(info))
      .catch(error => res.send(error))      
});

app.get('/season/:serie_id/:season_id', function(req,res){
  var seasonInfo = `http://api.themoviedb.org/3/tv/${req.params.serie_id}/season/${req.params.season_id}?api_key=${process.env.TMDB_KEY}`;
  fetch(`${seasonInfo}`)
      .then(response => response.json())
      .then(season => res.send(season))
      .catch(error => res.send(error))      
});

// var greysUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${process.env.TMDB_KEY}&language=en-US&page=1`;
var greysUrl = `http://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_KEY}&language=en-US&sort_by=vote_count.desc&page=1`;
app.get('/topSeries', function (req, res) {
  fetch(`${greysUrl}`)
      .then(response => response.json())
      .then(movie => res.send(movie))
      .catch(error => res.send(error))
});

app.get('/allEpisodes/:serie_id/:no_of_seasons', function(req,res) {
  var append_to_response = "";
  for(var i = 1 ; i <= req.params.no_of_seasons ; i++) {
    if(i == req.params.no_of_seasons){
      append_to_response = append_to_response + "season/" + i;
    } else {
      append_to_response = append_to_response + "season/" + i + ",";
    }
  }

  var getAllEpisodes = `http://api.themoviedb.org/3/tv/${req.params.serie_id}?api_key=${process.env.TMDB_KEY}&append_to_response=${append_to_response}`;
  fetch(`${getAllEpisodes}`)
      .then(response => response.json())
      .then(episodes => res.send(episodes))
      .catch(error => res.send(error))      
  });
  
  app.get('/search/:query', function(req, res){
    var searchTvShow = `http://api.themoviedb.org/3/search/tv?api_key=${process.env.TMDB_KEY}&language=en-US&page=1&query=${req.params.query}`;
    fetch(`${searchTvShow}`)
      .then(resp => resp.json())
      .then(search => res.send(search))
      .catch(err => res.send(error))
  });

  app.get('/recommendantions/:show_id/:show_name', function(req, res){
    var recommendantionsTvShow = `http://api.themoviedb.org/3/tv/${req.params.show_id}/recommendations?api_key=${process.env.TMDB_KEY}&language=en-US`;
    fetch(`${recommendantionsTvShow}`)
      .then(resp => resp.json())
      .then(recommendantions => res.send({recommendantions, show_id:req.params.show_id, show_name: req.params.show_name}))
      // .catch(err => res.send(error))
      .catch(function(err){
        console.log(err);
      })
  })

  app.get('/genresAPI/', function(req, res){
    var genresTV = `http://api.themoviedb.org/3/genre/tv/list?api_key=${process.env.TMDB_KEY}&language=en-US`;
    fetch(`${genresTV}`)
      .then(resp => resp.json())
      .then(genres => res.send(genres))
      // .catch(err => res.send(error))
      .catch(function(err){
        console.log(err);
      })
  })

  app.get('/seriesByGenre/:genre_id/:genre_name', function(req,res){
    var serieByGenre = `http://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_KEY}&language=en-US&sort_by=vote_count.desc&include_adult=false&with_genres=${req.params.genre_id}&page=1`;
    fetch(`${serieByGenre}`)
      .then(resp => resp.json())
      .then(genres => res.send(res.send({genres, genre_id:req.params.genre_id, genre_name:req.params.genre_name})))
      // .catch(err => res.send(error))
      .catch(function(err){
        console.log(err);
      })
  })



app.listen(3000);

//    background-image: radial-gradient(circle at 20% 50%, rgba(76.86%, 6.27%, 41.96%, 0.98) 0%, rgba(43.92%, 3.92%, 56.86%, 0.88) 100%);