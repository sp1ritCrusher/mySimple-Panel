import jwt from "jsonwebtoken";
import { getIp } from "../utils/utils.js";
import * as productService from "../services/productServices.js";
import * as productLog from "../logs/productLogs.js";
import { ProductError, AppError } from "../errors/AppError.js";
import * as systemLog from "../logs/systemLogs.js";
import * as productRepository from "../repositories/productRepository.js";

/* Controle de produtos */

/* Adição de produto */
export const addProduct = async (req, res) => {
  const requester = jwt.verify(req.cookies.accessToken,process.env.JWT_SECRET);
  console.log("REQUISIDOR", requester);
  try {
    const newProduct = await productService.addProduct({ data: req.body, userid: req.body.userid });
    if(!newProduct) {
      throw new ProductError({ 
        message: "Erro ao cadastrar produto",
        status: 404,
        code: "NOT_FOUND" });
    }
    await productLog.product_Add(newProduct, requester.id, requester.session, getIp(req));
    return res.status(201).json({ message: "Produto cadastrado com sucesso", newProduct });
  } catch (error) {
    systemLog.error_log(error, getIp(req));
    console.error("Erro: ", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          code: error.code,
          message: error.message,
        });
      }
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno no servidor",
      });
  }
};

/* Indice de Produtos por Usuário */

export const getProducts = async (req, res) => {
  //reutilização pra rotas diferentes - listagem pra admin e listagem pra user
  try {
  const targetUserId = req.query.userid || req.user.id;
  const requester = jwt.verify(req.cookies.accessToken,process.env.JWT_SECRET);
  if(requester.power !== "admin" && requester.id !== targetUserId) {
      throw new ProductError({ 
      message: "Você não está autorizado",
      status: 403,
      code: "FORBIDDEN" });
  }
  const product = await productService.getProducts(targetUserId);
  if(!product) {
    throw new ProductError({ 
      message: "Produto não encontrado",
      status: 404,
      code: "NOT_FOUND" });
  }
    res.status(200).json({ message: "Produtos encontrados!", product });
  } catch (error) {
    systemLog.error_log(error, getIp(req));
    console.error("Erro: ", error);
      if (error instanceof AppError) {
        return res.status(error.status).json({
          code: error.code,
          message: error.message,
        });
      }
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno no servidor",
      });
  }
};

/* Listando produto pelo ID */

export const getProductById = async (req, res) => {
  try {
    const product = await productRepository.findById(req.params.id);
    if(!product) {
    throw new ProductError({ 
      message: "Produto não encontrado",
      status: 404,
      code: "NOT_FOUND" });
    }
    return res.status(200).json({ product });
  } catch (error) {
    systemLog.error_log(error, getIp(req));
    console.error("Erro: ", error);
    if (error instanceof AppError) {
        return res.status(error.status).json({
          code: error.code,
          message: error.message,
        });
      }
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno no servidor",
    });
  }
};
/* Edição de produto */

export const updateProduct = async (req, res) => {
  const requester = jwt.verify(req.cookies.accessToken,process.env.JWT_SECRET);
  try {
    const product = await productRepository.findById(req.params.id);
    if(!product) {
    throw new ProductError({ 
      message: "Produto não encontrado",
      status: 404,
      code: "NOT_FOUND" });
    }
    if (product.user_id !== requester.id && requester.power !== "admin") {
      throw new ProductError({ 
      message: "Você não está autorizado",
      status: 403,
      code: "FORBIDDEN" });
    }
    const updateProduct = await productService.editProduct(req.params.id, req.body);
    await productLog.product_Edit(requester.id, product, updateProduct, requester.session, getIp(req));
    res.status(200).json({ message: "Produto atualizado com sucesso!", product: updateProduct });
  } catch (error) {
    systemLog.error_log(error, getIp(req));
    console.error("Erro: ", error);
    if (error instanceof AppError) {
        return res.status(error.status).json({
          code: error.code,
          message: error.message,
        });
      }
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno no servidor",
    });
  }
};

/* Remoção de Produto */

export const deleteProduct = async (req, res) => {
  try {
    const requester = jwt.verify(req.cookies.accessToken,process.env.JWT_SECRET); 
    const product = await productRepository.findById(req.params.id);
    if(!product) {
    throw new ProductError({ 
      message: "Produto não encontrado",
      status: 404,
      code: "NOT_FOUND" });
    }
    if (product.user_id !== requester.id && requester.power !== "admin") {
      throw new ProductError({ 
      message: "Você não está autorizado",
      status: 403,
      code: "FORBIDDEN" });
    }
    const deletedProduct = await productService.deleteProduct(requester.id, product.id);
    await productLog.product_Delete(requester.id, product, requester.session, getIp(req));
    return res.status(200).json({ message: "Produto deletado com sucesso", deletedProduct });
  } catch (error) {
    systemLog.error_log(error, getIp(req));
    console.error("Erro: ", error);
    if (error instanceof AppError) {
        return res.status(error.status).json({
          code: error.code,
          message: error.message,
        });
      }
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno no servidor",
    });
  }
}
