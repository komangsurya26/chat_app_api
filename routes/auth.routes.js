const router = require("express").Router();
const { Register, Login, GetUsers } = require("../controller/auth");

router
  .post("/api/register", Register)
  .post("/api/login", Login)
  .get("/api/users/:userId", GetUsers);

module.exports = router;
