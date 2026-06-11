const bcrypt = require('bcryptjs');

/** Adaptador del puerto PasswordHasher usando bcryptjs. */
class BcryptPasswordHasher {
  hash(plain) { return bcrypt.hash(plain, 10); }
  compare(plain, hash) { return bcrypt.compare(plain, hash); }
}

module.exports = { BcryptPasswordHasher };
