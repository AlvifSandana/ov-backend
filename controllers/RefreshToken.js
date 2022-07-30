import Users from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    await Users.findOne({
      where: {
        refresh_token: refreshToken
      }
    }).then((user) => {
      if (user == null) return res.sendStatus(403);
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if(err) return res.sendStatus(403);
        const userId = user.id;
        const userName = user.name;
        const userEmail = user.email;
        const accessToken = jwt.sign({userId, userName, userEmail}, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: '15s'
        });
        res.status(200).json({
          accessToken
        });
      });
    }).catch((reason) => {
      return res.status(500).json({
        message: reason, 
        data: {}
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error,
      data: {}
    });
  }
}