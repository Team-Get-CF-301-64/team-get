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

function renderMap(request, response) {
  console.log(request.body);
  // const arr = Object.entries(request.body);
  let arr = new Route(request.body);
  console.log(arr);
  let key = process.env.MAPQUEST_API_KEY;
  console.log('key', key);
  response.render('map.ejs', {destinations : arr, MAPQUEST_API_KEY : key});
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

//==============================Errors=================================

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
