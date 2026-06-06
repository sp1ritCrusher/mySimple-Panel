import { v4 as uuidv4 } from "uuid";
import { ProductError } from "../errors/AppError.js";
import { validateProduct, validateUser, validateProductPermission } from "../utils/utils.js";
import * as userRepository from "../repositories/userRepository.js";
import * as productRepository from "../repositories/productRepository.js";

export async function getProductByIdService(id, userid) {
  const user = await userRepository.findById(userid);
  validateUser(user, ProductError);
  const product = await productRepository.findById(id);
  validateProduct(product);
  validateProductPermission(user, product);
  return product;
}

export async function addProduct({ data, userid }) {
  const user = await userRepository.findById(userid);
  const productCode  = uuidv4();
  validateUser(user, ProductError);
  const existingProduct = await productRepository.findByName(data.name);
  if (existingProduct) {
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
        amount: data.amount,
        code: productCode 
    });
    //await userRepository.update(data.userid, { $inc: { registeredProducts: 1 } });
    return newProduct;
}

export async function editProduct(userid, productid, newData) {
    const user = await userRepository.findById(userid);
    validateUser(user, ProductError);
    const product = await productRepository.findById(productid);
    validateProduct(product);
    validateProductPermission(user, product);
    const updated = await productRepository.update(productid, newData);
    return updated;
}

export async function deleteProduct(userid, productid) {
    const user = await userRepository.findById(userid);
    const product = await productRepository.findById(productid);
    validateUser(user, ProductError);
    validateProduct(product);
    validateProductPermission(user, product);
    const deleted = await productRepository.removebyId(productid);
    return deleted;
}

export async function getProducts(userid) {
const user = await userRepository.findById(userid);
validateUser(user, ProductError);
return await productRepository.findAny(userid);
}