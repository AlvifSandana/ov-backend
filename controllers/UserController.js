import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Register new user.
 * @param {*} req 
 * @param {*} res 
 */
export const Register = async(req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  // validate password
  if (password !== confirmPassword) return res.status(400).json({ messsage: "Password not match!", data: {} });
  // create salt
  const salt = await bcrypt.genSalt();
  // create hash from password
  const hasedPassword = await bcrypt.hash(password, salt);
  // create new user data
  try {
    Users.findOne({
      where: {
        email: email
      }
    }).then((user) => {
      // validate email
      if (user != null) {
        return res.status(406).json({
          message: "Registration failed! Please choose another email.",
          data: {
            email: email
          }
        });
      } else {
        // create validated user data
        Users.create({
          name: name,
          email: email,
          password: hasedPassword
        }).then((user) => {
          return res.status(201).json({
            message: "Registration success!",
            data: user
          });
        }).catch((reason) => {
          return res.status(500).json({
            message: reason,
            data: {}
          });
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error,
      data: {}
    });
  }
}

/**
 * User login.
 * @param {*} req 
 * @param {*} res 
 */
export const Login = async(req, res) => {
  const { email, password } = req.body;
  try {
    // get user data
    const user = Users.findOne({
      where: {
        email: email
      }
    }).then((user) => {
      // validate result
      if (user != null) {
        // validate pasword
        const password_match = bcrypt.compare(password, user.password);
        if (!password_match) return res.status(400).json({ message: "Wrong password!", data: {} });
        // create access token
        const userId = user.id;
        const userName = user.name;
        const userEmail = user.email;
        const access_token = jwt.sign({ userId, userName, userEmail }, process.env.ACCESS_TOKEN_SECRET);
        // create refresh token
        const refresh_token = jwt.sign({ userId, userName, userEmail }, process.env.REFRESH_TOKEN_SECRET);
        // add refresh token to user data
        Users.update({ refresh_token: refresh_token }, {
          where: {
            id: userId
          }
        }).then((result) => {
          if (result != null) {
            // set refresh token to httpOnly cookie
            res.cookie('refreshToken', refresh_token, {
              httpOnly: true,
              maxAge: 24 * 60 * 60 * 1000
            });
            res.status(200).json({
              message: "Login success!",
              data: {
                access_token: access_token
              }
            });
          }
        }).catch((reason) => {
          return res.status(400).json({
            message: reason,
            data: {}
          });
        });
      }
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error,
      data: {}
    });
  }
}

/**
 * User logout. Update refresh token and clear it.
 * @param {*} req 
 * @param {*} res 
 */
export const Logout = async(req, res) => {
  // get refresh token from cookies
  const refresh_token = req.cookies.refreshToken;
  // validate refresh token
  if(!refresh_token) return res.sendStatus(204);
  // get user by refresh token
  Users.findOne({
    where: {
      refresh_token: refresh_token
    }
  }).then((user) => {
    // validate user data
    if(!user) return res.sendStatus(204);
    // update refresh token to null
    Users.update({refresh_token: null}, {
      where: {
        id: user.id
      }
    }).then((result) => {
      res.clearCookie('refreshToken');
      return res.sendStatus(200);
    });
  }).catch((reason) => {
    console.log(reason);
    return res.status(500).json({
      message: reason,
      data:{}
    });
  });
}