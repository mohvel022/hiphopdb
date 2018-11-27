var bcrypt = require('bcrypt-nodejs');
var express = require('express');
var api = express.Router();
const sqlite3 = require('sqlite3').verbose();
var artistID = 1;

api.use(function (req, res, next) {
    //console.log(req.body);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
    next();
});

 var db = new sqlite3.Database('./db/hiphop.db', sqlite3.OPEN_READWRITE, function (err) {
     if (err) {
         console.log(err);
     }
     else {
         console.log('Connected to the hip hop database');
     }
 });

api.get('/', function (req, res) {
    res.json({
        'Welcome ': 'to our API'
    })
});


// --------------------------- signin functionality------------------------------
api.get('/signin', function (req, res) {

    var username = req.body.username || req.query.username;
    var password = req.body.password || req.query.password;

    //  TODO decrypt the password and store it back in the password variable

    if (err) {
        res.json({
            type: false,
            data: err
        })
    }
    else {
        //      TODO SELECT username and password in db where username equals the username given
        var sql = 'SELECT username, password FROM user WHERE username = ?';

        db.each(sql, username, function (err, row) {
            if (err) {
                console.log(err);
                res.json({
                    type: false,
                    data: err
                })
            }
            else {
                //              TO DO: decrypt password and test it here                
                if (row.password == password) {
                    res.json({
                        type: true,
                        //                     TO DO SEND COOKIE HERE
                        //data:
                    })
                }
            }
        })
    }
})


// --------------------------- signup functionality------------------------------
api.post('/signup', function (req, res) {
    var username = req.body.username || req.query.username;
    var password = req.body.password || req.query.password;
    var email = req.body.email || req.query.email;
    var artist = req.body.artist || req.query.artist;

    if (err) {
        res.json({
            type: false,
            data: err
        })
    }
    else {
        //      TODO SELECT username and password in db where username equals the username given
        var sql = 'SELECT username, password FROM user WHERE username = ?';

        db.each(sql, username, function (err, row) {
            if (err) {
                console.log(err);
                res.json({
                    type: false,
                    data: err
                })
            }
            else {
                //              TO DO: decrypt password and test it here                
                if (row.username == username || row.email == email) {
                    res.json({
                        type: false,
                        data: 'User already exists'
                    })
                }
                else {
                    if (artist == 0) {

                        //                  TO DO hash the password and put it into the database                    
                        var sql = 'INSERT INTO user(username, password, email) VALUES (?, ?, ?)';

                        db.run(sql, [username, password, email], function (err) {
                            if (err) {
                                res.json({
                                    type: false,
                                    data: err
                                })
                            }

                            else {
                                console.log('successful signed up a profile')
                            }
                        })
                    }

                    else{
                         //                  TO DO hash the password and put it into the database                    
                         var sql = 'INSERT INTO user(username, password, email, artist_id) VALUES (?, ?, ?, ?)';

                         db.run(sql, [username, password, email, artistID], function (err) {
                             if (err) {
                                 res.json({
                                     type: false,
                                     data: err
                                 })
                             }
 
                             else {
                                 console.log('successful signed up a profile')
                                 artistID++;
                             }
                         })
                    }
                }
            }
        })
    }
})



api.get('/specific_artist_tours', function (req, res) {
    var artist_name = req.body.artist_name || req.query.artist_name

    var sql = 'SELECT * FROM artist, tour, tour_in_location tl, tour_location, going_to gt WHERE tour.tour_id = tl.tour_id AND tour_location.location_id = tl.location_id AND gt.artist_id = artist.artist_id AND gt.tour_id = tour.tour_id AND artist.artist_name = ?'

    db.all(sql, artist_name, function (err, row) {
        if (err) {
            console.log(err);
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    })
})


api.get('/all_artist_tours', function (req, res) {
    var sql = 'SELECT * FROM artist, tour, tour_in_location tl, tour_location, going_to gt WHERE tour.tour_id = tl.tour_id AND tour_location.location_id = tl.location_id AND gt.artist_id = artist.artist_id AND gt.tour_id = tour.tour_id'
    db.all(sql, artist_name, function (err, row) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    })
})


