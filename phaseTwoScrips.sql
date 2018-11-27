-- INSERT:
-- insert new album
INSERT INTO album(album_id, album_name, sales, riaa_ranking) VALUES (?,?,?,?) ;
-- insert new artist
INSERT INTO artist(artist_id, artist_name) VALUES (?, ?);
-- insert new tour artist is going to
INSERT INTO going_to(tour_id, artist_id) VALUES (?,?);
-- insert new album that artist has
INSERT INTO has_album(artist_id, album_id) VALUES (?,?);
-- insert new song that artist has
INSERT INTO has_song (artist_id, song_id) VALUES (?,?);
-- insert new song inside an album
INSERT INTO is_in (album_id, song_id) VALUES (?,?);
-- insert new record contract
INSERT INTO record_contract(r_id, artist_id) VALUES (?,?);
INSERT INTO record_label(r_id, r_name) VALUES (?,?);
INSERT INTO song(song_id, song_name, duration, sales, riaa_ranking, features) VALUES (?,?,?,?,?,?);
INSERT INTO tour(tour_id, tour_name, price) VALUES (?,?,?);
INSERT INTO tour_in_location(tour_id, date, location_id) VALUES (?, ?,?);
INSERT INTO tour_location(location_id, city, state, country) VALUES (?,?,?,?);
-- This query if for inserting regular users
INSERT INTO user(user_id, username, email, password) VALUES (?,?,?,?);
-- This query is for inserting artists
INSERT INTO user(user_id, username, email, password, artist_id) VALUES (?,?,?,?,?);

-- DELETE:
DELETE FROM album WHERE album_id = ?;
DELETE FROM going_to WHERE tour_id = ? AND artist_id = ?;
DELETE FROM record_contract WHERE r_id = ? AND artist_id = ?;
DELETE FROM user WHERE user_id = ?;


-- UPDATE
-- update album info
UPDATE album SET album_name = ?, sales = ?, riaa_ranking = ? WHERE album_name = ?;
-- update artist info
UPDATE artist SET artist_name = ? WHERE artist_id = ?;
-- update song info
UPDATE song SET song_name = ?, duration = ?, sales = ?, riaa_ranking = ?, features = ? WHERE song_id = ?;
-- update tour info
UPDATE tour SET tour_name = ?, price = ? WHERE tour_id = ?;
-- update password or username
UPDATE user SET username = ?, password = ?, email = ?



--SELECT:
-- select all artists
SELECT *
FROM artist;
-- select all users
SELECT *
FROM user;
-- select all songs
SELECT *
FROM song;
-- select all albums
SELECT *
FROM album;

-- select all artists and their tours
SELECT *
FROM artist, tour, tour_in_location tl, tour_location, going_to gt
WHERE tour.tour_id = tl.tour_id
AND tour_location.location_id = tl.location_id
AND gt.artist_id = artist.artist_id
AND gt.tour_id = tour.tour_id;

-- select the tours of a specific artist
SELECT *
FROM artist, tour, tour_in_location tl, tour_location, going_to gt
WHERE tour.tour_id = tl.tour_id
AND tour_location.location_id = tl.location_id
AND gt.artist_id = artist.artist_id
AND gt.tour_id = tour.tour_id
AND artist.artist_name = ?;

-- pick albums of a specific artist
SELECT artist_name, album_name, sales, riaa_ranking
FROM album, artist, has_album ha
WHERE artist.artist_name = ?
AND ha.artist_id = artist.artist_id
AND ha.album_id = album.album_id

-- select the artists based on record label
SELECT DISTINCT artist_name
FROM artist a, record_label rl, record_contract rc
WHERE a.artist_id = rc.artist_id AND rl.r_name = ?;

-- select artists based on their album ranking
SELECT DISTINCT artist_name
FROM artist a, album al, has_album ha
WHERE a.artist_id = ha.artist_id AND ha.album_id = al.album_id AND riaa_ranking = ?;

-- select all the songs for an artist
SELECT artist_name, song_name, duration, features
FROM artist a, song s, has_song hs
WHERE a.artist_id = hs.artist_id
AND s.song_id = hs.song_id
AND a.artist_name = ?;

-- select all artists and their albums
SELECT artist_name, album_name, sales, riaa_ranking
FROM album, artist, has_album ha
WHERE ha.artist_id = artist.artist_id
AND ha.album_id = album.album_id

-- select total sales of an artist
SELECT DISTINCT artist_name, SUM(al.sales)
FROM artist a, album al, has_album ha
WHERE a.artist_id = ha.artist_id
AND ha.album_id = al.album_id
GROUP BY artist_name
ORDER BY SUM(al.sales) ASC;

-- select artists who have more than certain amount of total sales
SELECT DISTINCT artist_name
FROM artist a, album al, has_album ha
WHERE a.artist_id = ha.artist_id
AND ha.album_id = al.album_id
GROUP BY artist_name
HAVING SUM(al.sales) > ?
ORDER BY SUM(al.sales) ASC;

-- select albums with more than a certain amount of sales
SELECT *
FROM album
GROUP BY album_name
HAVING SUM(sales) > ?;

-- select tour going on between 2 dates
SELECT artist_name, tour_name, date_of_show, city, state, country
FROM artist, tour, tour_in_location tl, tour_location, going_to gt
WHERE tour.tour_id = tl.tour_id
AND tour_location.location_id = tl.location_id
AND gt.artist_id = artist.artist_id
AND gt.tour_id = tour.tour_id
AND date_of_show between ? AND ?;
GROUP BY artist_name;

-- select tour going on in a certain city
SELECT artist_name, tour_name, date_of_show, city, state, country
FROM artist, tour, tour_in_location tl, tour_location, going_to gt
WHERE tour.tour_id = tl.tour_id
AND tour_location.location_id = tl.location_id
AND gt.artist_id = artist.artist_id
AND gt.tour_id = tour.tour_id
AND tour_city = ?

-- select tour going on in a certain state
SELECT artist_name, tour_name, date_of_show, city, state, country
FROM artist, tour, tour_in_location tl, tour_location, going_to gt
WHERE tour.tour_id = tl.tour_id
AND tour_location.location_id = tl.location_id
AND gt.artist_id = artist.artist_id
AND gt.tour_id = tour.tour_id
AND tour_state = ?

-- select tour going on in a certain country
SELECT artist_name, tour_name, date_of_show, city, state, country
FROM artist, tour, tour_in_location tl, tour_location, going_to gt
WHERE tour.tour_id = tl.tour_id
AND tour_location.location_id = tl.location_id
AND gt.artist_id = artist.artist_id
AND gt.tour_id = tour.tour_id
AND tour_country = ?

-- total sales of a record label

SELECT record_label.r_name, DISTINCT artist_name, SUM(al.sales)
FROM artist a, album al, has_album ha, record_label, record_contract
WHERE a.artist_id = ha.artist_id
AND ha.album_id = al.album_id
AND record_label.r_id = record_contract.r_id
AND record_contract.artist_id = a.artist_id
GROUP BY record_label.r_name
ORDER BY SUM(al.sales) ASC;

-- check for user
SELECT username, password
FROM user
WHERE username = ?

