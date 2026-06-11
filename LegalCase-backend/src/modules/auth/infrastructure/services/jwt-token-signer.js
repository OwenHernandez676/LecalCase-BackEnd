const jwt = require('jsonwebtoken');

/** Adaptador del puerto TokenSigner usando jsonwebtoken. */
class JwtTokenSigner {
  /**
   * @param {string} secret
   * @param {string} expiresIn
   */
  constructor(secret, expiresIn) {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(payload) {
    return Promise.resolve(jwt.sign(payload, this.secret, { expiresIn: this.expiresIn }));
  }

  verify(token) {
    return Promise.resolve(jwt.verify(token, this.secret));
  }
}

module.exports = { JwtTokenSigner };
