const jwt = require("jsonwebtoken");
require("dotenv").config();

// authorization process:
// 1) see if the token exists
// 2) see if the token is valid
module.exports = function(req, res, next) {
  const token = req.header("x-auth-token");
  console.log("jwt auth token:", token);
  // console.log("res: ", res)
  if (!token) {
    return res
        .status(400)
        .json({error: "no token found, authorization denied"});
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("JWT decoded", decoded);
    req.user = decoded.user; // if the use is not match, a error will be caught
    next();
  } catch (err) {
    return res.status(400).json({error: "token is not valid"});
  }
};
