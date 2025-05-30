import { Request, Response, NextFunction } from 'express';
import { getTMDBData } from '../services/tmdbService';

export const getTVShowDetails = async (
    req: Request, 
    res: Response, 
    next: NextFunction) => {
        try {
            const { id } = req.params;
            const data = await getTMDBData(`/tv/${id}`, {append_to_response:'credits,similar,recommendations'});

            res.json(data);
        } catch (error) {
            next(error);
        }
};

export const getTVShowImages = async (
    req: Request, 
    res: Response, 
    next: NextFunction) => {
        try {
            const { id } = req.params;
            const data = await getTMDBData(`/tv/${id}/images`, {include_image_language:'en,null'});
            res.json(data);
        } catch (error) {
            next(error);
        }
};

export const getTVShowVideos = async (
    req: Request, 
    res: Response, 
    next: NextFunction) => {
        try {
            const { id } = req.params;
            const language = req.query.language || 'pt-BR';
            const data = await getTMDBData(`/tv/${id}/videos`, { language });
            res.json(data);
        } catch (error) {
            next(error);
        }
};

