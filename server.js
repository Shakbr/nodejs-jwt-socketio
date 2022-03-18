import express from 'express'
import cors from 'cors'
import 'colors'
const app = express();
import * as socketUtils from "./app/utils/socketUtils.js"
import 'dotenv/config'
import { Server } from 'socket.io';

import db from './app/models/index.js'
import * as http from 'http';

const Role = db.role;

// let corsOptions = {
//   origin: "http://localhost:8081"
// };



// FOR SOCKET IO
const server = http.createServer(app);
const io = socketUtils.sio(server);
// const io = new Server(server)
socketUtils.connection(io);

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
}

app.use(cors());
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to JWT AUTH application." });
});



// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Db');
//   initial();
// });

// function initial() {
//   Role.create({
//     id: 1,
//     name: "user"
//   });
//
//   Role.create({
//     id: 2,
//     name: "moderator"
//   });
//
//   Role.create({
//     id: 3,
//     name: "admin"
//   });
// }

const socketIOMiddleware = (req, res, next) => {
  req.io = io;

  next();
}
// //
app.use("/api/v1/hello", socketIOMiddleware, (req, res) => {
  req.io.emit("message", `Hello, ${req.originalUrl}`)
  res.send("hello world!!!")
})


// routes
import authRoutes from './app/routes/auth.routes.js'
authRoutes(app)
import userRoutes from './app/routes/user.routes.js'

userRoutes(app)
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`.bgBlue);
});
