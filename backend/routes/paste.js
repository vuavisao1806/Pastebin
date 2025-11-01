const {express} = require("../configs");
const router = express.Router();

const Document = require("../models/model")

const { StatusCodes } = require("http-status-codes");

const catchAsyncHandler = require("../utils/catchAsyncHandler");
const { NotFoundError, ForbiddenError, BadRequestError  } = require("../utils/ApiError");

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
    throw new BadRequestError("Invalid Expiry Option");
}

router.post("/save", catchAsyncHandler(async (req, res) => {
    const { title, pasteValue, expiryTime } = req.body

    const uploadTime = new Date();
    const newPaste = new Document({
        title: title,
        pasteValue: pasteValue,
        expiryTime: calculateExpiryTime(expiryTime),
        uploadTime: uploadTime
    });
    await newPaste.save();
    console.log("paste saved successfully");
    return res.status(StatusCodes.CREATED).json({ _id: newPaste._id });
}));

router.get("/:id", catchAsyncHandler(async (req, res) => {
    const id = req.params.id
    const document = await Document.findById(id)
    if (!document) {
        throw new NotFoundError("Document not found");
    }
    if (document.expiryTime && document.expiryTime < new Date()) {
        throw new ForbiddenError("Paste has expired");
    }
    return res.json({
        text: document.pasteValue,
        uploadTime: document.uploadTime,
        expiryTime: document.expiryTime,
        title: document.title
    });
}));

module.exports = router;