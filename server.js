require('dotenv').config();
const { response } = require('express');
const express = require('express');
const app = express();
const PORT = process.env.PORT|| 5000;
const yelp = require("yelp-fusion");
const yelpClient = yelp.client(process.env.YELP_API);

const {Client} = require('pg');
const { client } = require('yelp-fusion');
// const { database } = require('pg/lib/defaults');
// const { password } = require('pg/lib/defaults');

// const pgClient = new Client({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     port: 5432,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     ssl: true

// });

// let ssl = null;
// if (process.env.NODE_ENV === 'development') {
//    ssl = {rejectUnauthorized: false};
// }

const pgClient = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized: false,
    }
});

// pgClient.connect();

// pgClient.query(`SELECT * FROM country_code LIMIT 2`, (err, res)=>{
//     if (!err) {
//         console.log(res.rows);
//     } else {
//         console.log(err.message);
//     }
//     pgClient.end;
// });
// const { pool } = require("./dbManager");

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : false}));

var arrivalTime;
var departureTime;
var startDate;
var endDate;
var airportCode;
var mun;
var country;
var dict = {};

var origins = [];
var destinations = [];


var distance = require('google-distance-matrix');

var coords;

var timeArr = [];

var placesArr = [];






// let finalLocation;


// pool.query(`SELECT * FROM country_code LIMIT 2`, (err, res)=> {
//     return console.log(res);
// })

// const searchRequest = {
//     term: 'Tourist Attractions',
//     location: 'London, UK'
// };

// yelpClient.search(searchRequest).then(response => {
//     const firstResult = response.jsonBody.businesses[2];
//     const prettyJson = JSON.stringify(firstResult, null, 4);
//     console.log(prettyJson);
//   }).catch(e => {
//     console.log(e);
//   });


app.get('/', (req, res)=> {
    res.sendFile(path.join(__dirname, '/index.html'));

});

app.get('/layover', (req, res) => {
    res.render('layover');

});


function stripNum(str) {

    for (let i = 0; i < str.length; i++) {
        if (str[i] == ' ') {
            return parseInt(str.substring(0, i));
        }
    }

    return parseInt(str);

};

