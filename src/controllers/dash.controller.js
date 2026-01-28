import {db} from "../utils/db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function DashController(req, res) {
    try{
        const userDoc = await db.collection("users").doc(req.cookies.session).get();
        const userData = userDoc.data();

        if (userData.createdAt) {
        userData.createdAt = userData.createdAt.toDate().toLocaleString();
        }
        const collectionsSnap = await userDoc.ref.listCollections();
        const collectionsData = {};

        for (let col of collectionsSnap) {
        const snapshot = await col.get();
        collectionsData[col.id] = snapshot.docs.map(doc => {
            const data = doc.data();
            for (let key in data) {
            if (data[key]?.toDate) data[key] = data[key].toDate().toLocaleString();
            }
            return { id: doc.id, ...data };
        });
        }
        res.render("dashboard", {
        user: userData,
        collections: collectionsData
        });
    }
    catch (error){
        res.clearCookie("session");
        return res.status(404).sendFile(
        path.join(__dirname, "../../public/html/404.html")
        );
    }
}