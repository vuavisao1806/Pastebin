require("dotenv").config();

const { express, configs: cfg , redis } = require("./configs/index");

const mongoose = require("mongoose");
const cors = require("cors");

const { notFoundHandler, errorHandler, rateLimiter } = require("./middlewares");
const router = require("./routes/paste");

const PostQueue = require("./utils/patterns/postQueue");

const app = express();

app.use(express.json());
app.use(
    express.urlencoded({ extended: true })
);

app.use(cors({
    origin: [
        'http://localhost:3000', // for development
        'http://localhost:5173'  // for use Vite
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options("*", cors());

mongoose.connect(cfg.MONGO.URI)
    .then(() => {
        console.log("Connected to MongoDB");
        return redis.connect();
    })
    .then(async (client) => {
        app.set("clientRedis", client);
        // app.use(rateLimiter(client));

        const postQueue = new PostQueue("post-queue", client);
        app.set("postQueue", postQueue);

        app.use("/api", router);
        app.use(notFoundHandler);
        app.use(errorHandler);

        app.listen(cfg.BASE.PORT, cfg.BASE.HOST, () => {
            console.log(`Server listening at ${cfg.BASE.getUrl()}`);
        });
    })
    .catch ((error) => {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    });


module.exports = app;