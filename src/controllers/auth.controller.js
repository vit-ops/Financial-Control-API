import { auth, db , SaveToken} from "../utils/db.js";

export async function Login(req, res, next) {

  const { email, password } = req.body;

  try {
    const userRecord = await auth.getUserByEmail(email);
    const userDoc = await db.collection("users").doc(userRecord.uid).get();

    if (!userDoc.exists) {
      return res.status(400).json({
        success: false,
        message: "User não encontrado."
      });
    }

    const userData = userDoc.data();

    if (password !== userData.password) {
      return res.status(400).json({
        success: false,
        message: "Email ou senha incorretos"
      });
    }

     SaveToken(res, userRecord.uid);

    return res.status(200).json({
      success: true,
      message: "Login foi um sucesso!"
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: "Não foi possível fazer login."
    });

  }

}

export async function Register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    await db.collection("users").doc(userRecord.uid).set({
      name: name,
      email,
      password: password, 
      createdAt: new Date()
    });

   SaveToken(res, userRecord.uid);

    return res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso!"
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Não foi possível registrar o usuário!"
    });
  }
}
