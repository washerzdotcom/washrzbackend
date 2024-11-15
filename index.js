import express from "express";
import "dotenv/config";
import "./database.js";
import authRoutes from "./routes/authRoutes.js";
import riderRoutes from "./routes/riderRoutes.js";
import plantRoutes from "./routes/plantRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import AppError from "./utills/appError.js";
import http from "http";
import cors from "cors";
import os from "os";
import { Server } from "socket.io";
const app = express();
import cookies from "cookie-parser";
const server = http.createServer(app);
app.use(cookies());

app.use(
  cors({
    origin: [
      "https://washrz.vercel.app",
      "http://localhost:3000",
      "https://washrzdotcom.netlify.app",
      "http://localhost:3001",
      "http://dep-washrz-dev.s3-website.ap-south-1.amazonaws.com",
    ],
    methods: "GET, POST, PUT, DELETE, PATCH",
    credentials: true, // Allow credentials (cookies) to be sent with the request
  })
);

console.log(`The total number of CPUs is ${os.cpus().length}`);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://washrz.vercel.app",
      "http://deploy-washrz-frontend.s3-website.ap-south-1.amazonaws.com",
      "https://washrzdotcom.netlify.app",
      "http://dep-washrz-dev.s3-website.ap-south-1.amazonaws.com",
    ],
    credentials: true,
  },
  allowEIO3: true,
});
const addSocketToRequest = (io) => {
  return (req, res, next) => {
    req.socket = io; // Add the socket object to the request
    next();
  };
};
app.get("/heavy", (req, res) => {
  let total = 18;
  for (let i = 0; i < 5000000000; i++) {
    total++;
  }
  res.send(`The result of the CPU intensive task is ${total}\n`);
});

app.get("/test", (req, res) => {
  res.send({
    message: "api is workng",
    code: 200,
  });
});

app.use(express.json());
app.use(addSocketToRequest(io));
app.use("/api/v1", customerRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/rider", riderRoutes);
app.use("/api/v1/plant", plantRoutes);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message ?? "Internal Server error",
  });
});

io.on("connection", (socket) => {
  console.log("hii this is the socket id--->> ", socket.id);
  socket.emit("backendMessage", { message: "a new client connected" });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port: ${process.env.PORT}`);
});
