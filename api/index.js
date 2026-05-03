import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import v1Routes from "../src/api/v1/routes.js";

const app = express();

// app.use(
//   cors({
//     origin:
//     process.env.NODE_ENV === "production" ? process.env.PRODUCTION_URL : process.env.DEVELOPMENT_URL,
//     credentials: true
//   })
// );

app.use(cors({
  origin: 'https://qcustudentportal.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", v1Routes);

export default app;