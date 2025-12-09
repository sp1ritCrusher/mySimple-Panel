import mongoose from "mongoose";

const userSchema = new mongoose.Schema( {

    name: 
    {
        type: String,
        required: [true, "O nome é obrigatório"],
        minlength: [6, "A senha deve ter pelo menos 8 caracteres"],
        unique: true,
        trim: true,
        validate: {
        validator: (v) => !/\s/.test(v),
        message: "O nome nao deve conter espacos"
    },
    },
    email: 
    {
        type: String,
        required: [true, "O email é obrigatório"],
        unique: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Email Invalido"]
    },
    password: 
    {
        type: String,
        required: [true, "A senha é obrigatória"],
        minlength: [8, "A senha deve ter pelo menos 8 caracteres"],
        trim: true
    },
    phone: 
    { 
        type: String,
        required: true,
        trim: true
    },
    power:
    {
        type: String,
    },

    registeredProducts: 
    {
        type: Number,
    }
});

export const User = mongoose.model("User", userSchema);