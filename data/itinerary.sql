DROP TABLE IF EXISTS itinerary;

CREATE TABLE itinerary(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  rate NUMERIC,
  image VARCHAR(255),
  description TEXT,
  latitude VARCHAR(255),
  longitude VARCHAR(255)
);