const mongoose = require("mongoose");
const { getShardIndex } = require("../utils/hash");
const { pasteSchema } = require("./model");

const shardUriList = [
    process.env.MONGODB_URL_SHARD0,
    process.env.MONGODB_URL_SHARD1,
    process.env.MONGODB_URL_SHARD2,
    process.env.MONGODB_URL_SHARD3,
    process.env.MONGODB_URL_SHARD4,
    process.env.MONGODB_URL_SHARD5,
].filter(Boolean);

const mongoConnections = [];
const DocumentModels = [];

async function initializeShards() {
    if (shardUriList.length === 0) {
        throw new Error("No shard URI configured");
    }

    for (const shardUri of shardUriList) {
        const connection = await mongoose.createConnection(shardUri).asPromise();
        console.log("Connected to MongoDB shard: ", shardUri);

        mongoConnections.push(connection);
        DocumentModels.push(connection.model("Document", pasteSchema));
    }
}

function getShardIndexByKeyId(key) {
    return getShardIndex(String(key), DocumentModels.length);
}

function getDocumentModel(key) {
    if (DocumentModels.length === 0) {
        throw new Error("Error on the shard configured process, and no document model is configured");
    }
    const idx = getShardIndex(String(key), DocumentModels.length);
    // console.log(`Shard ${idx} received ${key}`);
    return DocumentModels[idx];
}

module.exports = {
    initializeShards,
    getDocumentModel,
    getShardIndexByKeyId
}