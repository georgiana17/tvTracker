var express = require('express');
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
var fetch = require('isomorphic-fetch');
var mongoose = require('mongoose');
// var async = require('async');
var  oracledb = require('oracledb');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');


app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Authorization, Accept');
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

var databaseConfig = {  user: process.env.ORACLE_USERNAME,  
  password: process.env.ORACLE_PASSWORD,  
  connectString: "localhost:1521/orcl"  
};

app.post("/user", function(req,res){
  var userDetail = req.body;
  var status = 'inactive';
  var avoid_spoilers = 'false';
  let token = jwt.sign({ username: userDetail.username, email: userDetail.email}, process.env.secret_jwt,{expiresIn: '24h'});
    bcrypt.genSalt(saltRounds, function(err,salt) {
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
            connection.execute("insert into users_logged values(:0,:1,:2,:3,:4,:5,:6)",  
            ['', userDetail.username, userDetail.email, hash, token, status, avoid_spoilers], { autoCommit: true }, 
            function(err, result) {  
                if (err) {  
                      console.error(err.message);  
                      return;  
                }  
                console.log(result.metaData); 
                console.log(result);
                if(result.rowsAffected) {
                  var smtpTransport = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    secureConnection: true,
                    port: 465,
                    secure: true,
                    auth: {
                      user: process.env.GMAIL_USER,
                      pass: process.env.GMAIL_PASSWORD
                    }
                  });

                  var mailOptions = {
                    from : 'episodespy@gmail.com',
                    to: userDetail.email,
                    subject: 'Activation link',
                    text: `<div style="text-align:center;"><img src='https://raw.githubusercontent.com/georgiana17/tvTracker/master/public/images/logo_episode_spy_original_black.png' style="width:403px; height:37px;"/></div> <br/>` +
                          `<h1 style="color: teal">Hello <strong>` + userDetail.username + `, </strong></h1><br/> Thank you for registering at episodeSpy. Please click on the link below to` +
                          ` complete your activation: <br/><br/> <a href="http://localhost:3000/#/activate/` + token +  `">http://localhost:3000/activate</a> <br/><br/>
                          <div style="text-align:center"><p style="font-size:12px;"> This email was automatically sent from <strong style="color:teal">EpisodeSpy</strong>.`+
                          ` Do not reply to this email, use contact page instead. </p></div>`,
                    html: `<div style="text-align:center;"><img src='https://raw.githubusercontent.com/georgiana17/tvTracker/master/public/images/logo_episode_spy_original_black.png' style="width:403px; height:37px;"/></div> <br/>` +
                          `<h1 style="color: teal">Hello <strong>` + userDetail.username + `, </strong></h1><br/> Thank you for registering at episodeSpy. Please click on the link below to` +
                          ` complete your activation: <br/><br/> <a href="http://localhost:3000/#/activate/` + token +  `">http://localhost:3000/activate</a> <br/><br/>
                          <div style="text-align:center"><p style="font-size:12px;"> This email was automatically sent from <strong style="color:teal">EpisodeSpy</strong>.`+
                          ` Do not reply to this email, use contact page instead. </p></div>`
                  }
                  
                  smtpTransport.sendMail(mailOptions, function(error, response){
                      if(error){
                          res.send("Email could not sent due to error: " + error);
                      }else{
                          res.send("Email successfully sent!");
                      } 
                  }); 
                }
            });  
        });  
      })
    });
 
});

app.post("/avoidSpoilers/:value/:userName", function(req,res){
  oracledb.getConnection(databaseConfig, function(err, connection) {
    if(err) {
      return ;
    }
    var avoid_spoilers = `UPDATE users_logged SET avoid_spoilers='` + req.params.value + `' where username =LOWER('` + req.params.userName + `')`;
    connection.execute(avoid_spoilers, [], { autoCommit:true }, function(err,result) {
      if(result.rowsAffected != 0) {
        res.send("Table updated successfully!"); 
      } else 
          res.send("Table was not updated!");
    }); 
  });
});

