import express from 'express';
import { getPopularMovies, getMovieDetails, getMovieVideos, getGenres, searchMulti, getMovieImages, getTrendingMovies } from '../controllers/movieController';

const router = express.Router();

router.get("/popular", getPopularMovies);
router.get("/trending/:time_window", getTrendingMovies);
router.get("/multi", searchMulti);
router.get("/:id/images", getMovieImages);
router.get("/:id/videos", getMovieVideos);
router.get("/:id", getMovieDetails);

export default router;