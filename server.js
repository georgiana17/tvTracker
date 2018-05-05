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

app.use(express.static(path.join(__dirname, "/")));
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
  res.sendFile('index.html' , { root : path.join(__dirname, "/")});
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

app.get('/tvShow/:show_id', function (req, res) {
  oracledb.getConnection(databaseConfig, function(err, connection) {  
      if (err) { 
          return;  
      }  
      connection.execute( "SELECT show_name from TV_SHOW where show_id=LOWER('" + req.params.show_id + "')",  
      [],  
      function(err, result) {  
          if (err) { 
                return;  
          }

          if(result.rows.length != 0) {
              res.send(result.rows);
          } else {
            res.send("false");
          }
      });  
  });  
});

app.post('/addShow/:showId/:noOfSeasons/:userName', function(req, res) {
  // TODO: select count(*) pe episodes per user_id&show_id in tabel EPISODES_USERS => no_of_ep_watched
  var no_of_ep_watched = 0;
  var userId = "";

  var append_to_response = "";
  for(var i = 1 ; i <= req.params.noOfSeasons ; i++) {
    if(i == req.params.noOfSeasons){
      append_to_response = append_to_response + "season/" + i;
    } else {
      append_to_response = append_to_response + "season/" + i + ",";
    }
  }

  var getAllEpisodes = `http://api.themoviedb.org/3/tv/${req.params.showId}?api_key=${process.env.TMDB_KEY}&append_to_response=${append_to_response}`;
    
  
  oracledb.getConnection(databaseConfig, function(err, connection) {
    var sql_userId = `SELECT user_id from users_logged where username=LOWER('` + req.params.userName + `')`;
    connection.execute(sql_userId, [], { autoCommit:true }, function(err, result) {
        if (err) {  
              console.error(err.message + " user_logged");
              return;  
        }
        userId = result.rows;
    });
  });

  var showDetail = `http://api.themoviedb.org/3/tv/${req.params.showId}?api_key=${process.env.TMDB_KEY}`;
  fetch(`${getAllEpisodes}`)
      .then(response => response.json())
      .then(function(response){
          oracledb.getConnection(databaseConfig, function(err, connection) {
            if (err) {
                return;  
            }

            var sql_tv_show = "INSERT INTO TV_SHOW values(:1, :2, :3, :4)";
            var tv_show_binds = [req.params.showId, response.name, response.number_of_episodes, response.number_of_seasons]
            connection.execute(sql_tv_show, tv_show_binds, { autoCommit:true }, function(err, result) {
              console.log("\n");
              console.log("Adaugam serial in BD");
              if (err) {  
                console.error(err.message + " tv_show");
                return;  
              }
              console.log(result);
              res.send(result.rows);
            });
            
            var sql_user_tv_show = `INSERT INTO USERS_TV_SHOWS values(` + userId[0][0] +  `,'` + req.params.userName + `', ` + req.params.showId 
                                    + `,'` + response.name + `',` + parseInt(response.number_of_episodes) + `, ` + (parseInt(response.number_of_episodes) - no_of_ep_watched) + `)`;
            
            connection.execute(sql_user_tv_show, [], { autoCommit:true }, function(err, result) {
              console.log("\n");
              console.log("Adaugam user_id si show_id in BD");
              if (err) {  
                console.error(err.message + " tv_show");
                return;  
              }
              console.log(result);
              res.send(result.rows);
            });

            var sql_seasons = `INSERT INTO SEASONS values(:id, `+ req.params.showId +`, :name, :season_number)`;
            var binds_seasons = response.seasons;
            var seasons_options = {
              autoCommit:true, 
              bindDefs: { 
                id: { type: oracledb.NUMBER },
                name: { type: oracledb.STRING, maxSize: 100 },
                season_number: { type: oracledb.NUMBER }
              }
            }
            connection.executeMany(sql_seasons, binds_seasons, seasons_options, function(err, result) {
              console.log("\nAdaugam sezoane in BD");
                if (err) {  
                      console.error(err.message + " seasons");
                      return;  
                }
                console.log(result);
                res.send(result.rows);
            });
            
            var seasonsArr = [];
            for(var i = 1; i <= response.number_of_seasons; i++) {
              seasonsArr.push(response["season/" + i]);
              console.log(seasonsArr);

              var sql_episodes = `INSERT INTO EPISODES values(:id, `+ response.seasons[i-1].id +`, :name, :season_number)`;
              var binds_episodes = response["season/" + i].episodes;
              var episodes_options = {
                autoCommit:true, 
                bindDefs: { 
                  id: { type: oracledb.NUMBER },
                  name: { type: oracledb.STRING, maxSize: 100 },
                  season_number: { type: oracledb.NUMBER }
                }
              };

                connection.executeMany(sql_episodes, binds_episodes, episodes_options, function(err, result) {
                  console.log("\nAdaugam episoade in BD");
                  if (err) {  
                        console.error(err.message + " episodes");
                        return;  
                  }
                  console.log(result);
                  res.send(result.rows);
              });
            }
        });        
        res.send(response);
      })
      .catch(error => res.send(error))
});

app.get('/users/:userName', function (req, res) {
    oracledb.getConnection(databaseConfig, function(err, connection) {
      if (err) {
          return;  
      }  
      connection.execute("SELECT username from users_logged where username=LOWER('" + req.params.userName + "')",  
      [],  
      function(err, result) {  
          if (err) {  
                console.error(err.message);  
                return;  
          }
          res.send(result.rows);
      });  
  });  
});

app.get('/email/:email', function (req, res) {
    oracledb.getConnection(databaseConfig, function(err, connection) {  
      if (err) {
          return;  
      }  
      connection.execute("SELECT email from users_logged where email=LOWER('" + req.params.email + "')",  
      [],  
      function(err, result) {  
          if (err) {  
                console.error(err.message);  
                return;  
          }
          res.send(result.rows);
      });  
  });
});

app.get('/login/:userName/:password', function (req, res) {
    oracledb.getConnection(databaseConfig, function(err, connection) {  
      if (err) {
          return;  
      }  
      connection.execute("SELECT username, password from users_logged where username=LOWER('" + req.params.userName + "')",  
      [],  
      function(err, result) {
          if (err) { 
                return;  
          }
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





app.listen(3000);

//    background-image: radial-gradient(circle at 20% 50%, rgba(76.86%, 6.27%, 41.96%, 0.98) 0%, rgba(43.92%, 3.92%, 56.86%, 0.88) 100%);