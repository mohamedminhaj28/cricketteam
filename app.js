const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();


const convertMoviesObjectToResponseObject = (dbObject) => {
    return {
 
        movieName : dbObject.movie_name,
        

    };
};

app.get("/movies/", async(request, response) => {
    const getAllMoviesQuery = `
    SELECT 
    movies_name
    FROM
    movie;`;
    const moviesArray = await db.all(getAllMoviesQuery);
    response.send(
        moviesArray.map((eachMovie) => convertMoviesObjectToResponseObject
        (eachMovie))
        
    );
});
app.post("/movies/", async(request, response) =>{
    const movieDetails = request.body;
    const { directorId, movieName, leadActor } = movieDetails;
    const postMovieQuery = `
    INSERT INTO 
    movie (director_id,movie_name,lead_actor)
    VALUES
     (
     ${directorId},
    '${movieName}',
    '${leadActor}');`;
    const dbResponse = await db.run(postMovieQuery);
    //console.log(dpResponse);
    response.send("Movie Successfully Added");
});
const convertDbObjectToResponseObject = (dbObject) => {
    return {
        moviesId : dbObject.movies_id,
        directorId : dbObject.director_id,
        movieName : dbObject.movie_name,
        leadActor : dbObject.lead_actor,
    };
};
app.get ("/movies/:moviesId/", async(request, response) =>{
    const { movieId } = request.params;
    const getMovieQuery = `
    SELECT
    *
    FROM
    movie
    WHERE
    movie_id = ${movieId};`;
    const movie = await db.get(getMovieQuery);
    console.log(movieId);
    response.send(convertDbObjectToResponseObject(movie));
});
app.put("/movies/:moviesId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
    UPDATE
    movie
    SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movieId};`;
    await db.run(updateMovieQuery);
    response.send("Movie Details Updated");

});
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM 
  movie
  WHERE
  movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
  

});
const convertDirectorObjectToResponseObject = (dbObject) => {
    return {
        directorId : dbObject.director_id,
        directorName : dbObject.director_name,

    };
};
app.get("/directors/", async(request, response)=>{
    const getAllDirectorQuery = `
    SELECT 
    *
    FROM
    director;`;
    const movieArray = await db.all(getAllDirectorQuery);
    response.send(
        movieArray.map((director) =>
        convertDirectorObjectToResponseObject(director))

        
        
    );
});

const convertDbObjectToResponseObject= (dbObject) => {
    return {
 
        movieName : dbObject.movie_name,
        

    };
};


app.get("/directors/:directorId/movies/", async (request, response) =>{
    const { directorId } = request.params;
    const getDirectorMovieQuery = `
    SELECT 
    movie_name
    FROM
    director INNER JOIN movie
    ON director.director_id = movie.director_id
    WHERE
    director.director_id = ${directorId};`;
    const movies = await db.all(getDirectorMovieQuery);
    response.send(
        movies.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
});
module.exports = app;
