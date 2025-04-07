import express from "express"
import path from "path"
import { env } from "./config/env"
import movieRoutes from "./routes/movieRoutes";

const app = express();

app.use(express.static(path.join(__dirname, "../public")))

app.use('/api/movies', movieRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"))
})

app.listen(env.PORT, () => {
    console.log("app working");
})

export default app;