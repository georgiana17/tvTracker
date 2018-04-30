var express = require('express');
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
var fetch = require('isomorphic-fetch');
var mongoose = require('mongoose');

var oracledb = require('oracledb');


app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

require('dotenv').config({path: 'access_keys.env'})

// var TVDB = require('node-tvdb');
// var tvdb = new TVDB(process.env.TVDB_KEY);

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

// mongoose.connect('mongodb://127.0.0.1/db');

// var usersSchema = new mongoose.Schema({
//   username: String,
//   email: String,
//   password: String
// });

// var User = mongoose.model('user', usersSchema);

// module.exports = User;

app.get("/", function(req, res) {
  res.sendFile('index.html' , { root : path.join(__dirname, "public")});
});

var bcrypt = require("bcrypt");
const saltRounds = 10;


app.post("/user", function(req,res){
  var userDetail = req.body;
    bcrypt.genSalt(saltRounds, function(err,salt){
      bcrypt.hash(userDetail.password, salt, function(err, hash){
        oracledb.getConnection({  
            user: process.env.ORACLE_USERNAME,  
            password: process.env.ORACLE_PASSWORD,  
            connectString: "localhost:1521/orcl"  
        }, function(err, connection) {  
            if (err) {  
                console.error(err.message);  
                return;  
            }  
            connection.execute("insert into users_logged values(:0,:1,:2,:3)",  
            ['', userDetail.username, userDetail.email, hash], { autoCommit: true }, 
            function(err, result) {  
                if (err) {  
                      console.error(err.message);  
                      return;  
                }  
                console.log(result.metaData); 
                console.log(result);
            });  
        });  
      })
    });
 
});

var databaseConfig = {  user: process.env.ORACLE_USERNAME,  
                password: process.env.ORACLE_PASSWORD,  
                connectString: "localhost:1521/orcl"  
          };

app.get('/users', function (req, res) {
  User.find((err, users) => {
    if(err) 
      return res.status(500).send(err);
      return res.status(200).send(users);
  });
});

app.get('/usersFROMSQL', function (req, res) {
    oracledb.getConnection(databaseConfig, function(err, connection) {  
      if (err) {  
          console.error(err.message);  
          return;  
      }  
      connection.execute( "SELECT * from users_logged",  
      [],  
      function(err, result) {  
          if (err) {  
                console.error(err.message);  
                return;  
          }  
          console.log(result.metaData); 
          console.log(result.rows);
      });  
  });  
});

app.get('/users/:userName', function (req, res) {
    oracledb.getConnection(databaseConfig, function(err, connection) {  
      if (err) {  
          console.error(err.message);  
          return;  
      }  
      connection.execute("SELECT username from users_logged where username=LOWER('" + req.params.userName + "')",  
      [],  
      function(err, result) {  
          if (err) {  
                console.error(err.message);  
                return;  
          }  
          console.log(result.metaData); 
          console.log(result.rows);
          res.send(result.rows);
      });  
  });  
});

app.get('/email/:email', function (req, res) {
    oracledb.getConnection(databaseConfig, function(err, connection) {  
      if (err) {  
          console.error(err.message);  
          return;  
      }  
      connection.execute("SELECT email from users_logged where email=LOWER('" + req.params.email + "')",  
      [],  
      function(err, result) {  
          if (err) {  
                console.error(err.message);  
                return;  
          }  
          console.log(result.metaData); 
          console.log(result.rows);
          res.send(result.rows);
      });  
  });
});

app.get('/login/:userName/:password', function (req, res) {
    oracledb.getConnection(databaseConfig, function(err, connection) {  
      if (err) {  
          console.error(err.message);  
          return;  
      }  
      connection.execute("SELECT username, password from users_logged where username=LOWER('" + req.params.userName + "')",  
      [],  
      function(err, result) {
          if (err) {  
                console.error(err.message);  
                return;  
          }  
          console.log(result.metaData); 
          console.log(result.rows);
          if(result.rows.length != 0) {
            bcrypt.compare(req.params.password, result.rows[0][1], function(err, resp){
              var data = {userData: result.rows, passwordMatch: resp};
              return res.status(200).send(data);
            });
          }
          else {
            res.status(200).send(users);
          }
    });
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
  var showDetail = `http://api.themoviedb.org/3/tv/${req.params.id}?api_key=${process.env.TMDB_KEY}`;
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


app.listen(3000);

//    background-image: radial-gradient(circle at 20% 50%, rgba(76.86%, 6.27%, 41.96%, 0.98) 0%, rgba(43.92%, 3.92%, 56.86%, 0.88) 100%);