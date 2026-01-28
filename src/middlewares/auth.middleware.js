import path from "path";
import { db } from "../utils/db.js";


export function verificToken(req, res, next) {
  const token = req.cookies.session;
  const path = req.originalUrl;

  if (!token && path === "/dashboard") return res.redirect("/");
  if (token && path === "/") return res.redirect("/dashboard");
  if(!token && path !== "/"){
    return res.redirect("/"); 
  }

  next();
}


export function validateRegister(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Campos obrigatórios" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Senha muito curta" });
  }

  next();
}

// LOGIN VALIDATION
export function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha obrigatórios" });
  }
  next();
}
