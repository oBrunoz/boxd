import express from 'express';
import { getPopularMovies, getMovieDetails, getMovieVideos, getGenres, searchMulti } from '../controllers/movieController';

const router = express.Router();

router.get("/popular", getPopularMovies);
router.get("/multi", searchMulti);
router.get("/genres", getGenres);
router.get("/:id/videos", getMovieVideos);
router.get("/:id", getMovieDetails);

export default router;