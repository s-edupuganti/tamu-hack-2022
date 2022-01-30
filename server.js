require('dotenv').config();
const { response } = require('express');
const express = require('express');
const app = express();
const PORT = process.env.PORT|| 4000;
const yelp = require("yelp-fusion");
const yelpClient = yelp.client(process.env.YELP_API);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : false}));

var arrivalTime;
var departureTime;
var startDate;
var endDate;
var airportCode;

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

    // console.log(arrivalTime);

    // pool.query(`SELECT language from lang_code INNER JOIN (SELECT primary_language from country_code INNER JOIN airport_code ON country_code.country_iso = airport_code.iso_country WHERE airport_code.iata_code = '$1') AS alias ON lang_code.iso LIKE alias.primary_language`, [airportCode], (results) => {
    //     console.log(results.rows);
    // });

    // console.log(req.body.arrivalTime);
});



app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
});