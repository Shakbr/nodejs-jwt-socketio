// const express = require("express");
import express from 'express'
import cors from 'cors'
// const cors = require("cors");
// const colors = require("colors").enable();
import 'colors'
const app = express();
// const socketUtils = require("./app/utils/socketUtils");
import * as socketUtils from "./app/utils/socketUtils.js"
// const dotenv = require("dotenv").config();
import 'dotenv/config'


// const db = require("./app/models");
import db from './app/models/index.js'
import * as http from 'http';

// const { socketIOMiddleware } = require('./app/middleware/socketIO');

const Role = db.role;

let corsOptions = {
  origin: "http://localhost:8081"
};

const server = http.createServer(app);
const io = socketUtils.sio(server);
socketUtils.connection(io);

app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to JWT AUTH application." });
});

// colors.enable();


// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Db');
//   initial();
// });

function initial() {
  Role.create({
    id: 1,
    name: "user"
  });

  Role.create({
    id: 2,
    name: "moderator"
  });

  Role.create({
    id: 3,
    name: "admin"
  });
}

const socketIOMiddleware = (req, res, next) => {
  req.io = io;

  next();
}

app.use("/api/v1/hello", socketIOMiddleware, (req, res) => {
  req.io.emit("message", `Hello, ${req.originalUrl}`)
  res.send("hello world!!!")
})

// routes
import authRoutes from './app/routes/auth.routes.js'
authRoutes(app)
import userRoutes from './app/routes/user.routes.js'
userRoutes(app)
// require('./app/routes/auth.routes')(app);
// require('./app/routes/user.routes')(app);
// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`.bgBlue);
});
