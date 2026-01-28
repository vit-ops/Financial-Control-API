import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

//ROUTERS
import AUTH from "./routers/auth.js"
import PAGES from "./routers/pages.js"
import DASHBOARD from "./routers/dashboard.js"
import DOCS from "./routers/docs.js"

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));



app.use("/", PAGES);

app.get("/logout", (req, res) => {res.clearCookie("session"); res.redirect("/")})

app.use("/dashboard", DASHBOARD);

app.use("/auth", AUTH);

app.use("/docs", DOCS)

app.use((req, res) => {
  res.status(404).sendFile(
    path.join(__dirname, "../public/html/404.html")
  );
});

export default app;
