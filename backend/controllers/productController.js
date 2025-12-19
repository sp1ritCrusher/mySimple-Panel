import { Product } from "../models/Products.js";
import { User } from "../models/User.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { Log } from "../models/Logs.js";
import { getDifferences, getIp } from "../utils/utils.js";

/* Controle de produtos */

/* Adição de produto */
export const addProduct = async (req, res) => {
  try {
    const requester = jwt.verify(req.cookies.accessToken,process.env.JWT_SECRET); 
    const { userid, name, description, price, ammount } = req.body;
    //adiciona 1 na quantia total de produtos desse usuário
    const user = await User.findByIdAndUpdate(userid, {
      $inc: { registeredProducts: 1 },
    });
    const code = uuidv4();
    const existingProductname = await Product.findOne({ name });
    //impedindo duplicação de nome
    if (existingProductname) {
      return res
        .status(409)
        .json({ message: "Nome ja existente", conflict: true });
    }
    const newProduct = new Product({
      userid,
      code: code,
      name,
      description,
      price,
      ammount,
    });
    const setObj = [];
    setObj.push(
      `ID: ${newProduct._id}`,
      `Nome: ${name}`,
      `Descrição: ${description}`,
      `Preço: ${price}`,
      `Quantia Inicial: ${ammount}`
    );
    await newProduct.save();
    if(requester.power === "admin" && newProduct.userid !== requester.id) {
        await Log.create({
        type: "admin",
        actioner: `${requester.name}`,
        target: `${user.name}`,
        action: `O admin ${requester.name} criou o produto ${newProduct._id} para o usuário ${user.name}`,
        data: setObj,
        session: requester.session,
        ip: getIp(req)
    });
    } else {
    await Log.create({
        type: "user",
        actioner: `${user.name}`,
        target: `${newProduct._id}`,
        action: `O usuário ${requester.name} criou o produto ${newProduct._id}`,
        data: setObj,
        session: requester.session,
        ip: getIp(req)
    });
  }
    return res.status(201).json({ message: "Produto cadastrado com sucesso", product: newProduct });
  } catch (error) {
    console.log(error);
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
    return res
      .status(500)
      .json({ message: "Erro ao localizar usuário", error });
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
  const setObj = [];
  //Validando requisidor da edição
  const requester = jwt.verify(req.cookies.accessToken,process.env.JWT_SECRET);
  try {
    const product = await Product.findById(req.params.id);
    const user = await User.findById(product.userid);
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
    const diff = getDifferences(product, updated);
    if (diff.name) {
      setObj.push(`Mudou o nome de "${diff.name.current}" para "${diff.name.new}"`);
    }
    if (diff.description) {
      setObj.push(`Mudou a descriçao de "${diff.description.current}" para "${diff.description.new}"`);
    }
    if(diff.price) {
      setObj.push(`Mudou o preço de R$ ${diff.price.current} para R$ ${diff.price.new}`)
    }
    if(diff.ammount) {
      setObj.push(`Mudou a quantidade de ${diff.ammount.current} para ${diff.ammount.new}`)
    }
    res.status(200).json({ message: "Produto atualizado com sucesso!", product: updated });


      if(requester.power === "admin" && product.userid !== requester.id) {
        await Log.create({
        type: "admin",
        actioner: `${requester.name}`,
        target: `Produto ${product._id} do usuário ${user.name}`,
        action: `O admin ${requester.name} editou o produto ${product._id} do usuário ${user.name}`,
        data: setObj,
        session: requester.session,
        ip: getIp(req)
      });
      } else {
      await Log.create({
        type: "user",
        actioner: `${requester.name}`,
        target: `Produto ID ${product._id}`,
        action: `O usuário ${requester.name} editou o produto ${product._id}`,
        data: setObj,
        session: requester.session,
        ip: getIp(req)
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erro ao atualizar" });
  }
};

/* Remoção de Produto */

export const deleteProduct = async (req, res) => {
  try {
    const requester = jwt.verify(req.cookies.accessToken,process.env.JWT_SECRET); 
    const product = await Product.findById(req.params.id);
    const user = await User.findById(product.userid);
    //recebe o ID pertencente do user no produto
    //Subtrai 1 na quantia de produtos pra esse usuario
    await User.findByIdAndUpdate(product.userid, { $inc: { registeredProducts: -1 } });
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Produto deletado com sucesso" });
    if(requester.power === "admin" && product.userid !== requester.id ) {
      await Log.create({
        type: "admin",
        actioner: `${requester.name}`,
        target: `${product._id}`,
        action: `O admin ${requester.name} removeu um produto do usuario ${user.name}`,
        data: `Removeu o produto de ID ${product._id}, de nome "${product.name}"`,
        session: requester.session,
        ip: getIp(req)
        });
    } else {
    await Log.create({
        type: "user",
        actioner: `${user.name}`,
        target: `Produto ID ${product._id}`,
        action: `O usuário ${user.name} removeu um produto`,
        data: `Removeu o produto de ID ${product._id}, de nome "${product.name}"`,
        session: requester.session,
        ip: getIp(req)
    });
  }
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar" });
  }
};
