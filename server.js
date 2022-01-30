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


// pool.query(`SELECT * FROM country_code LIMIT 2`, (err, res)=> {
//     return console.log(res);
// })

const searchRequest = {
    term: 'Tourist Attractions',
    location: 'London, UK'
};

yelpClient.search(searchRequest).then(response => {
    const firstResult = response.jsonBody.businesses[2];
    const prettyJson = JSON.stringify(firstResult, null, 4);
    console.log(prettyJson);
  }).catch(e => {
    console.log(e);
  });


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

    // var test = 'pt'

    // console.log(arrivalTime);

    // pool.query(`SELECT language FROM lang_code WHERE iso = 'pt'`, (err, results) => {
    //     if (err) {
    //         throw err;
    //     }

    //     console.log(results.rows);
    // });

    // try {
    //     const res = await pool.query("SELECT language from lang_code INNER JOIN (SELECT primary_language from country_code INNER JOIN airport_code ON country_code.country_iso = airport_code.iso_country WHERE airport_code.iata_code = 'DFW') AS alias ON lang_code.iso LIKE alias.primary_language");
    //     console.log(res.rows);
    //   } catch (error) {
    //     console.error(error);
    //   }

    // pool.query(`SELECT language from lang_code INNER JOIN (SELECT primary_language from country_code INNER JOIN airport_code ON country_code.country_iso = airport_code.iso_country WHERE airport_code.iata_code = '$1') AS alias ON lang_code.iso LIKE alias.primary_language`, [airportCode], (results) => {
    //     console.log(results.rows);
    // });

    // console.log(req.body.arrivalTime);
});



app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
});