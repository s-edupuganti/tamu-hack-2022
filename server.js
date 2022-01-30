require('dotenv').config();
const { response } = require('express');
const express = require('express');
const app = express();
const PORT = process.env.PORT|| 4000;
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

app.post('/layover', (req, res) => {
    console.log("Reached post method!");
    var formData = req.body;
    console.log(formData);
    // console.log(formData.arrivalTime);

    arrivalTime = formData.arrivalTime;
    departureTime = formData.departureTime;
    startDate = formData.startDate;
    endDate = formData.endDate;
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


    pgClient.query('SELECT municipality, iso_country FROM airport_code WHERE airport_code.iata_code = $1',[airportCode], (err, res)=>{
        if (!err) {
            // console.log(res.rows[0].municipality);
            mun = res.rows[0].municipality;
            country = res.rows[0].iso_country;

            console.log('Mun: ' + mun);
            console.log('Country: ' + country);

            // finalLocation = '${mun}, ${country}'
            let finalLocation = mun + ',' + country;


            // finalLocation = ("'" + mun + ',' + country + "'");

            console.log(finalLocation);

                const searchRequest = {
                    term: 'Tourist Attractions',
                    // location: mun + ',' + country
                    // location: '\'' + mun + ',' + country + '\''
                    location: finalLocation
                };
            
                // console.log('Location:' + location);
                
                yelpClient.search(searchRequest).then(response => {
            
                    for (let i = 0;  i < 10; i++) {
                        dict[response.jsonBody.businesses[i].name] = [response.jsonBody.businesses[i].price, response.jsonBody.businesses[i].categories[0].title, response.jsonBody.businesses[i].coordinates.longitude, response.jsonBody.businesses[i].coordinates.latitude];

                        console.log('Name: ' + response.jsonBody.businesses[i].name +'; Price: ' + dict[response.jsonBody.businesses[i].name][0] + '; Category: ' + dict[response.jsonBody.businesses[i].name][1] + '; Longitude: ' + dict[response.jsonBody.businesses[i].name][2] + '; Latitude: ' + dict[response.jsonBody.businesses[i].name][3]);
                        // console.log('Hey' + i);
                        // console.log(response.jsonBody.businesses[i].name);
                        // dict.push({
                        //     key: response.jsonBody.businesses[i].name,
                        //     value: ["0", "1", "2"]
                        // });

                        // console.log(di
                    }

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




});



app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
});