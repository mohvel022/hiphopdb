var bcrypt = require('bcrypt-nodejs');
var express = require('express');
var api = express.Router();
const sqlite3 = require('sqlite3').verbose();
var artistID = 5;
var albumID;
var tourID;
var songID;

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

    //      TODO SELECT username and password in db where username equals the username given
    var sql = 'SELECT username, password, artist_id FROM user WHERE username = ?';

    db.each(sql, username, function (err, row) {
        if (err) {
            //console.log(err);
            res.json({
                type: false,
                data: err
            })
        }
        else {
            //              TO DO: decrypt password and test it here                
            if (row.password == password) {
                if (row.artist_id == null) {
                    res.json({
                        type: true,
                        //                     TO DO SEND COOKIE HERE
                        artist_id: -1
                    })
                }
                else {
                    var sql2 = 'SELECT artist_name FROM artist WHERE artist_id = ?'
                    db.all(sql2, [row.artist_id], function (err, row2) {
                        if (err) {
                            res.json({ type: false, data: err }
                            )
                        }
                        else {
                            res.json({
                                type: true,
                                artist_id: row.artist_id,
                                artist_name: row2.artist_name
                            })
                        }
                    })
                }

            }
            else {
                res.json({
                    type: false,
                    data: 'password was wrong'
                })
            }

        }
    })
})

api.post('/signup', function(req, res){
    var username = req.body.username || req.query.username;
    var password = req.body.password || req.query.password;
    var email = req.body.email || req.query.email;
    var artist = req.body.artist || req.query.artist;
    var artist_name = req.body.artist_name || req.query.artist_name
    var sql = 'SELECT username, password, email FROM user WHERE username = ?';
    var sql2 = 'INSERT INTO user(username, password, email, artist_id) VALUES (?, ?, ?, ?)';
    var sql3 = 'INSERT INTO artist(artist_id, artist_name) VALUES (?, ?)'
    var sql4 = 'INSERT INTO user(username, password, email) VALUES (?, ?, ?)';
    console.log(username + ' this is username 1')
    console.log(email + ' this is email')
        db.all(sql, [username], function(err, row){
            if(err){
                res.json({
                    type: false,
                    data: err
                })
            }
            console.log('before check')
            console.log(row.email + ' this is email')
            console.log(row.username + ' this is username')
            if(row.email == email){
                console.log('bedfdfre check')
                res.json({
                    type: false,
                    data: 'User already exists!'
                })
            }
            else{
                if(artist == 0){
                    console.log('artist == 0')
                    db.run(sql4, [username, password, email], function(err){
                        if(err){
                            res.json({
                                type: false,
                                data: err
                            })
                        }
                        else{
                            console.log('succesfully created user')
                            res.json({
                                type: true,
                                data: 'successfully inserted'
                            })
                        }

                    })
                }
                else{
                    db.serialize(()=>{
                        db.run(sql2, [username, password, email,artistID], function(err){
                            if(err){
                                res.json({
                                    type: false,
                                    data: err
                                })
                            }
                            else{
                                console.log('succesfully created user')
                            }
                        })
                        db.run(sql3, [artistID, artist_name], function(err){
                             if(err){
                                res.json({
                                    type: false,
                                    data: err
                                })
                            }
                            else{
                                artistID++;
                                console.log('succesfully created artist')
                                res.json({
                                    type: true,
                                    data: 'successfully inserted 3'
                                })
                            }
                        })
                    })
                }
            }
            
        })
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
    })
})


api.get('/all_record_labels', function (req, res) {
    var sql = 'SELECT * FROM record_label'

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
    })
})

api.get('/record_label_by_artist', function (req, res) {
    var artist_name = req.body.artist_name || req.query.artist_name

    var sql = 'SELECT r_name FROM artist, record_label, record_contract WHERE artist_name = ? AND  artist.artist_id = record_contract.artist_id AND record_contract.r_id = record_label.r_id'

    db.all(sql, [artist_name], function (err, row) {
        if (err)
            res.json({ type: false, data: err })
        else { res.json({ type: true, data: row }) }
    })

})


api.get('/albums', function (req, res) {
    var sql = 'SELECT * FROM album'

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
    })
})



api.get('/artists', function (req, res) {
    var sql = 'SELECT * FROM artist'

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
    })
})


api.get('/songs', function (req, res) {
    var sql = 'SELECT * FROM song'

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
    })
})


