import { v4 as uuidv4 } from "uuid";
import { ProductError } from "../errors/AppError.js";
import * as userRepository from "../repositories/userRepository.js";
import * as productRepository from "../repositories/productRepository.js";

export async function addProduct({ data, userid }) {
const code = uuidv4();
const existingProductname = await productRepository.findByName(data.name);
  if (existingProductname) {
    throw new ProductError({ 
      message: "Produto já existente",
      status: 409,
      code: "PRODUCT_ALREADY_EXISTS" });
    }
    const newProduct = await productRepository.create({
        user_id: userid,
        name: data.name,
        description: data.description,
        price: data.price,
        amount: data.ammount,
        code: code
    });
    //await userRepository.update(data.userid, { $inc: { registeredProducts: 1 } });
    return newProduct;
}

export async function editProduct(productid, newData) {
    const product = await productRepository.findById(productid);
    if(!product) {
    throw new ProductError({ 
      message: "Produto não encontrado",
      status: 404,
      code: "NOT_FOUND" });
    }
    const updated = await productRepository.update(productid, newData);
    return updated;
}

export async function deleteProduct(userid, productid) {
    const deleted = await productRepository.removebyId(productid);
    return deleted;
}

export async function getProducts(userid) {
const data = await productRepository.findAny(userid);
    if (!data) {
      throw new Error({ message: "Sem produtos pra esse usuário" });
    }
    return data;
}