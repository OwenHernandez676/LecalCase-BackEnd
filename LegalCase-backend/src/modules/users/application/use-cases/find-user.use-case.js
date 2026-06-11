const { NotFoundError } = require('../../../../shared/errors/app-error');

class FindUserUseCase {
  constructor(users) {
    this.users = users;
  }

  async execute(id) {
    const u = await this.users.findById(id);
    if (!u) throw new NotFoundError('Usuario no encontrado');
    return u;
  }
}

module.exports = { FindUserUseCase };
