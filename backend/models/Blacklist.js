import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema( {

    userid: 
    {
        type: String,
    },
    token: 
    {
        type: String,
    },
    sessionId:
    {
        type: String,
    },
    expiresAt: {
        type: Date,
        default: () => Date.now () + 7 * 24 * 60 * 60 * 1000
    },
});

blacklistSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});
export const Blacklist = mongoose.model("Blacklist", blacklistSchema);