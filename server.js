const sqlite3       = require('sqlite3').verbose();
var express         = require('express');
var app             = express();
var type            = require('type-is');
var morgan          = require('morgan');
var cookieParser    = require('cookie-parser');
var session         = require('cookie-session');
//var passport        = require('passport');
var port            = 3000;
var bodyParser      = require('body-parser');
var bcrypt          = require('bcrypt-nodejs');

var api = require('./app/api.js');

app.set('trust proxy', 1);


app.use(bodyParser.json({type: 'application/json'}));
app.use(bodyParser.urlencoded({extended: true}));


app.use(morgan('dev'));

 app.use(function(err, req, res, next){
     res.status(err.status || 500);
     res.send(err.message);
 });




app.use('/api', api);

app.listen(port, function(err){
    if(err){
        console.log(err);
    }
    else{
        console.log('The port has connected ' + port);
    }
});






// db.close(function(err){
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log('Database connection has been closed');
//     }
// })