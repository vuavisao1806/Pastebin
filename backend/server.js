require("dotenv").config();

const { express, configs: cfg } = require("./configs");
const mongoose = require("mongoose");
const cors = require("cors");

const { notFoundHandler, errorHandler } = require("./middlewares");
const router = require("./routes/paste");

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

app.use("/api", router);
app.use(notFoundHandler);
app.use(errorHandler);

(async () => {
    try {
        await mongoose.connect(cfg.MONGO.URI);
        console.log("Connected to MongoDB");
        app.listen(cfg.BASE.PORT, cfg.BASE.HOST, () => {
            console.log(`Server listening at ${cfg.BASE.getUrl()}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
})();