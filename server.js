var express = require('express');
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
var fetch = require('isomorphic-fetch');
var mongoose = require('mongoose');
// var async = require('async');
var  oracledb = require('oracledb');


app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

require('dotenv').config({path: 'access_keys.env'})

app.use(express.static(path.join(__dirname, "/")));
app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.sendFile('index.html' , { root : path.join(__dirname, "/")});
});

var bcrypt = require("bcrypt");
const saltRounds = 10;


// DATABASE CALLS

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
  var userId = "";
  var append_to_response = [];

  var appendString = "";
  if(req.params.noOfSeasons > 20) {
    for(var i = 1 ; i <= req.params.noOfSeasons ; i++) {
      if(i%20 != 0 && req.params.noOfSeasons == i) {
        appendString = appendString + "season/" + i;
        append_to_response.push(appendString);
      } else if (i%20 == 0) {
          appendString = appendString + "season/" + i; 
          append_to_response.push(appendString);
          appendString = "";
      } else if(i%20 != 0) {
        appendString = appendString + "season/" + i + ",";
      }
    }
  } else {
    for(var i = 1 ; i <= req.params.noOfSeasons ; i++) {
      if(i == req.params.noOfSeasons) {
        appendString = appendString + "season/" + i;
      } else {
        appendString = appendString + "season/" + i + ",";
      }
    }
    append_to_response.push(appendString);
  }

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

  var urls = [];
  for(var k = 0; k < append_to_response.length; k++) {
    urls.push(`http://api.themoviedb.org/3/tv/${req.params.showId}?api_key=${process.env.TMDB_KEY}&append_to_response=${append_to_response[k]}`);
  }

  const multipleFetch = url => fetch(url)
     .then(res => res.json())
      .catch(error => res.send(error))

  
  let done = false;
  let episodesInfo = [];
  Promise
      .all(urls.map(multipleFetch))
      .then(function(responses) {
        responses.forEach(function(element, index){
          var noSpecials = -1;
          if(element.seasons[0].name == "Specials") {
            noSpecials = 0;
          }

          var seasonsStr = append_to_response[index].split(",");
          seasonsStr.forEach(function(elem,idx) {
            var seasonId = parseInt(elem.split("/")[1]) + noSpecials;
            episodesInfo.push({id: element.seasons[seasonId].id, episodes_bind: element[elem].episodes});
          })
        });
        
        var showName = responses[0].name;
        if(responses[0].name.indexOf("'") >= 0) {
          
          showName = showName.replace("'","''");
        }

        let promise1 = new Promise (async function(resolve, reject) {
          let conn1;
          try{
              conn1 = await oracledb.getConnection(databaseConfig);

              var sql_tv_show = "INSERT INTO TV_SHOW values(:1, '" + showName + "', :2, :3, :4)";
              var tv_show_binds = [req.params.showId, responses[0].number_of_episodes, req.params.noOfSeasons, responses[0].poster_path];

              let res = await conn1.execute(sql_tv_show, tv_show_binds, { autoCommit:true });
              resolve(res);
          } catch (err){
            console.log("error ocurred", err);
            reject(err);
          } finally {
            if(conn1){
              try{
                await conn1.close();
                console.log("connection close")
              } catch(err) {
                console.log("erro closing conn", err);
              }
            }
          }
        });

        promise1.then(function(res){
          let promise2 = new Promise(async function(resolve, reject) {
            let conn;
            try{
                conn = await oracledb.getConnection(databaseConfig);
                var sql_user_tv_show = `INSERT INTO USERS_TV_SHOWS values(` + userId[0][0] +  `,'` + req.params.userName + `', ` + req.params.showId 
                                        + `,'` + showName + `',` + parseInt(responses[0].number_of_episodes) + `, ` + 0 + `)`;
                let res = await conn.execute(sql_user_tv_show, [], { autoCommit:true });
                resolve(res);
            } catch (err) {
              console.log("error ocurred", err);
              // reject(err);
            } finally {
              if(conn){
                try{
                  await conn.close();
                  console.log("connection close")
                } catch(err) {
                  console.log("erro closing conn", err);
                }
              }
            }
          });

          promise2
          .then(function(res){
            console.log(res + "show_users");
              let promise3 = new Promise(async function(resolve, reject) {
                let connection;
                try{
                    connection = await oracledb.getConnection(databaseConfig);
                    var sql_seasons = `INSERT INTO SEASONS values(:id, `+ req.params.showId +`, :name, :season_number)`;
                    var binds_seasons = responses[0].seasons;
                    var seasons_options = {
                      autoCommit:true, 
                      bindDefs: { 
                        id: { type: oracledb.NUMBER },
                        name: { type: oracledb.STRING, maxSize: 100 },
                        season_number: { type: oracledb.NUMBER }
                      }
                    }
                    
                    let res = await connection.executeMany(sql_seasons, binds_seasons, seasons_options);                    
                    resolve(res);
                  } catch (err) {
                    console.log("error ocurred", err);
                    reject(err);
                  } finally {
                    if(connection){
                      try{
                        await connection.close();
                        console.log("connection close")
                      } catch(err) {
                        console.log("erro closing conn", err);
                      }
                    }
                  }
                }); 
              promise3.then(function(res) {
                console.log(res + "episodes");
                let promises = [];
                  episodesInfo.forEach(function(elem){
                    var sql_episodes = `INSERT INTO EPISODES values(:id, `+ elem.id +`, :name, :episode_number, :air_date)`;
                    console.log(sql_episodes);
                    // console.log(elem.episodes_bind)
                    var binds_episodes = elem.episodes_bind;
                    var episodes_options = {
                      autoCommit:true, 
                      bindDefs: {
                        id: { type: oracledb.NUMBER },
                        name: { type: oracledb.STRING, maxSize: 100 },
                        episode_number: { type: oracledb.NUMBER },
                        air_date: {type: oracledb.STRING, maxSize: 20 }
                      }
                    };
                    let promise = new Promise(async function(resolve, reject) {
                      let conn;                            
                        try{
                          conn = await oracledb.getConnection(databaseConfig);
                            let res = await conn.executeMany(sql_episodes, binds_episodes, episodes_options);
                            resolve(res);
                        } catch (err){
                          console.log("error ocurred", err);
                          reject(err);
                        } finally {
                          if(conn){
                            try{
                              await conn.close();
                              console.log("connection close")
                            } catch(err) {
                              console.log("erro closing conn", err);
                            }
                          }
                        }
                    });
                    promises.push(promise); 
                  })
                Promise.all(promises)
                  .then(function(res) {
                    console.log(res + "episodes")
                  })
              }).catch((err) => console.log(err));
          })
          .catch((err) => console.log(err))
        }).catch((err) => console.log(err));          
               
        res.send("Tv Show added to Database!");
      })

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

