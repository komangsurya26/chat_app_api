const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/auth.routes");
const chatRouter = require("./routes/chat.routes");


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


//!REST API 

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(userRouter);
app.use(chatRouter);

app.use((req, res) => {
  return res.status(404).json("Route not found");
})


module.exports = app
