import {db} from "../utils/db.js"
export async function getcollection(req,res) {
    const collection = await db
      .collection("users")
      .doc(req.cookies.session)
      .collection(req.params.name)
      .get();
    let docs = collection.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
    docs = docs.filter(doc => doc.id !== "metadados");
    return res.status(200).render("collection", {docs : docs});
}

export async function addCollection(req, res) {
  try {
    await db
      .collection("users")
      .doc(req.cookies.session)
      .collection(req.params.name)
      .doc("metadados") 
      .set({
        NomeOriginal : req.params.name,
        createdAt: new Date()
      });

    return res.status(201).json({
      success: true,
      message: "Collection criada com sucesso"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro ao criar collection"
    });
  }
}

export async function deleteCollection(req, res) {
  try {
    const collectionRef = db
      .collection("users")
      .doc(req.cookies.session)
      .collection(req.params.name);
    const snapshot = await collectionRef.get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    return res.json({
      success: true,
      message: "Collection deletada com sucesso"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao deletar collection"
    });
  }
}
export async function renameCollection(req, res) {
  try {
    const { name } = req.params; 
    const { NovoNome } = req.body; 
    const uid = req.cookies.session;

    const oldCol = db.collection("users").doc(uid).collection(name);
    const newCol = db.collection("users").doc(uid).collection(NovoNome);

    const docs = await oldCol.get();
    const batch = db.batch();

    docs.forEach(doc => {
      batch.set(newCol.doc(doc.id), doc.data());
      batch.delete(oldCol.doc(doc.id));
    });

    await batch.commit();

    return res.json({
      success: true,
      message: "Collection renomeada com sucesso"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Erro ao renomear collection"
    });
  }
}