api.get('/album_of_artist', function (req, res) {
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


api.get('/artists_on_record_label', function (req, res) {
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


api.get('/artists_with_ranking', function (req, res) {
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


api.get('/songs_of_artist', function (req, res) {
    var artist_name = req.body.artist_name || req.query.artist_name

    var sql = 'SELECT * FROM artist a, song s, has_song hs WHERE a.artist_id = hs.artist_id AND s.song_id = hs.song_id AND a.artist_name = ?'

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

api.get('/all_artists_albums', function (req, res) {
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


api.get('/artists_total_sales', function (req, res) {
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


api.get('/more_than_sales_artist', function (req, res) {
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


api.get('/more_than_sales_album', function (req, res) {
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


api.get('/tour_between_dates', function (req, res) {
    var firstdate = req.body.firstdate || req.query.firstdate
    var seconddate = req.body.seconddate || req.query.seconddate

    var sql = 'SELECT artist_name, tour_name, date_of_show, city, state, country FROM artist, tour, tour_in_location tl, tour_location, going_to gt WHERE tour.tour_id = tl.tour_id AND tour_location.location_id = tl.location_id AND gt.artist_id = artist.artist_id AND gt.tour_id = tour.tour_id AND date_of_show between ? AND ?'

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



api.get('/tour_between_dates_by_artist', function (req, res) {
    var firstdate = req.body.firstdate || req.query.firstdate
    var seconddate = req.body.seconddate || req.query.seconddate
    var artist_name = req.body.artist_name || req.query.artist_name

    var sql = 'SELECT artist_name, tour_name, date_of_show, city, state, country FROM artist, tour, tour_in_location tl, tour_location, going_to gt WHERE tour.tour_id = tl.tour_id AND tour_location.location_id = tl.location_id AND gt.artist_id = artist.artist_id AND gt.tour_id = tour.tour_id AND date_of_show between ? AND ? AND artist_name = ? GROUP BY artist_name'

    db.all(sql, [firstdate, seconddate, artist_name], function (err, row) {
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




api.get('/tours', function (req, res) {
    var sql = 'SELECT * FROM tour, tour_in_location tl, tour_location WHERE tour.tour_id = tl.tour_id AND tour_location.location_id = tl.location_id AND  gt.tour_id = tour.tour_id; '

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
    })
})


api.get('/tour_in_city', function (req, res) {
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


api.get('/tour_in_city_by_artist', function (req, res) {
    var city = req.body.city || req.query.city
    var artist_name = req.body.artist_name || req.query.artist_name

    var sql = 'SELECT artist_name, tour_name, date_of_show, city, state, country FROM artist, tour, tour_in_location tl, tour_location, going_to gt WHERE tour.tour_id = tl.tour_id AND tour_location.location_id = tl.location_id AND gt.artist_id = artist.artist_id AND gt.tour_id = tour.tour_id AND tour_city = ? AND artist_name = ?'

    db.all(sql, [city, artist_name], function (err, row) {
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


api.get('/tour_in_state', function (req, res) {
    var state = req.body.state || req.query.state

    var sql = 'SELECT artist_name, tour_name, date_of_show, city, state, country FROM artist, tour, tour_in_location tl, tour_location, going_to gt WHERE tour.tour_id = tl.tour_id AND tour_location.location_id = tl.location_id AND gt.artist_id = artist.artist_id AND gt.tour_id = tour.tour_id AND state = ?'

    db.all(sql, [state], function (err, row) {
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


api.get('/tour_in_state_by_artist', function (req, res) {
    var state = req.body.state || req.query.state
    var artist_name = req.body.artist_name || req.query.artist_name
    var sql = 'SELECT artist_name, tour_name, date_of_show, city, state, country FROM artist, tour, tour_in_location tl, tour_location, going_to gt WHERE tour.tour_id = tl.tour_id AND tour_location.location_id = tl.location_id AND gt.artist_id = artist.artist_id AND gt.tour_id = tour.tour_id AND tour_state = ? AND artist_name = ?'

    db.all(sql, [state, artist_name], function (err, row) {
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





api.get('/tour_in_country_by_artist', function (req, res) {
    var country = req.body.country || req.query.country
    var artist_name = req.body.artist_name || req.query.artist_name
    var sql = 'SELECT artist_name, tour_name, date_of_show, city, state, country FROM artist, tour, tour_in_location tl, tour_location, going_to gt WHERE tour.tour_id = tl.tour_id AND tour_location.location_id = tl.location_id AND gt.artist_id = artist.artist_id AND gt.tour_id = tour.tour_id AND tour_country = ? AND artist_name = ?'

    db.all(sql, [country, artist_name], function (err, row) {
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



api.get('/tour_in_country', function (req, res) {
    var country = req.body.country || req.query.country

    var sql = 'SELECT artist_name, tour_name, date_of_show, city, state, country FROM artist, tour, tour_in_location tl, tour_location, going_to gt WHERE tour.tour_id = tl.tour_id AND tour_location.location_id = tl.location_id AND gt.artist_id = artist.artist_id AND gt.tour_id = tour.tour_id AND tour_country = ?'

    db.all(sql, [country], function (err, row) {
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





api.get('/sales_record_label', function (req, res) {
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

//done
api.post('/updateAlbum', function (req, res) {
    var album_name = req.body.album_name || req.query.album_name
    var album_name_change = req.body.album_name_change || req.query.album_name_change
    var sales = req.body.sales || req.query.sales
    var riaa_ranking = req.body.riaa_ranking || req.query.riaa_ranking
    var artist_id = req.body.artist_id || req.query.artist_id

    var sql = 'UPDATE album SET album_name = ?, sales = ?, riaa_ranking = ? WHERE album_name = ?'

    db.run(sql, [album_name_change, sales, riaa_ranking, album_name], function (err) {
        if (err) {
            res.json({
                type: false,
                data: 'updating album was unsuccessful'
            })
        }
        else {
            res.json({
                type: true,
                data: 'update successful'
            })
        }
    })
})


api.post('/updateArtist', function (req, res) {
    var artist_name = req.body.artist_name || req.query.artist_name
    var artist_id = req.body.artist_id || req.query.artist_id

    var sql = 'UPDATE artist SET artist_name = ? WHERE artist_id = ?'
    db.run(sql, [artist_name, artist_id], function (err) {
        if (err) {
            res.json({
                type: false,
                data: 'updating artist was unsuccessful'
            })
        }
        else {
            res.json({
                type: true,
                data: 'update successful'
            })
        }
    })
})

//DONE
api.post('/updateSong', function (req, res) {
    var song_name = req.body.song_name || req.query.song_name
    var song_name_change = req.body.song_name_change || req.query.song_name_change
    var duration = req.body.duration || req.query.duration
    var sales = req.body.sales || req.query.sales
    var riaa_ranking = req.body.riaa_ranking || req.query.riaa_ranking
    var features = req.body.features || req.query.features
    //var artist_id = req.body.artist_id || req.query.artist_id

    var sql = 'UPDATE song SET song_name = ?, duration = ?, sales = ?, riaa_ranking = ?, features = ? WHERE song_name = ?;'
    db.run(sql, [song_name_change, duration, sales, riaa_ranking, features, song_name], function (err) {
        if (err) {
            res.json({
                type: false,
                data: 'updating artist was unsuccessful'
            })
        }
        else {
            res.json({
                type: true,
                data: 'update successful'
            })
        }
    })
})

//DONE 
api.post('/updateTour', function (req, res) {
    var tour_name = req.body.tour_name || req.query.tour_name
    var price = req.body.price || req.query.price
    var tour_name_change = req.body.tour_name_change || req.query.tour_name_change
    
    var sql = 'UPDATE tour SET tour_name = ?, price = ? WHERE tour_name = ?;'
    db.run(sql, [tour_name_change, price, tour_name], function (err) {
        if (err) {
            res.json({
                type: false,
                data: 'updating artist was unsuccessful'
            })
        }
        else {
            res.json({
                type: true,
                data: 'update successful'
            })
        }
    })
})

//DONE DONE DONE DONE DONE
api.post('/newAlbum', function (req, res) {
    var album_name = req.body.album_name || req.query.album_name
    var sales = req.body.sales || req.query.sales
    var riaa_ranking = req.body.riaa_ranking || req.query.riaa_ranking
    var artist_id = req.body.artist_id || req.query.artist_id
    

    var sql = 'INSERT INTO album(album_name, sales, riaa_ranking) VALUES (?,?,?);'
    var sql2 = 'SELECT album_id FROM album WHERE album_name = ?;'
    var sql3 = 'INSERT INTO has_album(artist_id, album_id) VALUES (?, ?);'
    db.serialize(() => {
        db.run(sql, [album_name, sales, riaa_ranking], function (err) {
            if (err) {
                res.json({
                    type: false,
                    data: 'inserting new album failed in album insert'
                })
            }
        })
        db.get(sql2, [album_name], function (err, row) {
            if (err) {
                res.json({
                    type: false,
                    data: 'inserting new album failed in album id'
                })
            }
            else {
                albumID = row.album_id
                }
        })
        db.run(sql3, [artist_id, albumID], function (err) {
            if (err) {
                res.json({
                    type: false,
                    data: err
                })
            }
            else {
                res.json({
                    type: true,
                    data: 'album has been added and has album also inserted and connected to artist'
                })
            }
        })
    })
})
//DONE DONE DONE DONE
api.post('/newArtist', function (req, res) {
    var artist_name = req.body.artist_name || req.query.artist_name
    var sql = 'INSERT INTO artist(artist_id, artist_name) VALUES (?, ?);'
    db.run(sql, [artistID, artist_name], function (err) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {
            artistID++;
            res.json({
                type: true,
                data: 'Artist has been inserted'
            })
        }
    })
})


api.post('/newSong', function(req, res){
    var song_name = req.body.song_name || req.query.song_name
    var duration = req.body.duration || req.query.duration
    var sales = req.body.sales || req.query.sales
    var riaa_ranking = req.body.riaa_ranking || req.query.riaa_ranking
    var features = req.body.features || req.query.features
    var artist_id = req.body.artist_id || req.query.artist_id
    var album_id = req.body.album_id || req.query.album_id

    console.log(song_name)
    console.log(duration)
    console.log(sales)
    console.log(riaa_ranking)

    var sql = 'INSERT INTO song(song_name, duration, sales, riaa_ranking, features) VALUES (?,?,?,?,?);'
    var sql2 = 'SELECT song_id FROM song WHERE song_name = ?'
    var sql3 = 'INSERT INTO has_song(artist_id, song_id) VALUES (?,?)'
    var sql4 = 'INSERT INTO is_in(album_id, song_id) VALUES (?,?)'

    db.serialize(()=>{
        db.run(sql, [song_name, duration, sales, riaa_ranking, features], function (err) {
            if (err) {
                res.json({
                    type: false,
                    data: err
                })
            }
            else {
                console.log('created new song')
            }
        })
        db.get(sql2, [song_name], function(err, row){
            if(err){
                res.json({type: false, data: err})
            }
            else{
                console.log(row);
                songID = row.song_id;
                //console.log(song)
                db.run(sql3, [artist_id, songID], function(err){
                    if(err){
                        res.json({
                            type: false,
                            data: err
                        })
                    }
                    else{
                        console.log('this is the fnal one')
                        db.run(sql4, [album_id, songID], function(err){
                            if(err){
                                res.json({
                                    type: false,
                                    data: err
                                })
                            }
                            else{
                                res.json({
                                    type: true,
                                    data: 'succesfully updated song'
                                })
                            }
                        })
                    }
                })
            }
        })

    })
})

//DONE DONE DONE DONE DONE
api.post('/newTour', function (req, res) {
    var tour_name = req.body.tour_name || req.query.tour_name
    var price = req.body.price || req.query.price
    var artist_id = req.body.artist_id || req.query.artist_id
    
    var sql = 'INSERT INTO tour(tour_name, price) VALUES (?,?);'
    var sql2 = 'SELECT tour_id FROM tour WHERE tour_name = ?;'
    var sql3 = 'INSERT INTO going_to(tour_id, artist_id) VALUES (?,?);'

    db.serialize(() => {
        db.run(sql, [tour_name, price], function (err) {
            if (err) {
                res.json({
                    type: false,
                    data: err
                })
            }
            else {
            }
        })

        db.get(sql2, [tour_name], function (err, row) {
            if (err) {
                res.json({
                    type: false,
                    data: err
                })
            }
            else {
                
                tourID = row.tour_id
                db.run(sql3, [tourID, artist_id], function (err) {
                    if (err) {
                        res.json({
                            type: false,
                            data: err
                        })
                    }
                    else {
                        res.json({
                            type: true,
                            data: 'tour and going to is inserted'
                        })
                    }
                })
            }
        })
    })
})


api.post('/newRecordLabel', function (req, res) {
    var r_name = req.body.r_name || req.query.r_name

    var sql = 'INSERT INTO record_label(r_name) VALUES (?);'
    db.run(sql, [r_name], function (err) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {
            console.log('record label going to inserted')
            res.json({
                type: true,
                data: 'record label inserted'
            })
        }
    })
})

api.post('/deleteAlbum', function (req, res) {
    var album_id = req.body.album_id || req.query.album_id

    var sql = 'DELETE FROM album WHERE album_id = ?;'

    db.run(sql, [album_id], function (err) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {
            res.json({
                type: true,
                data: 'Album has been deleted'
            })
        }
    })
})


api.post('/deleteArtist', function (req, res) {
    var artist_id = req.body.artist_id || req.query.artist_id

    var sql = 'DELETE FROM artist WHERE artist_id = ?;'

    db.run(sql, [artist_id], function (err) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {
            res.json({
                type: true,
                data: 'artist has been deleted'
            })
        }
    })
})

api.post('/deleteRecordContract', function (req, res) {
    var artist_id = req.body.artist_id || req.query.artist_id
    var r_id = req.body.r_id || req.query.r_id

    var sql = 'DELETE FROM record_contract WHERE r_id = ? AND artist_id = ?;'

    db.run(sql, [r_id, artist_id], function (err) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {
            res.json({
                type: true,
                data: 'Record Contract has been deleted'
            })
        }
    })
})



api.post('/deleteUser', function (req, res) {
    var user_id = req.body.user_id || req.query.user_id

    var sql = 'DELETE FROM user WHERE user_id = ?;'

    db.run(sql, [user_id], function (err) {
        if (err) {
            res.json({
                type: false,
                data: err
            })
        }
        else {
            res.json({
                type: true,
                data: 'User has been deleted'
            })
        }
    })
})


module.exports = api;
