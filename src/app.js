import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from 'passport';
import session from 'express-session';
import './utils/passportconfig.js'; // Adjust the path to your passportConfig.js
import authRoutes from './routes/auth.routes.js'

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())

app.use(express.urlencoded({extended: true}))

app.use(express.static("public"))

app.use(cookieParser())

import userRouter from "./routes/user.routes.js"
import startupRouter from "./routes/startup.routes.js"
import investorRouter from "./routes/investor.routes.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/startup", startupRouter)
app.use("/api/v1/investor",investorRouter);

app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: false,
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  app.use(authRoutes);

import paymentRoute from "./routes/payment.routes.js";

app.use("/api/v1/payment", paymentRoute);

export {app};