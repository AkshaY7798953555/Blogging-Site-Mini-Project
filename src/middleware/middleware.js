const jwt = require("jsonwebtoken");
const authorModel = require("../models/authorModel");

//____________________AUTHENTICATE___________________

const authenticate = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token)
      return res
        .status(403)
        .send({ status: false, message: "token is not present the headers" });

    jwt.verify(token, "project1group9");

    next();
  } catch (error) {
    console.log("Exception error : ", error);
    res
      .status(500)
      .send({ message: "Exception while creating user : " + error });
  }
};
//____________________AUTHERISATION___________________

const authorisation = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token)
      return res.status(403).send({ status: false, message: "token is not present the headers" });
    req.body.authorId = token._id;

    next();
  } catch (error) {
    console.log("Exception error : ", error);
    res.status(500).send({ message: "Exception while creating user : " + error.message });
  }
};

module.exports.authenticate = authenticate;
module.exports.authorisation = authorisation;
