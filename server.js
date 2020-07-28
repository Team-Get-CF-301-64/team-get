/* eslint-disable no-unused-vars */
'use strict';

/* ############################ GLOBAL #################################


######################################################################*/


const express = require('express');

const app = express();

const pg  = require('pg');

const superagent = require('superagent');

const methodOverrive = require('method-override');

const { render } = require('ejs');

require('dotenv').config();

require('ejs');

app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3001;
const MAPQUEST_API_KEY = process.env.MAPQUEST_API_KEY;
const client = new pg.Client(process.env.DATABASE_URL);

client.on('client', error => {
  console.log('error', error);
});

/*########################### MIDDLE WARE #############################

#####################################################################*/

app.use(express.static('./newpublic'));

app.use(express.urlencoded({extended:true}));

app.use(methodOverrive('_method'));

/*########################### ROUTES ##################################

-Search in main page
-saved trips appear on main page
-search form takes you back to main page once submitted
-there is an edit page that takes you back home after submit
-there's an "inspiration game" that takes syou back to home and gives you the option to save trips from it or go home and search for yourself

//##################################################################### */

app.get('/', renderHome);

app.get('/results', renderResults);

app.get('/game', renderGame);

app.get('/aboutUs', renderAboutUs);

app.post('/search', renderMap);


function renderHome(request, response) {

  response.render('home.ejs');
  // try{

  //   response.status(200).send('/');
  // } catch(error){
  //   console.log('ERROR', error);
  //   response.status(500).send('Sorry, something went terribly wrong');
  // }
}



function renderResults(request, response) {

  try{
    // let searchCity = request.body.search[0];
    // let searchCategory = request.body.search[1];
    let searchCategory = 'water';
    let searchParams = '';
    let url = 'http://api.opentripmap.com/0.1/en/places/radius';
    // let url = 'http://api.opentripmap.com/0.1/en/places/radius?apikey=5ae2e3f221c38a28845f05b6c6943bdedcf9db68437c8a07ae749e05&radius=6000&lat=47.608013&lon=-122.335167&kinds=museums,water,nature_reserves,monuments_and_memorials';

    // from search form to add parameters
    if(searchCategory === 'museums'){searchParams += ',museums'};
    if(searchCategory === 'water'){searchParams += ',water'};
    if(searchCategory === 'nature'){searchParams += ',nature_reserves'};
    if(searchCategory === 'monuments'){searchParams += ',monuments_and_memorials'};

    let queryParams = {
      apikey: process.env.TRAVEL_API_KEY,
      // lat: request.query.latitude,
      lat: 47.603649,
      // lon: request.query.longitude,
      lon: -122.330193,
      // radius: request.query.radius,
      radius: 1000,
      kinds: searchParams
    }

    superagent.get(url)
    .query(queryParams)
    .then(results => {
      let activitySearchResults = results.body;
      let obj = activitySearchResults.features.map(activityObj => {
        return new Activity(activityObj);
      })
      response.status(200).send('views/searches.ejs', {searchResults: obj});
    })
  } catch(error){
    console.log('ERROR', error);
    response.status(500).send('Sorry, something went terribly wrong');
  }
}

function renderGame(request, response) {

  try{

    response.status(200).send('/renderGame');
  } catch(error){
    console.log('ERROR', error);
    response.status(500).send('Sorry, something went terribly wrong');
  }
}

function renderAboutUs(request, response) {

  try{

    response.status(200).send('/aboutUS');
  } catch(error){
    console.log('ERROR', error);
    response.status(500).send('Sorry, something went terribly wrong');
  }
}

function renderMap(request, response) {
  console.log(request.body);
  // const arr = Object.entries(request.body);
  let arr = new Route(request.body);
  console.log(arr);
  response.render('map.ejs', {destinations : arr});

}
function Trip(){
//info for the trip object constructor
}

function Route (obj) {
  this.waypoints = [];
  for (const [key, value] of Object.entries(obj)) {
    if(key === 'start'){
      this.start = value;
    } else if (key === 'end'){
      this.end = value;
    } else {
      this.waypoints.push(value);
    }
  }
}
// app.get('*', (request, response) => {
//   response.status(500).send('Sorry, something went terribly wrong');
// });

function Activity(obj){
  this.name = obj.properties.name;
  this.longitude = obj.geometry.coordinates[0];
  this.latitude = obj.geometry.coordinates[1];
  this.kinds = obj.properties.kinds;
  this.rate = obj.properties.rate;
}
//==============================Errors=================================

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
