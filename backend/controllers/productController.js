import jwt from "jsonwebtoken";
import { getIp } from "../utils/utils.js";
import * as productService from "../services/productServices.js";
import * as productLog from "../logs/productLogs.js";
import { ProductError } from "../errors/AppError.js";
import * as systemLog from "../logs/systemLogs.js";
import * as productRepository from "../repositories/productRepository.js";

export const addProduct = async (req, res) => {
    const user = req.user;
    const newProduct = await productService.addProduct({ data: req.body, userid: user.id });
    await productLog.product_Add(newProduct, user.id, user.session, getIp(req));
    return res.status(201).json({ message: "Produto cadastrado com sucesso", data: newProduct });
  } 

export const getProducts = async (req, res) => {
  const user = req.user;
  const products = await productService.getProducts(user.id);
  if (!products || products.length === 0) {
    return res.status(200).json({ products: [] });
  }
  return res.status(200).json({ message: "Produtos encontrados!", products });
  } 

export const getStats = async (req, res) => {

  const user = req.user;
  const data = await productService.getUser_stats(user.id);
  return res.status(200).json({ data });

}

/* Listando produto pelo ID */

export const getProductById = async (req, res) => {
    const user = req.user;
    const product = await productService.getProductByIdService(req.params.id, user.id);
    return res.status(200).json({ product });
} 

/* Edição de produto */

export const updateProduct = async (req, res) => {
  const user = req.user;
  const productid = req.params.id;
  const productBefore = await productService.getProductByIdService(productid, user.id);
  const updated = await productService.editProduct(user.id, productid, req.body);
  await productLog.product_Edit(user.id, productBefore, updated, user.session, getIp(req));
  return res.status(200).json({ message: "Produto atualizado com sucesso!", product: updated });
  } 

/* Remoção de Produto */

export const deleteProduct = async (req, res) => {
    const user = req.user;
    const productId = req.params.id;
    const deleted = await productService.deleteProduct(user.id, productId);
    await productLog.product_Delete(user.id, deleted, user.session, getIp(req));
    return res.status(200).json({ message: "Produto deletado com sucesso", deleteProduct: deleted });
}
