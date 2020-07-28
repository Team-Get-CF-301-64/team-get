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

const client = new pg.Client(process.env.DATABASE_URL);

client.on('client', error => {
  console.log('error', error);
});

/*########################### MIDDLE WARE #############################

#####################################################################*/

app.use(express.static('./public2'));

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

app.get('/weather', renderWeather)

//==============================Call Back Funtions=========================

function renderHome(request, response) {

  try{

    response.status(200).render('index');
  } catch(error){
    console.log('ERROR', error);
    response.status(500).send('Sorry, something went terribly wrong');
  }
}

function renderResults(request, response) {

  try{

    response.status(200).send('/results');
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
      response.render('index2', {weatherResults: forcastArray});//Where are we sending this?
    }).catch((error) => {
      console.log('ERROR',error);
      response.status(500).send('Sorry, something went terribly wrong')
    });
}

//==========================Constructor Funtions==============================

function Trip(){
//info for the trip object constructor
}

// app.get('*', (request, response) => {
//   response.status(500).send('Sorry, something went terribly wrong');
// });

function Weather(obj){
  this.forecast = obj.weather.description;
  this.icon = obj.weather.icon;
  this.high_temp = Math.round(obj.high_temp);
  this.low_temp = Math.round(obj.low_temp);
  this.precip = (obj.precip).toFixed(2);// This is expected amount of rainfall
  this.time = new Date(obj.valid_date).toDateString();
}

//==============================Errors=================================

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