app.post('/layover', (req, res) => {
    // res.redirect("itenerary");
    console.log("Reached post method!");
    var formData = req.body;
    console.log(formData);
    // console.log(formData.arrivalTime);

    layoverTime = parseFloat(formData.layoverTime) * 60;
    // departureTime = formData.departureTime;
    // startDate = formData.startDate;
    // endDate = formData.endDate;
    airportCode = formData.airportCode;

    pgClient.connect();

    pgClient.query('SELECT language from lang_code INNER JOIN (SELECT primary_language from country_code INNER JOIN airport_code ON country_code.country_iso = airport_code.iso_country WHERE airport_code.iata_code = $1) AS alias ON lang_code.iso LIKE alias.primary_language', [airportCode], (err, res)=>{
        if (!err) {
            console.log(res.rows);
        } else {
            console.log(err.message);
        }
        pgClient.end;
    });

    // pgClient.query('SELECT coordinates FROM airport_code WHERE iata_code = $1', [airportCode],(err, res)=> {
    //     if (!err) {
    //         // console.log(res.rows[0]);
    //         coords = res.rows[0].coordinates;
    //         console.log(coords);
    //     } else {
    //         comsole.log(err.message);
    //     }
    // });

    // pgClient.connect();

    // pgClient.query('SELECT coordinates FROM airport_code WHERE iata_code = $1', [airportCode], (err, res)=> {
    //     if (!err) {
    //         coords = res.rows[0].coordinates;
    //     } else {
    //         console.log(err.message);
    //     }
    //     pgClient.end;
    // });


    pgClient.query('SELECT municipality, iso_country, coordinates FROM airport_code WHERE airport_code.iata_code = $1',[airportCode], (err, res)=>{
        if (!err) {
            // console.log(res.rows[0].municipality);
            mun = res.rows[0].municipality;
            country = res.rows[0].iso_country;
            coords = res.rows[0].coordinates;

            console.log('Mun: ' + mun);
            console.log('Country: ' + country);
            console.log('AIRPORT COORDS: ' + coords);

            // finalLocation = '${mun}, ${country}'
            let finalLocation = mun + ',' + country;


            // finalLocation = ("'" + mun + ',' + country + "'");

            console.log(finalLocation);

                const searchRequest = {
                    term: 'Tourist Attractions',
                    location: finalLocation
                };
        
                yelpClient.search(searchRequest).then(response => {
            
                    for (let i = 0;  i < 10; i++) {
                        dict[response.jsonBody.businesses[i].name] = [response.jsonBody.businesses[i].price, response.jsonBody.businesses[i].categories[0].title, response.jsonBody.businesses[i].coordinates.latitude, response.jsonBody.businesses[i].coordinates.longitude];

                        console.log('Name: ' + response.jsonBody.businesses[i].name +'; Price: ' + dict[response.jsonBody.businesses[i].name][0] + '; Category: ' + dict[response.jsonBody.businesses[i].name][1] +  '; Latitude: ' + dict[response.jsonBody.businesses[i].name][2] + '; Longitude: ' + dict[response.jsonBody.businesses[i].name][3]);
        
                        let longLat = dict[response.jsonBody.businesses[i].name][2] + ',' + dict[response.jsonBody.businesses[i].name][3];
                  ;
                        origins.push(longLat);
                        destinations.push(longLat);

                    }

                    // origins.push(coords);
                    // destinations.push(coords);

                    // console.log('LAST SPOT: ' + origins[10]);
                    // console.log('2ND 2 LAST: ' + origins[9]);

                    // origins.push(coords);
                    // destinations.push(coords);



                    // origins.push(coords);
                    // destinations.push(coords);

                


                
                // var origins = ['San Francisco CA', '40.7421,-73.9914'];
                // var destinations = ['New York NY', 'Montreal', '41.8337329,-87.7321554', 'Honolulu'];
                
                    distance.key('AIzaSyAXBp0wmyn_TFrUME7lQPlfX8dW19qqLBs');
                    distance.units('imperial'); 
                    // distance.traffic_model('best_guess');   
                    // distance.arrival_time(1559541600);
                    // distance.departure_time(0000000000);


                    console.log('TEST 1');
                                            

                    distance.matrix(origins, destinations, function (err, distances) {
                        if (err) {
                            return console.log(err);
                        }
                        if(!distances) {
                            return console.log('no distances');
                        }
                        if (distances.status == 'OK') {

                            // var {est = distances.body;
                            console.log(distances.body);
                            console.log('STOP!');
                            for (var i=0; i < origins.length; i++) {
                                var currArr = [];
                                for (var j = 0; j < destinations.length; j++) {
                                    var origin = distances.origin_addresses[i];
                                    var destination = distances.destination_addresses[j];
                                    // var times = distances.departureTime[j];
                                    if (distances.rows[0].elements[j].status == 'OK') {
                                        var distance = distances.rows[i].elements[j].distance.text;
                                        // console.log('DISTANCE: ' + distances.rows[i].elements[j].duration.text);
                                        var time = stripNum(distances.rows[i].elements[j].duration.text);
                                        // stripNum(time);
                                        currArr.push(time);
                                        placesArr.push(destinations);

                                        // var time = distance.rows
                                        // var time = distances.rows[i].elements[j].duration_in_traffic.text;
                                        // console.log('Distance from ' + origin + ' to ' + destination + ' is ' + distance + ' and takes ' + time);
                                    } else {
                                        console.log(destination + ' is not reachable by land from ' + origin);
                                    }
                                }
                                timeArr.push(currArr);

                            }

                            console.log('TIME MATRIX: ' + timeArr);
                            console.log((timeArr[0])[0]);

                            console.log("here");
                            var allowedTime = layoverTime;
                            var allTrips = [];
                            var allDollars = [];
                            var allFun = [];
                            
                            for (var i = 0; i < 10; i = i+2){
                                //amount of money spent on itinerary
                                var tripDollars = "";
                                var tripFun = 0;
                                var tripTime = 0;
                                var trip = [];
                                if (i + 1 < 10){
                                
                                     tripTime = (timeArr[i])[i+1] + 60;
                                    if (tripTime < allowedTime){
                                        console.log((timeArr[0])[0]);
                                        //tripDollars
                                        //trip fun
                                        trip.push(i);
                                        trip.push(i+1);
                                        for (var j = i + 1; j < 10; j++){
                                             tripTime = tripTime + (timeArr[j])[j+1] + 60;
                                            if (tripTime < allowedTime){
                                                trip.push(j + 1);
                                            }
                                            else{
                                                allTrips.push(trip);
                                            }
                                        }
                                    }
                                    else{
                                        allTrips.push(trip);
                                    }
                                    
                                }
                                else{
                                    allTrips.push(trip);
                                    //alldollars
                                    //allfun
                                }
                                
                                
                            }
                            // console.log(allTrips);

                            for (var i = 0; i < allTrips.length; i++) {
                                if (allTrips[i] == allTrips[i + 1]) {
                                    continue;
                                } else {
                                    // console.log(placesArr[allTrips[i]]);
                                    console.log(allTrips[i]);

                                }

                            }

                        
                        }
                    });
                    //time user has in layover
   
                    // console.log(dict)
            
                    // const firstResult = response.jsonBody.businesses[2].name;
                    // const prettyJson = JSON.stringify(firstResult, null, 4);
                    // console.log(prettyJson);
                }).catch(e => {
                    console.log(e);
                });


            // municpality = res.rows[0].municipality

        } else {
            console.log(err.message);
        }
        pgClient.end;
    });


    // res.render("itenerary")





});

// app.get("/itenerary", function(req, res) {
//     res.render('itenerary');
// });






app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
});