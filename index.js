'use strict';

const omdbApiKey = '310a9b9d';
const omdbSearchUrl = 'https://www.omdbapi.com/';
const youTubeApiKey = 'AIzaSyB3PboYRtBgCv8f7nRIdGrcENwunztc3nE'; //AIzaSyC6nCJGAQxIhNC12yb_h8Z74Qf3eZRsMn0
const youTubeSearchUrl = 'https://www.googleapis.com/youtube/v3/search';

/* 
    Functions for omdb API 
*/

// Movie ratings
function displayRatings(responseJson) {
    let imdbMovieRating = responseJson.Ratings[0].Value;
    let rtMovieRating = responseJson.Ratings[1].Value;
    let metaMovieRating = responseJson.Ratings[2].Value;

    $('#movie-ratings').html(`
    <section class="ratings">    
        <p><b>IMDB Rating: </b>${imdbMovieRating}</p>
        <p><b>Rotten Tomatoes: </b>${rtMovieRating}</p>
        <p><b>Metacritic: </b>${metaMovieRating}</p>
    </section>
    `
    );
}

// Movie Description 
function displayDescription(responseJson) {
    let moviePlot = responseJson.Plot;
    let movieYear = responseJson.Year;
    let movieGenre = responseJson.Genre;
    let movieActors = responseJson.Actors;
    let movieDirector = responseJson.Director;
    let movieAwards = responseJson.Awards;

    $('#movie-list').append(`
    <section class="mv-description">    
        <p><b>Director: </b>${movieDirector}</p>    
        <p><b>Year: </b>${movieYear}</p>
        <p><b>Genre(s): </b>${movieGenre}</p>
        <p><b>Actors: </b>${movieActors}</p>
    </section>
    `
    );
}

// Movie Title & Image
function displayTitleAndImage(responseJson) {
    let movieTitle = responseJson.Title;
    let imdbImage = responseJson.Poster;

    $('#movie-title-and-img').append(`
    <p class="mv-title">${movieTitle}</p>
    <img src="${imdbImage}" alt="Movie Image" class="movie-image">
    `
    );
}

// Checks for errors & Calls on
// movie display functions 
function displayMovieResults(responseJson) {
    if (responseJson.Error) {
        $('#movie-results').addClass("hidden");
        $('.column3').addClass("hidden");
        $('#js-error-message').empty();
        $('#js-error-message').removeClass("hidden");
        $('#js-error-message').html(`  
            <p>Sorry, ratings are unavailable for this movie.</p>
            <br>
            <p>Please try another movie!</p>
            `);
    }
    else {
        $('#movie-results').removeClass('hidden');
        console.log(responseJson);
        $('#movie-title-and-img').empty();
        $('#movie-list').empty();
        displayRatings(responseJson);
        displayTitleAndImage(responseJson);
        displayDescription(responseJson);
    }
}

// Formats omdb search query 
function formatOmdbQuery(omdbParams) {
    const queryItems = Object.keys(omdbParams)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(omdbParams[key])}`)
    return queryItems.join('&');
}

// Fetch for omdb API 
function findMovies(searchedMovie) {
    const omdbParams = {
        apiKey: omdbApiKey,
        t: searchedMovie
    };

    const omdbQuerySearch = formatOmdbQuery(omdbParams);
    const omdbUrl = omdbSearchUrl + "?" + omdbQuerySearch;

    const options = {
        headers: new Headers({
            Referer: omdbSearchUrl,
        })
    };

    fetch(omdbUrl, options)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayMovieResults(responseJson))
        .catch(err => {
            $('#movie-results').addClass("hidden");
            console.log(err);
            $('#js-error-message').empty();
            $('#js-error-message').removeClass("hidden");
            $('#js-error-message').html(`  
            <p>Sorry, ratings are unavailable for this movie.</p>
            <br>
            <p>Please try another movie!</p>
            `);

        })
}

/* 
    Functions for YouTube Data API 
*/

// Trailer title and video player
function displayTrailerResults(responseJson2) {
    $('#trailer-results').removeClass('hidden');
    console.log(responseJson2);
    $('#trailer-list').empty();

    for (let i = 0; i < responseJson2.items.length; i++) {
        let videoTitle = responseJson2.items[i].snippet.title;
        let setLength = 35;
        let choppedVideoTitle = videoTitle.substring(0, setLength);
        let videoId = responseJson2.items[i].id.videoId;

        $('#trailer-list').append(`
        <p class="trailer-titles"><b>${choppedVideoTitle}</b></p>
        <iframe width="250" height="175" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        `
        )
    };
}

// Formats YouTube search query
function formatYouTubeQuery(youTubeParams) {
    const queryItems = Object.keys(youTubeParams)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(youTubeParams[key])}`)
    return queryItems.join('&');
}

// Fetch for YouTube API
function findTrailers(searchedMovie) {
    let movieSearch = searchedMovie + "trailer";
    const youTubeParams = {
        part: 'snippet',
        maxResults: 2,
        q: movieSearch,
        key: youTubeApiKey
    };

    const youTubeQuerySearch = formatYouTubeQuery(youTubeParams);
    const youTubeUrl = youTubeSearchUrl + "?" + youTubeQuerySearch;

    fetch(youTubeUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson2 => displayTrailerResults(responseJson2))
        .catch(err => {
            $('#js-error-message').text(`Error: ${err.message}`);
            console.log(err);
            $('#movie-results').addClass("hidden");
            $('.column3').addClass("hidden");
        })
}

// Transitions from main page to column format
function homeToMainPage() {
    $('#main-title').removeClass("welcome-page");
    $('.home-bckgrnd-image').addClass("hidden");
    $('#main-title').addClass("column1");
    $('#ww-title').removeClass("no-link-style");
    $('#ww-title').addClass("black-link-style");
    $('#p-1').removeClass("main-p");
    $('#p-1').addClass("main-b-p");
    $('#p-2').removeClass("main-p1");
    $('#p-2').addClass("main-b-p1");
}

// Watches for form submission
function watchForm() {
    $('#search-form').submit(event => {
        event.preventDefault();
        $('#js-error-message').empty();
        $('#js-error-message').addClass("hidden");
        homeToMainPage();
        // Declare user's input as a variable
        const searchedMovie = $("#search-bar").val();
        console.log("Looking for related movies...");
        findMovies(searchedMovie);
        findTrailers(searchedMovie);
    });
}

$(watchForm);