app.get("/userAvoid/:userName", function(req,res){
  oracledb.getConnection(databaseConfig, function(err, connection) {
    if(err) {
      return ;
    }
    var avoid_spoilers = `SELECT avoid_spoilers from users_logged where username =LOWER('` + req.params.userName + `')`;
    connection.execute(avoid_spoilers, [], { autoCommit:true }, function(err,result) {
      if(result.rows.length != 0) {
        res.send({avoidSpoilers : result.rows[0][0]}); 
      } else {
        res.send("Error received!");
      }
    }); 
  });
});

app.post("/updatePassword/:value/:userName", function(req,res){
    bcrypt.genSalt(saltRounds, function(err,salt) {
      bcrypt.hash(req.params.value, salt, function(err, hash){
        oracledb.getConnection(databaseConfig, function(err, connection) {
          if(err) {
            return ;
          }
          var updatePass = `UPDATE users_logged SET password='` + hash + `' where username = LOWER('` + req.params.userName + `')`;
          connection.execute(updatePass, [], { autoCommit:true }, function(err,result) {
            if(result.rowsAffected != 0) {
              res.send("Password updated successfully!"); 
            } else 
                res.send("Password was not updated!");
          }); 
        });
      });
    });
});

app.post("/rateShow/:vote/:userName/:showId", function(req,res){
  oracledb.getConnection(databaseConfig, function(err, connection) {
    if(err) {
      return ;
    } 
    var update_rating = `UPDATE users_tv_shows SET rating='` + req.params.vote + `' where username = LOWER('` + req.params.userName + `') and show_id=` + req.params.showId;
    connection.execute(update_rating, [], { autoCommit:true }, function(err,result) {
      if(result.rowsAffected != 0) {
        res.send("Table updated successfully!"); 
      } else 
          res.send("Table was not updated!");
    }); 
  });
});

app.get("/ratingShow/:userName/:showId", function(req,res){
  oracledb.getConnection(databaseConfig, function(err, connection) {
    if(err) {
      return ;
    }
    var ratingShow = `SELECT rating from users_tv_shows where username = LOWER('` + req.params.userName + `') and show_id = ` + req.params.showId;
    connection.execute(ratingShow, [], { autoCommit:true }, function(err,result) {
      if(result.rows.length != 0) {
        res.send({showRating : result.rows[0][0]}); 
      } else {
        res.send("Error received!");
      }
    }); 
  });

})


app.post("/resendLink/:userName/:email", function(req, res){
  oracledb.getConnection(databaseConfig, function(err, connection) {
      if (err) { 
          return;  
      }
      let token = jwt.sign({ username: req.params.userName}, process.env.secret_jwt,{expiresIn: '24h'});
      var update_user = `UPDATE users_logged SET token='` + token + `' WHERE username = LOWER('` + req.params.userName + `')`;
      connection.execute(update_user, [], {autoCommit:true},  
      function(err, result) {
          if (err) { 
                return;
          }
          console.log(result);
          if(result.rowsAffected) {
            var smtpTransport = nodemailer.createTransport({
              host: "smtp.gmail.com",
              secureConnection: true,
              port: 465,
              secure: true,
              auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD
              }
            });

            var mailOptions = {
              from : 'episodespy@gmail.com',
              to: req.params.email,
              subject: 'Activation link',
              text: `<div style="text-align:center;"><img src="https://raw.githubusercontent.com/georgiana17/tvTracker/master/public/images/logo_episode_spy_original_black.png" style="width:403px; height:37px;"/></div> <br/>` +
                    `<h1 style="color: teal">Hello <strong>` + req.params.username + `, </strong></h1><br/> Thank you for registering at episodeSpy. Please click on the link below to` +
                    ` complete your activation: <br/><br/> <a href="http://localhost:3000/#/activate/` + token +  `">http://localhost:3000/activate</a> <br/><br/>
                    <div style="text-align:center"><p style="font-size:12px;"> This email was automatically sent from <strong style="color:teal">EpisodeSpy</strong>.`+
                    ` Do not reply to this email, use contact page instead. </p></div>`,
              html: `<div style="text-align:center;"><img src="https://raw.githubusercontent.com/georgiana17/tvTracker/master/public/images/logo_episode_spy_original_black.png" style="width:403px; height:37px;"/></div> <br/>` +
                    `<h1 style="color: teal">Hello <strong>` + req.params.username + `, </strong></h1><br/> Thank you for registering at episodeSpy. Please click on the link below to` +
                    ` complete your activation: <br/><br/> <a href="http://localhost:3000/#/activate/` + token +  `">http://localhost:3000/activate</a> <br/><br/>
                    <div style="text-align:center"><p style="font-size:12px;"> This email was automatically sent from <strong style="color:teal">EpisodeSpy</strong>.`+
                    ` Do not reply to this email, use contact page instead. </p></div>`
            }
            
            smtpTransport.sendMail(mailOptions, function(error, response){
                if(error){
                    res.send("Email could not sent due to error: " + error);
                }else{
                    res.send("Email successfully sent!");
                } 
            }); 
          }
      });
  });
});

