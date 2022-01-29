require('dotenv').config();
const { response } = require('express');
const express = require('express');
const app = express();



const PORT = process.env.PORT|| 3000;
const yelp = require("yelp-fusion");
// const yelpKey = process.env.YELP_API;
const yelpClient = yelp.client(process.env.YELP_API);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : false}));



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



app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
});