import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  userid: {
    type: String,
  },
  code: {
    type: String,
  },
  name: {
    type: String,
    required: [true, "O nome é obrigatório"],
  },
  description: {
    type: String,
    required: [true, "A descrição é obrigatória"],
  },
  price: {
    type: Number,
    min: [0, "Quantia deve ser positiva"],
    required: [true, "O preço é obrigatório"],
    validate: {
    validator: Number.isInteger,
    message: "O preço deve ser um numero inteiro",
    }
  },
  ammount: {
    type: Number,
    min: [0, "Quantia deve ser positiva"],
    required: [true, "A quantiadade é obrigatória"],
    validate: {
    validator: Number.isInteger,
    message: "A quantidade deve ser um numero inteiro",
    }
  },
});

export const Product = mongoose.model("Product", productSchema);
