const {express} = require("../configs/index");
const router = express.Router();

const Document = require("../models/model")

const { StatusCodes } = require("http-status-codes");

const catchAsyncHandler = require("../utils/catchAsyncHandler");
const { NotFoundError, ForbiddenError, BadRequestError  } = require("../utils/ApiError");
const { Types } = require("mongoose");

router.post("/save", catchAsyncHandler(async (req, res) => {
    const { title, pasteValue, expiryTime } = req.body

    const _id = new Types.ObjectId();

    const postQueue = req.app.get("postQueue");
    await postQueue.add("createPastebin", { _id, title, pasteValue, expiryTime });

    return res.status(StatusCodes.CREATED).json({ _id });
}));

router.get("/:id", catchAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const document = await Document.findById(id);
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