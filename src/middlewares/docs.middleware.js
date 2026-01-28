
import {db} from "../utils/db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



export async function GetCollectionVerific(req, res, next) {
  try {
    const name = req.params.name;
    const uid = req.cookies.session;

    if (!name) {
      return res.status(404).sendFile(
      path.join(__dirname, "../../public/html/404.html")
      );
    }

    const snapshot = await db
      .collection("users")
      .doc(uid)
      .collection(name)
      .get();

    if (snapshot.empty) {
      return res.status(404).sendFile(
      path.join(__dirname, "../../public/html/404.html")
      );
    }

    next();
  } catch (err) {
      return res.status(404).sendFile(
      path.join(__dirname, "../../public/html/404.html")
      );
  }
}

export async function verifyCollectionAdd(req, res, next) {
  try {
    const { name } = req.params;
    if(name == "metadados"){
      return res.status(400).json({
        success : false,
        message : "Nome Invalido."
      });
    }
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nome da collection é obrigatório"
      });
    }

    const validName = /^[a-zA-Z0-9]+$/;

    if (!validName.test(name)) {
      return res.status(400).json({
        success: false,
        message: "Nome inválido. Use apenas letras e números."
      });
    }

    const snapshot = await db
      .collection("users")
      .doc(req.cookies.session)
      .collection(name)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return res.status(409).json({
        success: false,
        message: "Collection já existe"
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao verificar collection"
    });
  }
}

export async function VerifyRenameCollection(req, res, next) {
  try {
    const { NovoNome } = req.body;
    const { name } = req.params;
    if (!name || !NovoNome) {
      return res.status(400).json({
        success: false,
        message: "Todos os campos são obrigatórios"
      });
    }
    if (NovoNome === name) {
      return res.status(200).json({
        success: true,
        message: "Collection renomeada com sucesso!"
      });
    }
    if (NovoNome.length < 2 || NovoNome.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Nome deve ter entre 2 e 30 caracteres"
      });
    }
    if (NovoNome == "metadados") {
      return res.status(400).json({
        success: false,
        message: "Nome Invalido"
      });
    }
    const validName = /^[a-zA-Z0-9]+$/;
    if (!validName.test(NovoNome)) {
      return res.status(400).json({
        success: false,
        message: "Use apenas letras e números"
      });
    }
    const snapshot = await db
      .collection("users")
      .doc(req.cookies.session)
      .collection(name)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return res.status(400).json({
        success: false,
        message: "Collection " + name + " nao existe!"
      });
    }
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Erro interno"
    });
  }
}
