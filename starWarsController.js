const { Pool } = require ('pg');
const PG_URI = 'postgres://kfrwnvzh:do8vx7a7dtZI6cS9i2Tit0N9Irmjr8GH@suleiman.db.elephantsql.com:5432/kfrwnvzh';

const pool = new Pool({
  connectionString: PG_URI
});

const starWarsController = {};

starWarsController.getPeople = (req, res, next) => {
  const charQuery =
    `SELECT t.films, 
      pp.hair_color, pp.name, pp.mass, pp.skin_color, pp.eye_color, pp.birth_year, pp.gender, pp.height,
      s.name AS species, s._id AS species_id,
      pl.name AS homeworld, pl._id AS homeworld_id
    FROM (
      SELECT p._id, ARRAY_AGG(jsonb_build_object('id', f._id, 'title', f.title)) films 
      FROM people p 
      LEFT OUTER JOIN people_in_films pf ON  p._id = pf.person_id 
      LEFT OUTER JOIN films f ON f._id = pf.film_id 
      GROUP BY p._id
    ) t 
    LEFT OUTER JOIN people pp ON pp._id = t._id
    LEFT OUTER JOIN species s ON s._id = pp.species_id
    LEFT OUTER JOIN planets pl ON pl._id = pp.homeworld_id 
    ORDER BY t._id
    `;

  pool.query(charQuery).then((data) => {
    console.log('characters receieved: ', data.rows[0]);
    return res.status(200).send('receieved 🧛');
  });
};

starWarsController.getPerson = (req, res, next) => {
  const query = 'SELECT * FROM people WHERE _id = 13';

  pool.query(query).then((data) => {
    console.log('Chewbacca received: ', data.rows[0]);
    return res.status(200).send('received!');
  }); 
};

starWarsController.getDraQLa = (req, res, next) => {
  const query = 'SELECT * FROM people WHERE name = \'DraQla\'';
};

starWarsController.getSpecies = (req, res, next) => {
  const speciesQuery = `SELECT s.name, s.classification, s.average_height, s.average_lifespan, s.language, p.name AS homeworld 
    FROM species s LEFT OUTER JOIN planets p ON s.homeworld_id = p._id 
    WHERE s._id = 10`;

  pool.query(speciesQuery).then((data) => {
    console.log('species receieved', data.rows[0]);
    return res.status(200).send('receieved 🧛');
  });
};

starWarsController.addPerson = (req, res, next) => {
  const addQuery = `
    INSERT INTO people (name, gender, species_id, birth_year, eye_color, skin_color, hair_color, homeworld_id, mass, height)
    VALUES ('DraQLa', 'male', 1, 19BBY, 'black', 'pale', 'black', 1, 77, 172)
    RETURNING *
  `;

  pool.query(addQuery).then(data => {
    console.log('he OR she got added', data.rows[0]);
    return res.status(200).send('added 🧛');
  });
};

starWarsController.deletePerson = (req, res, next) => {
  const deleteQuery = 'DELETE FROM people WHERE NAME = \'DraQLa\' RETURNING *';
  pool.query(deleteQuery).then(data => {
    console.log('he got deleted 🧄', data.rows[0]);
    return res.status(200).send('Deleted');
  });
};

starWarsController.updatePerson = (req, res, next) => {
  const updateQuery = 'UPDATE people SET eye_color = \'hazel\' WHERE name = \'DraQLa\' RETURNING *';
  pool.query(updateQuery).then(data => {
    console.log('he was updated 🧄', data.rows[0]);
    return res.status(200).send('Updated');
  });
};


module.exports = {
  query: (text,params, callback) => {
    console.log('executed query:', text);
    return pool.query(text, params, callback);
  }
};