app.post("/resendPass/:userName/:email", function(req, res){
      let token = jwt.sign({ username: req.params.userName, email: req.params.email}, process.env.secret_jwt);
      console.log(token);
      var smtpTransport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        secureConnection: true,
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD
        }
      });

      var mailOptions = {
        from : 'episodespy@gmail.com',
        to: req.params.email,
        subject: "Reset your password",
        text: `<div style="text-align:center;"><img src='https://raw.githubusercontent.com/georgiana17/tvTracker/master/public/images/logo_episode_spy_original_black.png' style="width:403px; height:37px;"/></div> <br/>` +
              `<h1 style="color: teal">Hello <strong>` + req.params.userName + `, </strong></h1><br/> Someone has requested a link to change your password. To do that please click on the link below. <br/>` +
              ` <br/> <a href="http://localhost:3000/#/changePassword/` + token +  `">Change your password</a> <br/><br/> If you didn't request this, please ignore this email.` + `<br/> Your password won't change until you access the link above and create a new one.
              <div style="text-align:center"><br/><p style="font-size:12px;"> This email was automatically sent from <strong style="color:teal">EpisodeSpy</strong>.`+
              ` Do not reply to this email, use contact page instead. </p></div>`,
        html: `<div style="text-align:center;"><img src='https://raw.githubusercontent.com/georgiana17/tvTracker/master/public/images/logo_episode_spy_original_black.png' style="width:403px; height:37px;"/></div> <br/>` +
              `<h1 style="color: teal">Hello <strong>` + req.params.userName + `, </strong></h1><br/> Someone has requested a link to change your password. To do that please click on the link below. <br/>` +
              ` <br/> <a href="http://localhost:3000/#/changePassword/` + token +  `">Change your password</a> <br/><br/> If you didn't request this, please ignore this email.` + `<br/> Your password won't change until you access the link above and create a new one.
              <div style="text-align:center"><br/><p style="font-size:12px;"> This email was automatically sent from <strong style="color:teal">EpisodeSpy</strong>.`+
              ` Do not reply to this email, use contact page instead. </p></div>`
      }
      
      smtpTransport.sendMail(mailOptions, function(error, response){
          if(error){
              res.send("Email could not sent due to error: " + error);
          }else{
              res.send("Email successfully sent!");
          } 
      }); 
});

app.get('/users', function (req, res) {
  User.find((err, users) => {
    if(err) 
      return res.status(500).send(err);
      return res.status(200).send(users);
  });
});

app.get('/userByToken/:token', function(req,res){
   jwt.verify(req.params.token, process.env.secret_jwt, function(err, decoded) {
    if(err) {
      res.send({success: false, message: 'Forgot password link has expired!'});
    } else {
      var user = jwt.verify(req.params.token, process.env.secret_jwt);
      res.send({username: user.username})
    }
  });
})


