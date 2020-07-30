# team-get

Code Fellows 301d64 project: Team Get
Claudio Bailon-Schubert
Blake Romero
Matthew Herriges
Robert Rizo

### Documentation:

Master and production added 7/24/2020 

To Get Started:
- install all libraries `npm i`
- create .env file with: 
    - PORT=3000
    - DATABASE_URL=postgres://localhost:5432/roadtrip_app
    - apikey=<apikey>
    - account=<Triposo account>
    - token=<Triposo token>
    - WEATHER_API_KEY=<weather api key>
    - MAPQUEST_API_KEY=<mapquest key>
- create database postgreSQL
- setup database amd tables:
  ```sql
  DROP TABLE IF EXISTS map;

  CREATE TABLE map(
    id SERIAL PRIMARY KEY,
    city VARCHAR(255),
    state VARCHAR(255),
    latitude VARCHAR(255),
    longitude VARCHAR(255)
  );
  ```
  ```sql
  DROP TABLE IF EXISTS itinerary;

  CREATE TABLE itinerary(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    rate NUMERIC,
    image VARCHAR(255),
    description TEXT,
    latitude VARCHAR(255),
    longitude VARCHAR(255),
    date DATE,
    time TIME
  );
  ```
- run server

### Images for inspiration game come from:

https://commons.wikimedia.org/

card backgrounds : Hero Patterns at https://www.heropatterns.com/

Pictures from banners is from: https://unsplash.com/

### Trello Board link
[Road Trip](https://trello.com/b/OAP9WRGQ/road-trip)

### Wireframes
![](wireframes/wireframe1.png)
![](wireframes/wireframe2.png)

### User Stories
![](wireframes/userStories.png)

### Database and Dom
![](wireframes/databaseanddom.png)


