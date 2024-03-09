const app = require('./app')
const server = require('http').createServer(app)
const { Server } = require('socket.io')
const { sequelize } = require("./models");

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});


let users = []
io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  socket.on("addUser", (userId) => {
    const isUserExist = users.find((user) => user.userId === userId);
    if (!isUserExist) {
      const user = { userId, socketId: socket.id };
      users.push(user);
      io.emit("getUsers", users);
    }
  });

  socket.on("sendMessage", async  ({ senderId, receiveId, message, conversationId }) => {
    const receiver = users.find(user => user.userId === receiveId);
    const sender = users.find(user => user.userId === senderId);
    const user = await sequelize.models.Users.findByPk(senderId);
    console.log("sender receiver >>>",sender,receiver);
    if (receiver) {
      io.to(receiver.socketId).to(sender.socketId).emit("getMessage", {
        senderId,
        message,
        conversationId,
        receiveId,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName
        }
      })
    } else {
      io.to(sender.socketId).emit("getMessage", {
        senderId,
        message,
        conversationId,
        receiveId,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName
        }
      })
    }
  })

  socket.on("disconnect", () => {
    users = users.filter(user => user.socketId !== socket.id);
    io.emit("getUsers", users);
  })

});


sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    server.listen(2001, () => {
      console.log("Server is running on port 2001");
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database: ", error);
  });
