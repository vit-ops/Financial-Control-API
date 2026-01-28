import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function homeController(req, res) {
  res.status(200).sendFile(
    path.join(__dirname, "../../public/html/home.html")
  );
}