api.get('/all_record_labels', function(req,res){
    var sql = 'SELECT * FROM record_label'

    db.all(sql, function(err, row){
        if(err){
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    })
})

api.get('/albums', function(req, res){
    var sql = 'SELECT * FROM album'
    
    db.all(sql, function(err, row){
        if(err){
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    })
})



api.get('/artists', function(req, res){
    var sql = 'SELECT * FROM artist'

    db.all(sql, function(err, row){
        if(err){
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    })
})


api.get('/songs', function(req, res){
    var sql = 'SELECT * FROM song'

    db.all(sql, function(err, row){
        if(err){
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    })
})


api.get('/album_of_artist', function(req, res){
    var artist_name = req.body.artist_name || req.query.artist_name
    var sql = 'SELECT artist_name, album_name, sales, riaa_ranking FROM album, artist, has_album ha WHERE artist.artist_name = ? AND ha.artist_id = artist.artist_id AND ha.album_id = album.album_id'

    db.all(sql, artist_name, function (err, row) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    })
})


api.get('/artists_on_record_label', function(req, res){
    var rl_name = req.body.rl_name || req.query.rl_name
    var sql = 'SELECT DISTINCT artist_name FROM artist a, record_label rl, record_contract rc WHERE a.artist_id = rc.artist_id AND rl.r_name = ?;'
    
    db.all(sql, rl_name, function (err, row) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    })
})


api.get('/artists_with_ranking', function(req, res){
    var riaa_ranking = req.body.riaa_ranking || req.query.riaa_ranking
    var sql = 'SELECT DISTINCT artist_name FROM artist a, album al, has_album ha WHERE a.artist_id = ha.artist_id AND ha.album_id = al.album_id AND riaa_ranking = ?'

    db.all(sql, riaa_ranking, function (err, row) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    })
})


api.get('/songs_of_artist', function(req, res){
    var artist_name = req.body.artist_name || req.query.artist_name

    var sql = 'SELECT artist_name, song_name, duration, features FROM artist a, song s, has_song hs WHERE a.artist_id = hs.artist_id AND s.song_id = hs.song_id AND a.artist_name = ?'

    db.all(sql, artist_name, function (err, row) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    });
});

api.get('/all_artists_albums', function(req, res){
    var sql = 'SELECT artist_name, album_name, sales, riaa_ranking FROM album, artist, has_album ha WHERE ha.artist_id = artist.artist_id AND ha.album_id = album.album_id'

    db.all(sql, function (err, row) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    });
})


api.get('/artists_total_sales', function(req, res){
    var sql = 'SELECT DISTINCT artist_name, SUM(al.sales) FROM artist a, album al, has_album ha WHERE a.artist_id = ha.artist_id AND ha.album_id = al.album_id GROUP BY artist_name ORDER BY SUM(al.sales) ASC'

    db.all(sql, function (err, row) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    });
})


api.get('/more_than_sales_artist', function(req, res){
    var sales = req.body.sales || req.query.sales

    var sql = 'SELECT DISTINCT artist_name FROM artist a, album al, has_album ha WHERE a.artist_id = ha.artist_id AND ha.album_id = al.album_id GROUP BY artist_name HAVING SUM(al.sales) > ? ORDER BY SUM(al.sales) ASC;'

    db.all(sql, sales, function (err, row) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    });

})


api.get('/more_than_sales_album', function(req, res){
    var sales = req.body.sales || req.query.sales

    var sql = 'SELECT * FROM album GROUP BY album_name HAVING SUM(sales) > ?'

    db.all(sql, sales, function (err, row) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    });

})


api.get('/tour_between_dates', function(req, res){
    var firstdate = req.body.firstdate || req.query.firstdate
    var seconddate = req.body.seconddate || req.query.seconddate

    var sql = 'SELECT artist_name, tour_name, date_of_show, city, state, country FROM artist, tour, tour_in_location tl, tour_location, going_to gt WHERE tour.tour_id = tl.tour_id AND tour_location.location_id = tl.location_id AND gt.artist_id = artist.artist_id AND gt.tour_id = tour.tour_id AND date_of_show between ? AND ? GROUP BY artist_name'

    db.all(sql, [firstdate, seconddate], function (err, row) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    });
})


api.get('/tour_in_city', function(req, res){
    var city = req.body.city || req.query.city

    var sql = 'SELECT artist_name, tour_name, date_of_show, city, state, country FROM artist, tour, tour_in_location tl, tour_location, going_to gt WHERE tour.tour_id = tl.tour_id AND tour_location.location_id = tl.location_id AND gt.artist_id = artist.artist_id AND gt.tour_id = tour.tour_id AND tour_city = ?'

    db.all(sql, city, function (err, row) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    });
})


api.get('/tour_in_state', function(req, res){
    var state = req.body.state || req.query.state

    var sql = 'SELECT artist_name, tour_name, date_of_show, city, state, country FROM artist, tour, tour_in_location tl, tour_location, going_to gt WHERE tour.tour_id = tl.tour_id AND tour_location.location_id = tl.location_id AND gt.artist_id = artist.artist_id AND gt.tour_id = tour.tour_id AND tour_state = ?'

    db.all(sql, state, function (err, row) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    });
})


api.get('/tour_in_country', function(req, res){
    var country = req.body.country || req.query.country

    var sql = 'SELECT artist_name, tour_name, date_of_show, city, state, country FROM artist, tour, tour_in_location tl, tour_location, going_to gt WHERE tour.tour_id = tl.tour_id AND tour_location.location_id = tl.location_id AND gt.artist_id = artist.artist_id AND gt.tour_id = tour.tour_id AND tour_country = ?'

    db.all(sql, country, function (err, row) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    });
})


api.get('/sales_record_label', function(req, res){
    var sql = 'SELECT record_label.r_name, DISTINCT artist_name, SUM(al.sales) FROM artist a, album al, has_album ha, record_label, record_contract WHERE a.artist_id = ha.artist_id AND ha.album_id = al.album_id AND record_label.r_id = record_contract.r_id AND record_contract.artist_id = a.artist_id GROUP BY record_label.r_name ORDER BY SUM(al.sales) ASC'

    db.all(sql, function (err, row) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {            
                res.json({
                    type: true,
                    data: row
                })
        }
    });
})



module.exports = api;