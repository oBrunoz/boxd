import { Request, Response, NextFunction } from 'express';
import { getTMDBData } from '../services/tmdbService';

// Obter filmes populares
export const getPopularMovies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const data = await getTMDBData('/movie/popular', { page });
    
    res.json(data);
  } catch (error) {
    throw error;
  }
};

// Obter detalhes de um filme específico
export const getMovieDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = await getTMDBData(`/movie/${id}`);
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getMovieImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = await getTMDBData(`/movie/${id}/images`);
    res.json(data);

  }catch(error) {
    next(error);
  }
}

export const searchMovies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q;
    const page = req.query.page ? Number(req.query.page) : 1;
    
    if (!query) {
      return res.status(400).json({ message: 'O parâmetro de busca é obrigatório' });
    }
    
    const data = await getTMDBData('/search/movie', { query, page });
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getMovieVideos = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { id } = req.params;
      const data = await getTMDBData(`/movie/${id}/videos`);
      res.json(data);
  } catch (error) {
      next(error);
  }
};

export const getGenres = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const data = await getTMDBData(`/genre/movie/list`);
      res.json(data);
  } catch (error) {
      next(error);
  }
};