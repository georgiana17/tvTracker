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

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

// var Db = require('mongodb').Db;
// var Connection = require('mongodb').Connection;
// var Server = require('mongodb').Server;
// var ObjectId = require('mongodb').ObjectId;

// var db = new Db('db', new Server("127.0.0.1", 27017, {safe: true}, {auto_reconnect: true}, {}));
// db.open(function(){
//   console.log("[INFO] MongoDB is opened");

//   db.collection("users", function(error, users) {
//     db.users = users;
//   })
// });


mongoose.connect('mongodb://127.0.0.1/db');

var usersSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

var User = mongoose.model('user', usersSchema);

module.exports = User;

app.get("/", function(req, res) {
  res.sendFile('index.html' , { root : path.join(__dirname, "public")});
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

app.post('logout', function(req,res){
  
});

// var greysUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${process.env.TMDB_KEY}&language=en-US&page=1`;
var greysUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_KEY}&language=en-US&sort_by=vote_count.desc&page=1`;
app.get('/topSeries', function (req, res) {
  fetch(`${greysUrl}`)
      .then(response => response.json())
      .then(movie => res.send(movie))
      .catch(error => res.send(error))
});



//  var user = new User({username:"test", email:"ggg@gmail.com", password:"123456"})

// user.save(function(err){
//   if(err)
//     console.log(err);
//     else 
//     console.log(user);
// });


app.listen(3000);

//    background-image: radial-gradient(circle at 20% 50%, rgba(76.86%, 6.27%, 41.96%, 0.98) 0%, rgba(43.92%, 3.92%, 56.86%, 0.88) 100%);