import express from 'express';
import { getPopularMovies, getMovieDetails, getMovieVideos, getGenres, searchMovies } from '../controllers/movieController';

const router = express.Router();

router.get("/popular", getPopularMovies);
// router.get("/search", searchMovies);
router.get("/:id", getMovieDetails);
router.get("/:id/videos", getMovieVideos);
router.get("/genres", getGenres);

export default router;