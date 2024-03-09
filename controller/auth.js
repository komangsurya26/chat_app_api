require("dotenv").config();
const {sequelize} = require("../models");
const bycrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

async function Register (req,res) {
    try {
        const { fullName, email, password } = req.body;
    
        //validate email
        const validate = await sequelize.models.Users.findOne({ where: { email } });
        if (validate) {
          return res.status(400).json("Email already exists");
        }
    
        //create user
        const newUser = await sequelize.models.Users.create({
          fullName,
          email,
          password,
        });
    
        //validate
        await newUser.validate();
    
        //hash password
        newUser.password = await bycrypt.hash(newUser.password, 10);
    
        //save
        await newUser.save();
    
        //return
        return res.status(201).json({ success: true });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          return res.status(400).json(error.errors[0].message);
        } else {
          return res.status(500).json(error);
        }
      }
}

async function Login (req,res) {
  try {
    const { email, password } = req.body;

    //validate
    if (!email || !password) {
      return res.status(400).json("Please input email and password");
    }
    const user = await sequelize.models.Users.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json("Email not found");
    }

    //compare
    const compare = await bycrypt.compare(password, user.password);
    if (!compare) {
      return res.status(400).json("Wrong password");
    }

    //create token
    const payload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };
    const token = jwt.sign(payload, process.env.SECRET_JWT, {
      expiresIn: "30d",
    });

    //return
    return res.status(200).json({
      success: true,
      user: payload,
      token,
    });
  } catch (error) {
    console.log(error);
  }
}

async function GetUsers(req, res) {
  try {
    const { userId } = req.params;
    const user = await sequelize.models.Users.findAll({
      where: { id: { [Op.ne]: userId } },
    });
    const userData = Promise.all(
      user.map(async (user) => {
        return {
          user: { id: user.id, email: user.email, fullName: user.fullName },
        };
      })
    );
    return res.status(200).json(await userData);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
    Register, Login, GetUsers
}


