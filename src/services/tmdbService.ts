import axios from 'axios'
import { env } from '../config/env'

const BASE_URL = 'https://api.themoviedb.org/3';
interface TMDBParams {
    [key: string]: any;
}

export const getTMDBData = async (endpoint: string, params: TMDBParams = {}) => {
    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            params: {
                api_key: env.TMDB_API_KEY,
                language: 'pt-BR'
            }
        })

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`TMDB API Error: ${error.response.data.status_message || 'Unknown error'}`);
          }
        throw error;
    }
}

export const getImageUrl = (path: string, size: string = 'w500') => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
};