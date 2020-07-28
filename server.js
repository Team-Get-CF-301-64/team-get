/* eslint-disable no-unused-vars */

'use strict';

/* ############################ GLOBAL #################################


######################################################################*/

const express = require('express');

const app = express();

const pg  = require('pg');

const superagent = require('superagent');

const methodOverrive = require('method-override');

const { render, compile } = require('ejs');

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

app.use(express.static('./public'));

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

app.post('/results', renderResults);

app.get('/game', renderGame);

app.get('/aboutUs', renderAboutUs);

//==============================Call Back Funtions=========================

app.post('/search', renderMap);

app.get('/music', renderMusic);


function renderWeather(request,response){
  let url = `https://api.weatherbit.io/v2.0/forecast/daily`;
  let queryParamaters = {
    key: process.env.WEATHER_API_KEY,
    city: 'seattle',// will probably need to change this line.
    units: 'i',
    days:7
  }
  superagent.get(url)
    .query(queryParamaters)
    .then(dataFromSuperAgent => {
      let forcast = dataFromSuperAgent.body.data;
      const forcastArray = forcast.map(day =>{
        return new Weather(day);
      });
      response.render('../views/home.ejs', {weatherResults: forcastArray});//Where are we sending this?
    }).catch((error) => {
      console.log('ERROR',error);
      response.status(500).send('Sorry, something went terribly wrong')
    });
}



function renderHome(request, response) {


  let url = `https://api.weatherbit.io/v2.0/forecast/daily`;
  let queryParamaters = {
    key: process.env.WEATHER_API_KEY,
    city: 'seattle',// will probably need to change this line.
    units: 'i',
    days:7
  }
  superagent.get(url)
    .query(queryParamaters)
    .then(dataFromSuperAgent => {
      let forcast = dataFromSuperAgent.body.data;
      const forcastArray = forcast.map(day =>{
        return new Weather(day);
      });
      response.render('../views/home.ejs', {weatherResults: forcastArray});//Where are we sending this?
    }).catch((error) => {
      console.log('ERROR',error);
      response.status(500).send('Sorry, something went terribly wrong')
    });
}


function renderResults(request, response){
  // let url = 'https://www.triposo.com/api/20200405/local_highlights.json?account=M2B0UXXF&token=ub5ewilflwgve808gif0aux9l9ov30jn&latitude=47.608013&longitude=-122.335167&tag_labels=do';
  let url = 'https://www.triposo.com/api/20200405/local_highlights.json?';



function renderResults(request, response) {

  try{

  let queryParams = {
    account: process.env.account,
    token: process.env.token,
    latitude: 47.608013,
    longitude: -122.335167,
    tag_labels: 'do'
  }


  superagent.get(url)
  .query(queryParams)
  .then(results => {
    let activitySearchResults = results.body.results[0];
      console.log('activity',activitySearchResults);
      const obj = activitySearchResults['pois'].map(activityObj => {
        // console.log(new Activity(activityObj));
        return new Activity(activityObj);
      })
      console.log('object=================', obj);
      response.status(200).render('searches.ejs', {searchResults: obj});
  })
  .catch((error) => {
    console.log('ERROR', error);
    response.status(500).send('Sorry, something went terribly wrong');
  })
}
// function renderResults(request, response) {

//   // try{
//     // let searchCity = request.body.search[0];
//     // let searchCategory = request.body.search[1];
//     let searchCategory = 'museums,water,nature_reserves,monuments_and_memorials';
//     let searchParams = '';
//     let url = 'http://api.opentripmap.com/0.1/en/places/radius';
//     // let url = 'http://api.opentripmap.com/0.1/en/places/radius?apikey=5ae2e3f221c38a28845f05b6c6943bdedcf9db68437c8a07ae749e05&radius=6000&lat=47.608013&lon=-122.335167&kinds=museums,water,nature_reserves,monuments_and_memorials';

//     // from search form to add parameters
//     if(searchCategory === 'museums'){searchParams += ',museums'};
//     if(searchCategory === 'water'){searchParams += ',water'};
//     if(searchCategory === 'nature'){searchParams += ',nature_reserves'};
//     if(searchCategory === 'monuments'){searchParams += ',monuments_and_memorials'};
//   console.log('test am i in?');
//     let queryParams = {
//       apikey: process.env.apikey,
//       // lat: request.query.latitude,
//       lat: 47.603649,
//       // lon: request.query.longitude,
//       lon: -122.330193,
//       // radius: request.query.radius,
//       radius: 1000,
//       kinds: searchCategory
//     }
//     console.log(queryParams.kinds);
//     superagent.get(url)
//     .query(queryParams)
//     .then(results => {
//       let activitySearchResults = results.body;
//       console.log('activity',activitySearchResults);
//       const obj = activitySearchResults['features'].map(activityObj => {
//         return new Activity(activityObj);
//       })
//       console.log('object=================', obj);
//       response.status(200).render('searches.ejs', {searchResults: obj});
//     })
//    .catch((error) => {
//     console.log('ERROR', error);
//     response.status(500).send('Sorry, something went terribly wrong');
//    })
// }



function renderMusic(req, resp){

  let data = [];

  let url = 'https://api.deezer.com/chart';

  superagent.get(url).then(results => {
    data = results.body.albums;

    let albumArr = data.data;

    const finalAlbum = albumArr.map(albums => {
      return new Album(albums);
    });

    resp.render('../views/music.ejs', {searchResults: finalAlbum})
  });

}





function renderGame(request, response) {

  try{

    response.status(200).render('../views/game.ejs');
  } catch(error){
    console.log('ERROR', error);
    response.status(500).send('Sorry, something went terribly wrong');
  }
}

function renderAboutUs(request, response) {

  try{

    response.status(200).render('../views/aboutus.ejs');
  } catch(error){
    console.log('ERROR', error);
    response.status(500).send('Sorry, something went terribly wrong');
  }
}


//==========================Constructor Funtions==============================


function renderMap(request, response) {
  console.log(request.body);
  // const arr = Object.entries(request.body);
  let arr = new Route(request.body);
  console.log(arr);
  response.render('../views/map.ejs', {destinations : arr});



}

/*##################### Constructors ####################################

####################################################################### */


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

function Album(obj){
  this.title = obj.title;
  this.position = obj.position;
  this.cover_medium = obj.cover_medium;
  this.artist = obj.artist.name;
}

function Pokemon(obj){

  this.name = obj.name;

}


// app.get('*', (request, response) => {
//   response.status(500).send('Sorry, something went terribly wrong');
// });

function Activity(obj){
  this.name = obj.name;
  this.longitude = obj.coordinates.longitude;
  this.latitude = obj.coordinates.latitude;
  this.rate = `${obj.score}`.slice(0,3);
  this.image = obj.images[0] ? obj.images[0].sizes.original.url : 'https://placekitten.com/g/200/300';
  this.description = obj.snippet;
}
// function Activity(obj){
//   this.name = obj.properties.name;
//   this.longitude = obj.geometry.coordinates[0];
//   this.latitude = obj.geometry.coordinates[1];
//   this.kinds = obj.properties.kinds;
//   this.rate = obj.properties.rate;
// }

function Weather(obj){
  this.forecast = obj.weather.description;
  this.icon = obj.weather.icon;
  this.high_temp = Math.round(obj.high_temp);
  this.low_temp = Math.round(obj.low_temp);
  this.precip = (obj.precip).toFixed(2);// This is expected amount of rainfall
  this.time = new Date(obj.valid_date).toDateString();
}

//==============================Errors=================================

/*############################# Opening Port and Client ##################

########################################################################*/

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
