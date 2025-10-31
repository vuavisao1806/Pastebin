const mongoose = require("mongoose");
const nodemon = require("nodemon");


const pasteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    pasteValue: {
        type: String,
        required: true
    },
    expiryTime: {
        type: Date,
    },
    uploadTime: {
        type: Date,
    }
})


// module.exports = mongoose.model("document", pasteSchema)
const Document = mongoose.model("Document", pasteSchema);
module.exports = Document;