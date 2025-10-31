require("dotenv").config();
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()

const Document = require("./models/model")
const mongoDB = process.env.MONGODB_URL;
mongoose.connect(mongoDB);
const db = mongoose.connection;
main().catch((err) => console.log(err));

async function main() {
    try {
        await mongoose.connect(mongoDB);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

// ===== SỬA PHẦN NÀY =====
app.use(cors({
    origin: [
        'http://localhost:3000', // cho development
        'http://localhost:5173'  // nếu dùng Vite
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
 ////////////////////////////
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.post("/save", async (req, res) => {
    const { title, pasteValue, expiryTime } = req.body
    // const uploadTime = Date.now()
    const uploadTime = new Date();
    const newPaste = new Document({
        title: title,
        pasteValue: pasteValue,
        expiryTime: calculateExpiryTime(expiryTime),
        uploadTime: uploadTime
    });
    try {
        await newPaste.save();
        res.json({ _id: newPaste._id });
        console.log("paste saved successfully")
    }
    catch (error) {
        console.log("error saving the paste", error)
        res.status(500).send("Error saving the text")
    }
});

function calculateExpiryTime(expiryOption) {
    if (expiryOption === "never") {
        return null;
    } else if (expiryOption === "1minute") {
        return new Date(Date.now() + 60 * 1000);
    }
    else if (expiryOption === "10minutes") {
        return new Date(Date.now() + 10 * 60 * 1000);
    }
    else if (expiryOption === "1day") {
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    else if (expiryOption === "2days") {
        return new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    }
    else if (expiryOption === "1week") {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
}

app.get("/:id", async (req, res) => {
    const id = req.params.id
    try {
        const document = await Document.findById(id)
        if (!document) {
            return res.status(404).json({ error: " Document not found" })
        }
        if (document.expiryTime && document.expiryTime < new Date()) {
            return res.status(403).json({ error: "Paste has expired" });
        }
        res.json({ text: document.pasteValue, uploadTime: document.uploadTime, title: document.title, expiryTime: document.expiryTime })
    }
    catch (e) {
        res.status(500).json({ error: "Server error" })
    }
})


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
    console.log(`http://localhost:${PORT}/`)
})