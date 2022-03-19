// const socketIo = require("socket.io")
import { Server } from "socket.io";

const sio = (server) => {
  return new Server(server,{
    transport: ["polling"],
    allowEIO3: true,
    cors: {
      origin: "*",
    },
  })
}

const connection = (io) => {
  io.on("connection", (socket) => {
    console.log(`A user with ${socket.id} is connected`);

    socket.on("message", (message) => {
      io.emit("response", "aqaaaaaaaaaaa")
      console.log(`message from ${socket.id} : ${message}`);
      console.log(JSON.stringify(message, null, 2));
    })



    socket.on("disconnect", () => {
      console.log(`socket ${socket.id} disconnected`);
    })
  })
}

export {sio, connection}
