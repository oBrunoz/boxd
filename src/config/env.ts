import dotenv from "dotenv";
dotenv.config();

export const env = {
    TMDB_API_KEY: process.env.TMDB_API_KEY || "",
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000
};