const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertSnakeCaseToCamelCaseForAPI1and7 = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

const convertSnakeCaseToCamelCaseForAPI3 = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertSnakeCaseToCamelCaseForAPI6 = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

//API 1
app.get('/movies/', async (request, response) => {
  const getMovieQuery = `
     SELECT 
     movie_name
     FROM 
     movie
     
  `
  const moviesArray = await db.all(getMovieQuery)
  console.log(moviesArray)
  response.send(
    moviesArray.map(eachMovie =>
      convertSnakeCaseToCamelCaseForAPI1and7(eachMovie),
    ),
  )
})

//API 2
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES
    ('${directorId}', 
     '${movieName}', 
     '${leadActor}')
  `
  await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//API 3
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
   SELECT 
    *
   FROM 
   movie
   WHERE
    movie_id = '${movieId}';

  `
  const movieDetail = await db.get(getMovieQuery)

  response.send(convertSnakeCaseToCamelCaseForAPI3(movieDetail))
})

//API 4
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuery = `
   UPDATE
   movie
   SET
   director_id = '${directorId}',
   movie_name = '${movieName}',
   lead_actor = '${leadActor}'
  `
  await db.get(updateMovieQuery)

  response.send('Movie Details Updated')
})

//API 5
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
   DELETE
   FROM 
   movie
   WHERE
    movie_id = '${movieId}';

  `
  await db.run(deleteMovieQuery)

  response.send('Movie Removed')
})

//API 6
app.get('/directors/', async (request, response) => {
  const getMovieQuery = `
     SELECT 
     *
     FROM 
     director
     ORDER BY 
     director_id   
  `
  const directorsArray = await db.all(getMovieQuery)
  response.send(
    directorsArray.map(eachMovie =>
      convertSnakeCaseToCamelCaseForAPI6(eachMovie),
    ),
  )
})

//API 7
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMovieQuery = `
     SELECT 
     movie_name
     FROM 
     movie
     WHERE director_id = '${directorId}'
     ORDER BY 
     movie_id;   
  `
  const moviesArray = await db.all(getMovieQuery)
  response.send(
    moviesArray.map(eachMovie =>
      convertSnakeCaseToCamelCaseForAPI1and7(eachMovie),
    ),
  )
})

module.exports = app
