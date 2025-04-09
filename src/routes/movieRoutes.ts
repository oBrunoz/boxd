import express from 'express';
import { getPopularMovies, getMovieDetails, getMovieVideos, getGenres, searchMovies, getMovieImages } from '../controllers/movieController';

const router = express.Router();

router.get("/popular", getPopularMovies);
router.get("/:id/images", getMovieImages)
// router.get("/search", searchMovies);
router.get("/:id", getMovieDetails);
router.get("/:id/videos", getMovieVideos);
router.get("/:id", getMovieDetails);

export default router;