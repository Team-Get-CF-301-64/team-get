DROP TABLE IF EXISTS map;

  CREATE TABLE map(
    id SERIAL PRIMARY KEY,
    city VARCHAR(255),
    state VARCHAR(255),
    latitude VARCHAR(255),
    longitude VARCHAR(255)
  );