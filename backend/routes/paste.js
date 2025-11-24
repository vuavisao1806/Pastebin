const {express} = require("../configs/index");
const router = express.Router();

// const Document = require("../database/model");
const { getDocumentModel } = require("../database/shards");

const PQueue = require("p-queue").default;
const getQueue = new PQueue({ concurrency: 5, intervalCap: 20, interval: 2  });

const { StatusCodes } = require("http-status-codes");

const catchAsyncHandler = require("../utils/catchAsyncHandler");
const { NotFoundError, ForbiddenError, BadRequestError  } = require("../utils/ApiError");

router.post("/save", catchAsyncHandler(async (req, res) => {
    const { title, pasteValue, expiryTime } = req.body


    const postQueue = req.app.get("postQueue");
    const job = await postQueue.add("createPastebin", { title, pasteValue, expiryTime }, {
        removeOnFail: false
    })

    // for checking rate limiting
    // const maxJobs = 10;
    // const ttl = await postQueue.getRateLimitTtl(maxJobs);
    // if (ttl > 0) {
    //     console.log("Post queue is rate limited")
    // }

    res.set("Location", `/jobs/${job.id}`);
    return res.status(StatusCodes.ACCEPTED).json({ jobId: job.id });
}));

router.get("/jobs/:jobId", catchAsyncHandler(async (req, res) => {
    const postQueue = req.app.get("postQueue");
    const job = await postQueue.getJob(req.params.jobId);
    if (!job) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Job not found" });
    }

    const currentState = await job.getState();

    const { timestamp, processedOn, finishedOn } = job;

    const waitingTime =
        ((timestamp && processedOn) ? processedOn - timestamp : null);
    const processingTime =
        ((processedOn && finishedOn) ? finishedOn - processedOn : null);
    const totalTime =
        ((timestamp && finishedOn) ? finishedOn - timestamp : null);

    const timeEvents = {
        waitingTime,
        processingTime,
        totalTime
    }

    if (currentState === "completed") {
        const result = job.returnvalue;
        return res.json({ currentState, id: result?.id, timeEvents });
    }
    if (currentState === "failed") {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ currentState, reason: job.failedReason, timeEvents });
    }
    return res.status(StatusCodes.ACCEPTED).json({ currentState, timeEvents });
}));

router.get("/:id", catchAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const document = await getQueue.add(async () => {
        const redis = req.app.get("clientRedis");

        const cacheKey = `document:${id}`;
        let cachedDocument = null;

        if (redis) {
            cachedDocument = await redis.get(cacheKey);
        }

        let document;
        if (cachedDocument) {
            document = JSON.parse(cachedDocument);
            if (document.expiryTime) {
                document.expiryTime = new Date(document.expiryTime);
            }
            // console.debug(`Cache hit for the document that has id: ${id}`);
        } else {
            // console.debug(`Cache miss for the document that has id: ${id}`);
            const Document = getDocumentModel(id);
            document = await Document.findById(id);
        }
        if (!document) {
            throw new NotFoundError("Document not found");
        }
        if (document.expiryTime && document.expiryTime < new Date()) {
            if (cachedDocument && redis) {
                await redis.del(cacheKey);
            }
            throw new ForbiddenError("Paste has expired");
        }
        if (!cachedDocument && redis) {
            let cacheTime;
            if (document.expiryTime) {
                cacheTime = Math.floor((document.expiryTime - Date.now()) / 1_000);
            } else {
                cacheTime = 900;
            }
            if (cacheTime > 0) {
                await redis.set(cacheKey, JSON.stringify(document), "EX", cacheTime);
            }
        }
        return document;
    });
    return res.json({
        text: document.pasteValue,
        uploadTime: document.uploadTime,
        expiryTime: document.expiryTime,
        title: document.title
    });
}));

module.exports = router;