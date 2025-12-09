import { Product } from "../models/Products.js";
import { User } from "../models/User.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

/* Controle de produtos */


/* Adição de produto */
export const addProduct = async (req, res) => {
  try {
    const { userid, name, description, price, ammount} = req.body;
    //adiciona 1 na quantia total de produtos desse usuário
    await User.findByIdAndUpdate(userid, { $inc: { registeredProducts: 1 } });
    const code = uuidv4();
    const existingProductname = await Product.findOne({ name });
    //impedindo duplicação de nome
    if (existingProductname) {
      return res.status(409).json({ message: "Nome ja existente", conflict: true });
    }
    const newProduct = new Product({
      userid,
      code: code,
      name,
      description,
      price,
      ammount,
    });
    await newProduct.save();
    return res.status(201).json({ message: "Produto cadastrado com sucesso", product: newProduct });
  } catch (error) {
    return res.status(404).json({ message: "Erro ao cadastrar produto ", error: error });
  }
};

/* Indice de Produtos por Usuário */

export const getProducts = async (req, res) => {
  //reutilização pra rotas diferentes - listagem pra admin e listagem pra user
  const targetUserId = req.query.userid || req.user.id;

  const data = await Product.find({ userid: targetUserId });
  try {
    if (!data) {
      return res.status(404).json({ message: "Sem produtos pra esse usuário" });
    }
    res.status(200).json({ message: "Produtos encontrados!", product: data });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao localizar usuário", error });
  }
};

/* Listando produto pelo ID */

export const getProductById = async (req, res) => {

  try {
    const product = await Product.findById(req.params.id);
    return res.status(200).json({ product });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar produto" });
  }
};
/* Edição de produto */

export const updateProduct = async (req, res) => {
  //Validando requisidor da edição
  const requester = jwt.verify(
    req.cookies.refreshToken,
    process.env.JWT_REFRESH_SECRET
  );
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    //permite admin editar todos, e impede um usuario de editar um produto que não pertença ao seu ID
    if (requester.power !== "admin" && product.userid !== requester.id) {
      return res.status(400).json({ message: "Erro,você não está autorizado" });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ message: "Produto atualizado com sucesso!", product: updated });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar" });
  }
};

/* Remoção de Produto */

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    //recebe o ID pertencente do user no produto
    const user = product.userid;
    //Subtrai 1 na quantia de produtos pra esse usuario
    await User.findByIdAndUpdate(user, { $inc: { registeredProducts: -1 } });
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Produto deletado com sucesso"});
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar" });
  }
};