app.get('/activate/:token', function(req,res) {
  oracledb.getConnection(databaseConfig, function(err, connection) {
      if (err) { 
          return;  
      }  
      connection.execute( "SELECT token, username from users_logged where token='" + req.params.token + "'",  
      [],  
      function(err, result) {  
          if (err) { 
                return;
          }

          if(result.rows.length != 0) {
              jwt.verify(result.rows[0][0], process.env.secret_jwt, function(err, decoded) {
                if(err) {
                  res.json({success: false, message: 'Activation link has expired!', user: result.rows[0][1]});
                } else {
                  oracledb.getConnection(databaseConfig, function(err, connection) {
                    if (err) { 
                        return;  
                    }  
                    var updateUser = "UPDATE users_logged SET token='false', status='active' WHERE username = LOWER('" + result.rows[0][1] + "')";
                    connection.execute(updateUser, [],  {autoCommit:true}, function(err, result) {  
                        if (err) { 
                              return;
                        }
                        console.log(result);
                    });  
                  });
                  res.json({success: true, message: 'Account activated!'});
                }
              })
          } else {
            res.json({success: false, message: 'Activation link has expired!'});
          }
      });  
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

// add show to Database
app.post('/addShow/:showId/:noOfSeasons/:userName', function(req, res) {
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

              var sql_tv_show = "INSERT INTO TV_SHOW values(:1, '" + showName + "', :2, :3, :4, :5)";
              var tv_show_binds = [req.params.showId, responses[0].number_of_episodes, req.params.noOfSeasons, responses[0].poster_path, responses[0].overview];

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
                                        + `,'` + showName + `',` + parseInt(responses[0].number_of_episodes) + `, ` + 0 + `, ` + 0 +`)`;
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
                    console.log(sql_seasons);
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
                    var sql_episodes = `INSERT INTO EPISODES values(:id, `+ elem.id +`, :name, :episode_number, :air_date, :overview)`;
                    // console.log(elem.episodes_bind)
                    var binds_episodes = elem.episodes_bind;
                    var episodes_options = {
                      autoCommit:true, 
                      bindDefs: {
                        id: { type: oracledb.NUMBER },
                        name: { type: oracledb.STRING, maxSize: 100 },
                        episode_number: { type: oracledb.NUMBER },
                        air_date: {type: oracledb.STRING, maxSize: 20 },
                        overview: {type: oracledb.STRING, maxSize: 2000}
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

//add show to User
app.post("/addShowToUser/:userName/:showId", function(req,res){
  oracledb.getConnection(databaseConfig, function(err, connection) {
    if (err) {
        return;  
    }
    var addShow = `INSERT INTO USERS_TV_SHOWS 
                   SELECT u.user_id, u.username, s.show_id, s.show_name, s.no_of_episodes, s.no_of_episodes, 0
                   FROM (select username, user_id from users_logged where username = '` + req.params.userName + `') u, 
                        (select show_id, show_name, no_of_episodes from tv_show where show_id=` + req.params.showId + `) s`;
    connection.execute(addShow, [], { autoCommit:true}, function(err,result){
      console.log(err);
      if(err){
        console.error(err.message);
        res.send("TV show failed to be added!");
      } else if(result.rowsAffected != undefined) {
        res.send("TV show added to user succesfully!");
      } else {
        res.send("TV show failed to be added!");
      }
      
    })

  });
});

//delete show from User
app.post("/deleteShowFromUser/:userName/:showId", function(req,res){
  let promise1 = new Promise (async function(resolve, reject) {
    let conn1;
    try{
        conn1 = await oracledb.getConnection(databaseConfig);

        var deleteEpisodesFromShow = `delete from users_episodes
                                      where episode_id in (SELECT a.episode_id
                                      FROM users_tv_shows u, episodes e, seasons s, users_episodes a                      
                                      WHERE u.username = LOWER('` + req.params.userName + `') AND s.season_id = e.season_id AND u.show_id = s.serie_id AND u.show_id = `+ req.params.showId + ` and a.episode_id = e.episode_id )`;
      
        let res = await conn1.execute(deleteEpisodesFromShow, [], { autoCommit:true });
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
  
  promise1.then(function(){
    let promise2 = new Promise(async function(resolve, reject) {
      let conn;
      try{
          conn = await oracledb.getConnection(databaseConfig);
          var deleteShow = `delete from users_tv_shows where show_id = `+ req.params.showId;
          let res = await conn.execute(deleteShow, [], { autoCommit:true });
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
    promise2.then(function(){
      if(promise2.rows != 0 ){
        res.send("TV show deleted successfully!")
      }
    });
  });
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
      connection.execute("SELECT email, username from users_logged where email=LOWER('" + req.params.email + "')",  
      [],  
      function(err, result) {  
          if (err) {  
                console.error(err.message);  
                return;  
          }
          if(result.rows.length != 0 ){
            res.send({username: result.rows[0][1], email: result.rows[0][0]})
          } else {
            res.send("Email not found!");
          }
      });  
  });
});

app.get('/login/:userName/:password', function (req, res) {
    oracledb.getConnection(databaseConfig, function(err, connection) {  
      if (err) {
          return;  
      }  
      connection.execute("SELECT username, password, status, email from users_logged where username=LOWER('" + req.params.userName + "')",  
      [],  
      function(err, result) {
          if (err) { 
                return;  
          }
          if(result.rows.length != 0) {
            console.log(result.rows[0][1]);
            console.log(req.params.password)
            bcrypt.compare(req.params.password, result.rows[0][1], function(err, resp){
              if(result.rows[0][2] == 'active') {
                var status = 'active';
              } else if (result.rows[0][2] == 'inactive') {
                var status = 'inactive';
              }
              console.log(resp)
              var data = {userData: result.rows, passwordMatch: resp, userStatus: status, email: result.rows[0][3]};
              return res.status(200).send(data);
            });
          }
          else {
            res.status(200).send("User not found!");
          }
    });
  });
});

app.get('/myShows/:userName', function(req, res) {
  oracledb.getConnection(databaseConfig, function(err, connection) {
    if(err) {
      return ;
    }
    var sql_myShows = "SELECT show_id, tv_show_name from users_tv_shows where user_id = (select user_id from users_logged where username = LOWER('" + req.params.userName + "'))";
    connection.execute(sql_myShows, [],  function(err, result) {
          if (err) { 
                return;  
          }
          if(result.rows.length != 0) {
            res.send(result.rows);
          }
          else {
            res.send("No shows for this user!");
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
                       SELECT t.show_name, t.show_id, e.episode_name, s.season_number, e.episode_number, e.air_date, t.NO_OF_EPISODES - f.episode_watched AS no_of_ep_unwatched, t.poster_path, t.NO_OF_EPISODES
                       FROM tv_show t, users_tv_shows u, episodes e, seasons s,
                       (SELECT count(count(a.episode_id)) as episode_watched
                       FROM tv_show t, users_tv_shows u, episodes e, seasons s, users_episodes a
                       WHERE a.user_id = (select user_id from users_logged where username = LOWER('`+ req.params.userName + `')) AND s.season_id = e.season_id AND u.show_id = s.serie_id AND t.show_id = u.show_id and a.episode_id = e.episode_id AND u.show_id = ` + req.params.show_id + ` 
                       group by a.episode_id ) f
                       WHERE u.username = LOWER('`+ req.params.userName + `') AND u.show_id = ` + req.params.show_id + ` AND s.season_id = e.season_id AND u.show_id = s.serie_id AND t.show_id = u.show_id AND air_date < to_char(sysdate, 'yyyy-mm-dd')
                       order by air_date desc, episode_number desc )
                       WHERE rownum <=1 
                       UNION ALL 
                       SELECT * FROM (
                       SELECT t.show_name, t.show_id, e.episode_name, s.season_number, e.episode_number, e.air_date, t.NO_OF_EPISODES - f.episode_watched AS no_of_ep_unwatched, t.poster_path, t.NO_OF_EPISODES
                       FROM tv_show t, users_tv_shows u, episodes e, seasons s,
                       (SELECT count(count(a.episode_id)) as episode_watched
                       FROM tv_show t, users_tv_shows u, episodes e, seasons s, users_episodes a
                       WHERE a.user_id = (select user_id from users_logged where username = LOWER('`+ req.params.userName + `')) AND s.season_id = e.season_id AND u.show_id = s.serie_id AND t.show_id = u.show_id and a.episode_id = e.episode_id AND u.show_id = ` + req.params.show_id + ` 
                       group by a.episode_id ) f
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
    connection.execute(add_episode, [], { autoCommit:true }, function(err,result) {
      if(result.rowsAffected != 0) {
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
      if(result.rowsAffected != 0) {
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
          console.log(result.rows[0])
          var shows = [];
          console.log(result.rows.length)
          for(var i=0; i< result.rows.length; i++){
            console.log(result.rows[i][0])
            shows.push({id: result.rows[i][0] });
          }
          res.send(shows);
        } else {
          res.send("No episodes for this user!");
        }
    });
  });
});

//get all episodes of all user's followed shows
app.get("/episodesOfUser/:userName", function(req,res) {
  oracledb.getConnection(databaseConfig, function(err, connection){
    if(err){
      console.log(err.message);
      return;
    }
    var allUserEpisodes =  `SELECT t.show_name, t.show_id, e.episode_name, s.season_number, e.episode_number, e.air_date, u.NO_OF_EPISODES - u.NO_OF_EPISODES_WATCHED AS no_of_ep_unwatched, t.poster_path, e.episode_id, e.overview
                            FROM tv_show t, users_tv_shows u, episodes e, seasons s
                            WHERE u.username = LOWER('` + req.params.userName + `') AND s.season_id = e.season_id AND u.show_id = s.serie_id AND t.show_id = u.show_id 
                                  AND u.show_id in (select show_id from users_tv_shows where  username = LOWER('` + req.params.userName + `'))
                            order by air_date asc`;
    connection.execute(allUserEpisodes, [], function(err,result){
        if(result.rows != undefined) {
          res.send(result.rows);
        } else {
          res.send("No episodes for this user!");
        }
    });
  });
});

//get all watched episodes of a USER
app.get("/watchedEpisodes/:userName", function(req, res) {
  oracledb.getConnection(databaseConfig, function(err, connection){
    if(err){
      console.log(err.message);
      return;
    }
    var watchedEpisodes = `SELECT a.episode_id, b.episode_name
                           FROM  users_episodes a, episodes b
                           WHERE a.episode_id = b.episode_id AND  a.username = LOWER('` + req.params.userName + `')`;
    connection.execute(watchedEpisodes, [], function(err,result){
      if(result.rows != undefined) {
        res.send(result.rows);
      } else {
        res.send("No watched episodes for this user!");
      }
    });
  });
});

//get all database shows 

app.get("/databaseShows", function(req, res) {
  oracledb.getConnection(databaseConfig, function(err, connection){
    if(err){
      console.log(err.message);
      return;
    }
    var shows = `SELECT show_id FROM  tv_show`;
    connection.execute(shows, [], function(err,result){
      if(result.rows != undefined) {
        res.send(result.rows);
      } else {
        res.send("No shows in database!");
      }
    });
  });
});

//get number_of_seasons and number_of_episodes of show from DB
app.get("/showDBInfo/:show_id", function(req, res) {
  oracledb.getConnection(databaseConfig, function(err, connection){
    if(err){
      console.log(err.message);
      return;
    }
    var shows = `SELECT no_of_episodes, no_of_seasons FROM  tv_show WHERE show_id=` + req.params.show_id;
    connection.execute(shows, [], function(err,result){      
      if(result.rows != undefined && result.rows.length != 0) {
        res.send({number_of_episodes: result.rows[0][0], number_of_seasons: result.rows[0][1]});
      } else {
        res.send("No shows in database!");
      }
    });
  });
});


//UPDATE SHOW
app.post('/updateSeasons/:show_id/:noOfSeasons', function(req, res) {
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

  var urls = [];
  for(var k = 0; k < append_to_response.length; k++) {
    urls.push(`http://api.themoviedb.org/3/tv/${req.params.show_id}?api_key=${process.env.TMDB_KEY}&append_to_response=${append_to_response[k]}`);
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
          console.log("promise1")
          let conn1;
          try{
              conn1 = await oracledb.getConnection(databaseConfig);

              var sql_tv_show = `UPDATE TV_SHOW SET no_of_seasons=` + req.params.noOfSeasons + `, no_of_episodes =` + responses[0].number_of_episodes +
                                ` WHERE show_id = ` + req.params.show_id;
              let res = await conn1.execute(sql_tv_show, [], { autoCommit:true });
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
            console.log("promise2")
            let conn;
            try{
                conn = await oracledb.getConnection(databaseConfig);
                var sql_user_tv_show = `UPDATE USERS_TV_SHOWS SET no_of_episodes = ` + responses[0].number_of_episodes + ` WHERE show_id = ` + req.params.show_id;
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
                console.log("promise3 - SEASONS")
                let connection;
                try{
                    connection = await oracledb.getConnection(databaseConfig);
                    var sql_seasons = `INSERT INTO SEASONS SELECT :id, `+ req.params.show_id +`, :name, :season_number FROM dual` +
                                      ` WHERE NOT EXISTS (SELECT 1 FROM SEASONS s WHERE s.season_id = :id)`;
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
                    var sql_episodes = `INSERT INTO EPISODES SELECT :id, `+ elem.id +`, :name, :episode_number, :air_date, :overview FROM dual `+
                                       `WHERE NOT EXISTS (SELECT 1 FROM EPISODES e WHERE e.episode_id = :id)`;
                    var binds_episodes = elem.episodes_bind;
                    var episodes_options = {
                      autoCommit:true, 
                      bindDefs: {
                        id: { type: oracledb.NUMBER },
                        name: { type: oracledb.STRING, maxSize: 100 },
                        episode_number: { type: oracledb.NUMBER },
                        air_date: {type: oracledb.STRING, maxSize: 20 },
                        overview: {type: oracledb.STRING, maxSize: 2000}
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
        res.send("Tv Show UPDATED!");
    })
});


// checkIfShowExists
app.get("/followedShow/:userName/:show_id", function(req,res){
  oracledb.getConnection(databaseConfig, function(err, connection) {
    if(err) {
      return ;
    }
    var followedShow = `SELECT show_id from users_tv_shows where username =LOWER('` + req.params.userName + `') AND show_id=` + req.params.show_id;
    console.log(followedShow)
    connection.execute(followedShow, [], { autoCommit:true }, function(err,result) {
      if(result.rows.length != 0) {
        res.send({followed : true}); 
      } else {
        res.send("No show for this user!");
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
  var showDetail = `http://api.themoviedb.org/3/tv/${req.params.id}?api_key=${process.env.TMDB_KEY}&append_to_response=videos,external_ids`;
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
var tvShow = `http://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_KEY}&language=en-US&include_adult=false&sort_by=vote_count.desc&page=1`;
app.get('/topSeries', function (req, res) {
  fetch(`${tvShow}`)
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

  app.get('/videos/:show_id', function(req,res){
    var videosTvShow = `http://api.themoviedb.org/3/tv/${req.params.show_id}/videos?api_key=${process.env.TMDB_KEY}&language=en-US`;
    fetch(`${videosTvShow}`)
      .then(resp => resp.json())
      .then(videos => res.send(videos)) 
      .catch(err => res.send(error))
  })

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
      .then(genres => res.send({genres: genres, genre_id:req.params.genre_id, genre_name:req.params.genre_name}))
      // .catch(err => res.send(error))
      .catch(function(err){
        console.log(err);
      })
  })

  app.get('/tvChanges/:show_id', function(req,res){
    var weekAgo = new Date(new Date().setDate(new Date().getDate()-7));
    console.log(weekAgo);
    var showChanges = `http://api.themoviedb.org/3/tv/${req.params.show_id}/changes?api_key=${process.env.TMDB_KEY}&language=en-US&start_date=${weekAgo}`;
    fetch(`${showChanges}`)
      .then(resp => resp.json())
      .then(changes => res.send(changes))
      .catch(function(err){
        console.log(err);
      })
  })
  
  app.get('/seasonChanges/:season_id', function(req,res){
    var weekAgo = new Date(new Date().setDate(new Date().getDate()-7));
    console.log(weekAgo);
    var seasonChanges = `http://api.themoviedb.org/3/tv/season/${req.params.season_id}/changes?api_key=${process.env.TMDB_KEY}&language=en-US&start_date=${weekAgo}`;
    fetch(`${seasonChanges}`)
      .then(resp => resp.json())
      .then(changes => res.send(changes))
      .catch(function(err){
        console.log(err);
      })
  })

app.listen(3000);

//    background-image: radial-gradient(circle at 20% 50%, rgba(76.86%, 6.27%, 41.96%, 0.98) 0%, rgba(43.92%, 3.92%, 56.86%, 0.88) 100%);