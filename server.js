const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const connectDB = require("./config/db");
const dentists = require("./routes/dentists");
const auth = require("./routes/auth");
const appointments = require("./routes/appointments");


dotenv.config({ path: "./config/config.env" });


connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());

const corsOptions = {
  origin: ["https://dentist-booking-system-frontend.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); 


const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100, 
});
app.use(limiter);


const HOST = process.env.HOST || "http://localhost:5050";
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Dentist API",
      version: "1.0.0",
      description: "A simple Express API for managing dentist appointments",
    },
    servers: [{ url: `${HOST}/api/v1` }],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));


app.use("/api/v1/dentists", dentists);
app.use("/api/v1/auth", auth);
app.use("/api/v1/appointments", appointments);


module.exports = app;
