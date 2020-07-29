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

######################################################################*/

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

app.get('/results', renderResults);

app.get('/game', renderGame);

app.get('/aboutUs', renderAboutUs);

app.get('/see-itinerary', checkItinerary);

app.get('/music', renderMusic);
//==============================Call Back Functions=========================

app.post('/search', renderMap);

app.post('/results', renderResults);

app.post('/add', addActivityToDatabase);

app.post('/save', addMapDataToDatabase);




function checkItinerary(request,resp){
  let sql = 'SELECT * FROM itinerary;';
  client.query(sql)
    .then(book => {
      let abook = book.rows;
      resp.render('../views/itinerary.ejs', {faves: abook});
    }).catch(err => {
      resp.status(500).render('../views/home', {error:err});
    })
}

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
  let url = 'https://www.triposo.com/api/20200405/local_highlights.json?';

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
      const obj = activitySearchResults['pois'].map(activityObj => {
        return new Activity(activityObj);
      })
      // console.log('object=================', obj);
      response.status(200).render('searches.ejs', {searchResults: obj});
    })
    .catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Sorry, something went terribly wrong');
    })
}



function renderMusic(req, resp){

  let data = [];

  let url = 'https://api.deezer.com/chart';

  superagent.get(url).then(results => {
    data = results.body.albums;

    let albumArr = data.data;

    console.log('this is from API: ', albumArr);
    const finalAlbum = albumArr.map(albums => {
      return new Album(albums);
    });


    resp.render('../views/music.ejs', {searchResults: finalAlbum})
  });

}





function renderGame(request, response){

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


function addActivityToDatabase(request, response){
  let formData = request.body;
  // console.log('formdata', formData);
  let sql = 'INSERT INTO itinerary (name, rate, image, description, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;';
  let safeValues = [formData.name, formData.rate, formData.image, formData.description, formData.latitude, formData.longitude];

  client.query(sql, safeValues)
    .then(() => {
      // console.log('================================',results);
      response.status(204).send();
    })
  // response.json({success: true});
}




function renderMap(request, response){
  let obj = new Route(request.body);
  let key = process.env.MAPQUEST_API_KEY;
  let url = 'http://www.mapquestapi.com/geocoding/v1/batch';
  url += `?key=${key}&`;
  url += `location=${obj.start}&`;
  if (obj.waypoints.length > 0) {
    obj.waypoints.forEach(value => {
      url += `location=${value}&`;
    })
  }
  url += `location=${obj.end}`;
  
  
  superagent.get(url)
  .then(results => {
    let latLong = results.body.results;
    const latLongArray = latLong.map(value => {
      return new LatLong(value);
    })
    response.render('map.ejs', {destinations : obj, MAPQUEST_API_KEY : key, latLongData : latLongArray});
  })
}

function addMapDataToDatabase(request, response){
  let formData = request.body;
  dropMapTable();
  createMapTable();
  dropItineraryTable();
  createItineraryTable();
  for(let i in formData.city){
    console.log('formdata from mapadd============================',formData);
    let sql = 'INSERT INTO map (city, state, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING id;';
    let safeValues = [formData.city[i], formData.state[i], formData.latitude[i], formData.longitude[i]];
    
    client.query(sql, safeValues)
    // .then(() => {
      //   // response.status(200).send(console.log('Nice!'));
      // })
      
    }
    response.status(204).send();
  }
  
  function dropMapTable(){
    let sql = 'DROP TABLE IF EXISTS map;';
    client.query(sql);
  }

  function createMapTable(){
    let sql = 'CREATE TABLE map(id SERIAL PRIMARY KEY, city VARCHAR(255), state VARCHAR(255), latitude VARCHAR(255), longitude VARCHAR(255));';
    client.query(sql);
  }
  
  function dropItineraryTable(){
    let sql = 'DROP TABLE IF EXISTS itinerary;';
    client.query(sql);
  }
  
  function createItineraryTable(){
    let sql = 'CREATE TABLE itinerary(id SERIAL PRIMARY KEY, name VARCHAR(255), rate NUMERIC, image VARCHAR(255), description TEXT, latitude VARCHAR(255), longitude VARCHAR(255));';
    client.query(sql);
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
  this.link = obj.link;
}

function LatLong(obj) {
  this.latitude = obj.locations[0].latLng.lat;
  this.longitude = obj.locations[0].latLng.lng;
  this.city = obj.locations[0].adminArea5;
  this.state = obj.locations[0].adminArea3;
}

function Activity(obj){
  this.name = obj.name;
  this.longitude = obj.coordinates.longitude;
  this.latitude = obj.coordinates.latitude;
  this.rate = `${obj.score}`.slice(0,3);
  this.image = obj.images[0] ? obj.images[0].sizes.original.url : 'https://placekitten.com/g/200/300';
  this.description = obj.snippet;
}

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
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    });
  })