app.get('/myShows/:userName', function(req, res) {
  oracledb.getConnection(databaseConfig, function(err, connection) {
    if(err) {
      return ;
    }
    var sql_myShows = "SELECT show_id from users_tv_shows where user_id = (select user_id from users_logged where username = LOWER('" + req.params.userName + "'))";
    connection.execute(sql_myShows, [],  function(err, result) {
          if (err) { 
                return;  
          }
          if(result.rows.length != 0) {
            res.send(result.rows);
          }
          else {
            res.send("No user in database with this name!");
          }
    });
  });
});

// get all episodes from users_tv_show of a specific show_id and username
app.get('/episodes/:userName/:show_id', function(req, res){
  oracledb.getConnection(databaseConfig, function(err, connection){
    if(err) {
      return ;
    }
    var my_episodes = `SELECT t.show_name, e.episode_name, s.season_number, e.episode_number, e.air_date, u.NO_OF_EPISODES - u.NO_OF_EPISODES_WATCHED AS no_of_ep_unwatched
                       FROM tv_show t, users_tv_shows u, episodes e, seasons s
                       WHERE u.username = '`+ req.params.userName + `' AND u.show_id = ` + req.params.show_id + ` AND s.season_id = e.season_id AND u.show_id = s.serie_id AND t.show_id = u.show_id
                       order by air_date asc`;
    connection.execute(my_episodes, [], function(err, result){
      if (err) { 
            return;  
      }
      if(result.rows.length != 0) {
        res.send(result.rows);
      }
      else {
        res.send("No episodes in database for this user!");
      }
      
    })
  })
});

