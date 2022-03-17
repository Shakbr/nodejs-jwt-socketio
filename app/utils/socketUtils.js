// const socketIo = require("socket.io")
import { Server } from "socket.io";

const sio = (server) => {
  return new Server(server, {
    transport: ["polling"],
    cors: {
      origin: "*"
    }
  })
}

const connection = (io) => {
  io.on("connection", (socket) => {
    console.log("A user is connected");

    socket.on("message", (message) => {
      console.log(`message from ${socket.id} : ${message}`);
    })

    socket.on("disconnect", () => {
      console.log(`socket ${socket.id} disconnected`);
    })
  })
}

export {sio, connection}
