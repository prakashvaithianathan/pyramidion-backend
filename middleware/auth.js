const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader;

  if (token == null) {

    return res.status(401).json({
      message: 'UnAuthorized',
      status: 'fail',
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
    
    if (err) {
      return next(err);
    }
    req.user = result;
    next();
  });
}

function verifyRefreshToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function verifyPassword(pw, hash) {
  console.log(pw, hash);
  let pass = bcrypt.compareSync(pw, hash);
  return pass;

}

function signToken(userId, secretKey, expiresIn, userRole = 'null') {
  return new Promise((resolve, reject) => {
    const options = {
      expiresIn: expiresIn,
      issuer: 'Pyramidion',
      audience: userId,
    };
    jwt.sign({ userId: userId, userRole: userRole }, secretKey, options, (err, token) => {
      if (err) {
        reject({ isError: true, message: 'Invalid operation!' });
      } else {
        resolve(token);
      }
    });
  });
}

function signAccessToken(userId, userRole = 'null') {
  return signToken(
    userId,
    process.env.ACCESS_TOKEN_SECRET,
    process.env.DEV_ACCESS_TOKEN_EXPIRESIN,
    userRole
  );
}

function signRefreshToken(userId, userRole = 'null') {
  return signToken(
    userId,
    process.env.REFRESH_TOKEN_SECRET,
    process.env.DEV_REFRESH_TOKEN_EXPIRESIN,
    userRole
  );
}

module.exports = {
  authenticateToken,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  signToken
};
