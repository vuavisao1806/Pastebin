const { express } = require("../configs/index");
const router = express.Router();

const pasteRouter = require("./paste");
const healthRouter = require("./health");

router.use("/api", pasteRouter);
router.use("/health", healthRouter);

module.exports = router;