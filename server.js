const express = require('express');
const PORT = 3000;
const app = express();
const db = require('./starWarsController');

// graphQL requirements
const { graphqlHTTP } = require('express-graphql');
const { GraphQLObjectType, GraphQLSchema, GraphQLInt, GraphQLString, GraphQLID, GraphQLList } = require('graphql');

const PersonType = new GraphQLObjectType({
  name: 'People', // * db table name
  description: 'This is a list of Starwars Characters',
  fields: () => ({ // * the columns of the table and its data type
    _id: { type: GraphQLInt },
    name: { type: GraphQLString },
    gender: { type: GraphQLString },
    species_id: { type: GraphQLInt },
    birth_year: { type: GraphQLString },
    eye_color: { type: GraphQLString },
    skin_color: { type: GraphQLString },
    hair_color: { type: GraphQLString },
    homeworld_id: { type: GraphQLInt },
    mass: { type: GraphQLString },
    height: { type: GraphQLInt },
  })
});

const SpeciesType = new GraphQLObjectType({
  name: 'Species',
  description: 'This is a list of species',
  fields: () => ({
    _id: { type: GraphQLInt },
    name: { type: GraphQLString },
    classifications: {type: GraphQLString },
    average_height: {type: GraphQLString },
    average_lifespan: {type: GraphQLString },
    hair_colors: {type: GraphQLString },
    skin_colors: {type: GraphQLString },
    eye_colors: {type: GraphQLString },
    language: {type: GraphQLString },
    homeworld_id: { type: GraphQLInt },
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType', // ! no spaces!! spaces in the name will throw an error
  fields: { 
    getAllPeople: { // * what are we getting back? an array of objects so we need to define
      type: new GraphQLList(PersonType),
      resolve () { 
        const charQuery = 'SELECT * FROM people';
        return db.query(charQuery).then((data) => data.rows);
      }
    },
    getPerson: {
      type: PersonType,
      args: { // defining the argument you can pass in for the query all 
        _id: {type: GraphQLInt},
        name: {type: GraphQLString} 
      }, 
      resolve(parent, args) {
        console.log(args);
        const query = `SELECT * FROM people WHERE _id = ${args._id} AND name = ${args.name}`;

        return db.query(query).then((data) => data.rows[0]); 
      }
    }
    // getSpecies: {

    // },   
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutations',
  fields: {// * what mutations we want to offer
    addPerson: {
      type: PersonType,
      args: { // * add the columns we can mutate
        _id: { type: GraphQLInt },
        name: { type: GraphQLString },
        gender: { type: GraphQLString },
        species_id: { type: GraphQLInt },
        birth_year: { type: GraphQLString },
        eye_color: { type: GraphQLString },
        skin_color: { type: GraphQLString },
        hair_color: { type: GraphQLString },
        homeworld_id: { type: GraphQLID },
        mass: { type: GraphQLString },
        height: { type: GraphQLInt },
      },
      resolve(parent, args){
        const query = 'INSERT INTO people(gender, species_id, homeworld_id, height, mass, hair_color, skin_color, eye_color, name, birth_year) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *';
        const values = [args.gender, args.species_id, args.homeworld_id, args.height, args.mass, args.hair_color, args.skin_color, args.eye_color, args.name, args.birth_year];
        try {
          return db.query(query, values).then(res => res.rows[0]); // ! the return is equivalent to res.send 
        } catch (err) {
          throw new Error(err);
        } 
      }
    },
    updatePersonByName: {
      type: PersonType,
      args: {
        _id: { type: GraphQLInt },
        name: { type: GraphQLString },
        gender: { type: GraphQLString },
        species_id: { type: GraphQLInt },
        birth_year: { type: GraphQLInt },
        eye_color: { type: GraphQLString },
        skin_color: { type: GraphQLString },
        hair_color: { type: GraphQLString },
        homeworld_id: { type: GraphQLID },
        mass: { type: GraphQLString },
        height: { type: GraphQLInt },
      },
      resolve(parent, args) {
        let updateQuery = 'Update people SET';
        
        if (args.eye_color) updateQuery += ` eye_color = ${args.eye_color}`;
        if (args.mass) updateQuery += `, mass = ${args.mass}`;

        updateQuery = updateQuery + ` WHERE name = ${args.name} RETURNING *`;
        console.log(updateQuery);
        // const updateQuery = `UPDATE people SET' eye_color = ${args.eye_color} WHERE name = ${args.name} RETURNING *`;
        return db.query(updateQuery).then(res => res.rows[0]);
      }
    },
    deletePerson: {
      type: PersonType,
      args: {
        name: { type: GraphQLString },
      },
      resolve(parent, args) {
        const deleteQuery = `DELETE FROM people WHERE NAME = ${args.name} RETURNING *`;
        return db.query(deleteQuery).then(res => res.rows[0]);
      }
    },
  }
});


const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true
}));

app.listen(PORT, () => console.log(`Listening on PORT: ${PORT} 🧛`));











/* 

! how to make a gQL call from react
fetch('/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({query: {
    nam
  }})
})
  .then(res => res.json())
  .then(data => console.log({ data }));



! how to make gQL call using Apollo Client & React
* useQuery is the React Hook
import { gql, useQuery } from '@apollo/client';

const GET_DOGS = gql`
  query GetDogs {
    dogs {
      id
      breed
    }
  }
`;

function Dogs({ onDogSelected }) {
  const { loading, error, data } = useQuery(GET_DOGS);

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
    <select name="dog" onChange={onDogSelected}>
      {data.dogs.map(dog => (
        <option key={dog.id} value={dog.breed}>
          {dog.breed}
        </option>
      ))}
    </select>
  );
}

*/