const { express } = require("../configs/index");
const router = express.Router();

const catchAsyncHandler = require("../utils/catchAsyncHandler");

const { StatusCodes } = require("http-status-codes");
const { InternalServerError  } = require("../utils/ApiError");

router.get("/", catchAsyncHandler(async (req, res) => {
    try {
        const redis = req.app.get("clientRedis");
        await redis.ping();
        return res.status(StatusCodes.OK).json({ msg: "Healthy" });
    } catch (error) {
        throw new InternalServerError(error.message);
    }
}));

module.exports = router;