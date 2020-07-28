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

app.get('/results', renderResults);

app.get('/game', renderGame);

app.get('/aboutUs', renderAboutUs);

app.get('/music', renderMusic);


function renderHome(request, response) {


  try{

    response.status(200).render('../views/index.ejs');
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



function renderMusic(req, resp){

  let data = [];

  let url = 'https://api.deezer.com/chart';

  superagent.get(url).then(results => {
    data = results.body.albums;

    // console.log('this is the title: ', data.data[0].title);

    // console.log('my params: ', data.data[0].title, data.data[0].position);
    // let title = data.data[0].title;
    // let position = data.data[0].position;
    // let cover_medium = data.data[0].cover_medium;

    // let a = new Album(data.data[0]);

    // console.log('new obj?', a);


    // well, now lets make obj

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

/*##################### Constructors ####################################

####################################################################### */

function Trip(){
//info for the trip object constructor
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

/*############################# Opening Port and Client ##################

########################################################################*/

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