//get last and next episode of a specific show which is followed by a user
app.get('/lastAndNextEpisode/:userName/:show_id', function(req, res){
  oracledb.getConnection(databaseConfig, function(err, connection){
    if(err) {
      return ;
    }
    var my_episodes = `SELECT * FROM (
                       SELECT t.show_name, t.show_id, e.episode_name, s.season_number, e.episode_number, e.air_date, u.NO_OF_EPISODES - u.NO_OF_EPISODES_WATCHED AS no_of_ep_unwatched, t.poster_path
                       FROM tv_show t, users_tv_shows u, episodes e, seasons s
                       WHERE u.username = LOWER('`+ req.params.userName + `') AND u.show_id = ` + req.params.show_id + ` AND s.season_id = e.season_id AND u.show_id = s.serie_id AND t.show_id = u.show_id AND air_date < to_char(sysdate, 'yyyy-mm-dd')
                       order by air_date desc, episode_number desc )
                       WHERE rownum <=1 
                       UNION ALL 
                       SELECT * FROM (
                       SELECT t.show_name, t.show_id, e.episode_name, s.season_number, e.episode_number, e.air_date, u.NO_OF_EPISODES - u.NO_OF_EPISODES_WATCHED AS no_of_ep_unwatched, t.poster_path
                       FROM tv_show t, users_tv_shows u, episodes e, seasons s
                       WHERE u.username = LOWER('`+ req.params.userName + `') AND u.show_id = ` + req.params.show_id + ` AND s.season_id = e.season_id AND u.show_id = s.serie_id AND t.show_id = u.show_id AND air_date >= to_char(sysdate, 'yyyy-mm-dd')
                       order by air_date asc, episode_number asc )
                       WHERE rownum <= 1`;
    connection.execute(my_episodes, [], function(err, result){
      if (err) { 
            return;  
      }
      if(result.rows.length != 0) {
        res.send(result.rows);
      }
      else {
        res.send("No episodes in database for this user!");
      }
      
    });
  });
});

// add episode to user who checked it 
app.post("/addEpisode/:userName/:episodeId", function(req, res){
  oracledb.getConnection(databaseConfig, function(err, connection) {
    if(err) {
      return ;
    }
    var add_episode = `INSERT INTO USERS_EPISODES 
                       SELECT a.user_id, a.username, b.episode_id, b.air_date
                       FROM (select username, user_id from users_logged where username = LOWER('` + req.params.userName + `')) a, 
                            (select air_date, episode_id from episodes where episode_id = `+ req.params.episodeId +`) b
                       WHERE NOT EXISTS (SELECT 1 FROM USERS_EPISODES e where e.episode_id = b.episode_id and a.user_id = e.user_id)`;
    console.log(add_episode);
    connection.execute(add_episode, [], { autoCommit:true }, function(err,result) {
      console.log(result);
      if(result.rowsAffected != undefined) {
        res.send("Episode added to user!"); 
      } else 
          res.send("Cannot link episode to user!");
    }); 
  });
});

// delete episode from user who unchecked it 
app.post("/deleteEpisode/:userName/:episodeId", function(req, res){
  oracledb.getConnection(databaseConfig, function(err, connection) {
    if(err) {
      return ;
    }
    var delete_episode = `DELETE FROM USERS_EPISODES 
                          WHERE username = LOWER('` + req.params.userName + `') and episode_id = `+ req.params.episodeId;
    connection.execute(delete_episode, [], { autoCommit:true }, function(err,result) {
      if(result.rowsAffected != undefined) {
        res.send("Episode deleted from user!"); 
      } else 
          res.send("Cannot delete episode!");
    });
  });
});

//check if episode is on DB
app.get("/checkEpisode/:userName/:episodeId", function(req, res){
  oracledb.getConnection(databaseConfig, function(err, connection){
    if(err){
      return;
    }
    var check_episode = `SELECT * FROM users_episodes WHERE username = LOWER('` + req.params.userName + `') and episode_id = ` + req.params.episodeId;
    connection.execute(check_episode, [], function(err,result){
      if(result.rows != undefined) {
        res.send(true);
      } else {
        res.send(false);
      }
    });
  });
});

//get episodes of a user of a specific show
app.get("/userEpisodes/:userName/:show_id", function(req, res){
  oracledb.getConnection(databaseConfig, function(err, connection){
    if(err){
      return;
    }
    var check_episode = `SELECT e.episode_id 
                         FROM users_episodes e, seasons s, episodes ep, tv_show t
                         WHERE e.episode_id = ep.episode_id AND ep.season_id = s.season_id AND s.serie_id = t.show_id 
                                              AND t.show_id = ` + req.params.show_id + ` 
                                              AND user_id = (SELECT user_id FROM users_logged WHERE username = LOWER('` + req.params.userName + `'))`;
    
      connection.execute(check_episode, [], function(err,result){
      if(result.rows != undefined) {
        res.send(result.rows);
      } else {
        res.send("No episodes for this user!");
      }
    });
  });
});

// API CALLS 

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

  app.get('/search/:query', function(req, res){
    var searchTvShow = `https://api.themoviedb.org/3/search/tv?api_key=${process.env.TMDB_KEY}&language=en-US&page=1&query=${req.params.query}`;
    fetch(`${searchTvShow}`)
      .then(resp => resp.json())
      .then(search => res.send(search))
      .catch(err => res.send(error))
  });


app.listen(3000);

//    background-image: radial-gradient(circle at 20% 50%, rgba(76.86%, 6.27%, 41.96%, 0.98) 0%, rgba(43.92%, 3.92%, 56.86%, 0.88) 100%);