const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

const request = require('request');
const express = require('express');
const router = express.Router();

const nowPlayingURL = `${process.env.API_BASE_URL}/movie/now_playing?api_key=${process.env.API_KEY}`;
const baseImageURL = 'https://image.tmdb.org/t/p/w300';

router.use((req, res, next) => {
  res.locals.baseImageURL = baseImageURL;
  next();
});

/* GET home page. */
router.get('/', (req, res, next) => {
  res.set('Content-Security-Policy', "default-src * 'self' 'unsafe-inline'");
  res.set('Content-Security-Policy', "img-src * 'self' data: https:;");

  request.get(nowPlayingURL, (error, response, movieData) => {
    const parsedData = JSON.parse(movieData);

    res.render('index', {
      search: '',
      title: 'Now Playing',
      parsedData: parsedData.results,
    });
  });
});

router.get('/movie/:id', (req, res, next) => {
  res.set('Content-Security-Policy', "default-src * 'self' 'unsafe-inline'");
  res.set('Content-Security-Policy', "img-src * 'self' data: https:;");

  // res.json(req.params.id);
  const movieId = req.params.id;
  const thisMovieUrl = `${process.env.API_BASE_URL}/movie/${movieId}?api_key=${process.env.API_KEY}`;
  request.get(thisMovieUrl, (error, response, movieDetails) => {
    const parsedMovieDetails = JSON.parse(movieDetails);
    // res.json(parsedMovieDetails);

    res.render('single-movie', {
      parsedMovieDetails,
    });
  });
});

router.post('/search', (req, res, next) => {
  res.set('Content-Security-Policy', "default-src * 'self' 'uns afe-inline' ");
  res.set('Content-Security-Policy', "img-src * 'self' data: https:;");

  const userSearchTerm = encodeURI(req.body.movieSearch);
  const cat = req.body.cat;
  const movieURL = `${process.env.API_BASE_URL}/search/${cat}?query=${userSearchTerm}&api_key=${process.env.API_KEY}`;

  request.get(movieURL, (error, response, movieData) => {
    if (error) {
      res.render('error');
    }

    const parsedData = JSON.parse(movieData);

    if (cat === 'person') {
      try {
        parsedData.results = parsedData.results[0].known_for;
      } catch (error) {
        res.render('error');
      }
    }

    res.render('index', {
      search: `: ${req.body.movieSearch}`,
      title: 'Your Search',
      parsedData: parsedData.results,
    });
  });
});

module.exports = router;
