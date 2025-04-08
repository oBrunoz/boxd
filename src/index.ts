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

app.listen(env.PORT, () => {
    console.log("app working");
})

export default app;