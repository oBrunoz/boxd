import express from "express"
import path from "path"
import { env } from "./config/env"
import movieRoutes from "./routes/movieRoutes";
import expressLayouts from "express-ejs-layouts"

const app = express();
const urls = {
    homeUrl: "/",
    moviesUrl: "/movies",
    seriesUrl: "/series",
    loginUrl: "/login",
    registerUrl: "/register",
}

// Middleware global para passar urls em todas as views
app.use((req, res, next) => {
    res.locals.urls = urls;
    next();
});

// view engine e layouts
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
app.set("layout", "./layout");

// Static files
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use('/api/movies', movieRoutes);

app.get("/", (req, res) => {
    res.render("pages/index");
})

app.get("/movies", (req, res) => {
    res.render("pages/movies");
})

app.get("/series", (req, res) => {
    res.render("pages/tv_show");
})

app.get("/login", (req, res) => {
    res.render("pages/login");
})

app.get("/register", (req, res) => {
    res.render("pages/signup");
})

app.get("/search/:content_type/:id", async (req, res): Promise<any> => {
    const {content_type, id} = req.params;
    
    try {
        let apiEndpoint;
        
        // Determine correct API endpoint based on content type
        if (content_type === 'movies') {
            apiEndpoint = `/api/movies/${id}`;
        } else if (content_type === 'series') {
            apiEndpoint = `/api/tv/${id}`;
        } else if (content_type === 'people') {
            apiEndpoint = `/api/person/${id}`;
        } else {
            return res.status(404).send('Content type not supported');
        }
        
        // Fetch the data before rendering
        const response = await fetch(`http://localhost:${process.env.PORT}${apiEndpoint}`);
        const contentDetails = await response.json();
        
        let trailerUrl = '#';
        if (content_type === 'movies' || content_type === 'series') {
            trailerUrl = await getTrailerUrl(id, content_type);
        }
        
        res.render("pages/content_details", {
            content_type, 
            details: contentDetails,
            trailerUrl
        });
    } catch (error) {
        console.error("Error fetching content details:", error);
        res.status(500).send("Error loading content details");
    }
});

async function getTrailerUrl(id: string, contentType: string): Promise<string> {
    try {
        const endpoint = contentType === 'movies' ? 'movies' : 'tv';
        const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3000";
        
        // Try Portuguese first
        let response = await fetch(`${apiBaseUrl}/api/${endpoint}/${id}/videos?language=pt-BR`);
        let data = await response.json();
        
        // Fall back to English if no results
        if (!data?.results?.length) {
            response = await fetch(`${apiBaseUrl}/api/${endpoint}/${id}/videos?language=en-US`);
            data = await response.json();
        }
        
        const trailer = data.results?.find((video: { type: string; site: string; key: string }) => video.type === "Trailer" && video.site === "YouTube");
        return trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&enablejsapi=1` : "#";
    } catch (error) {
        console.error("Error fetching trailer:", error);
        return "#";
    }
}

app.listen(env.PORT, () => {
    console.log("app working");
})

export default app;