import { Server } from "socket.io";
import jsonwebtoken from "jsonwebtoken";


import { findSegmentSocket } from '../controllers/segmentation.controller.js';
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

  io.use((socket, next) => {

    if (socket.handshake.auth && socket.handshake.auth.token){
      jsonwebtoken.verify(socket.handshake.auth.token, process.env.JWT_SECRET, (err, decoded) => {

        if (err){
          const err = new Error("not authorized");
          err.data = { content: "'Authentication error'" }; // additional details
          return next(err);
          // return next(new Error('Authentication error'));
        }
        socket.decoded = decoded;
        next();
      });
    }
    else {
      const err = new Error("not authorized");
      err.data = { content: "Please retry later" }; // additional details
      next(err);
    }
  }).on("connection",async (socket) => {
    console.log(`A user with ${socket.id}`);

    socket.on('filter', async (params) => {
      await findSegmentSocket(params,socket,io);

    })

    socket.on("disconnect", () => {
      console.log(`socket ${socket.id} disconnected`);
    })
  })
}



export {sio, connection}
