import mongoose from "mongoose";

const logSchema = new mongoose.Schema( {

    type: 
    {
        type: String,
    },
    actioner:
    {
        type: String,
    },
    target:
    {
        type: String,
    },
    action: 
    {
        type: String,
    },
    data:
    {
        type: Object,
    },
    session:
    {
        type: String,
    },
    date:
    {
        type: Date,
        default: Date.now,
    },
    ip:
    {
    type: String,
    }
});

export const Log = mongoose.model("Logs", logSchema);