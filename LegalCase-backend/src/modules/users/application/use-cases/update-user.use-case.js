const { NotFoundError } = require('../../../../shared/errors/app-error');

class UpdateUserUseCase {
  constructor(users) {
    this.users = users;
  }

  async execute(id, dto) {
    const u = await this.users.update(id, dto);
    if (!u) throw new NotFoundError('Usuario no encontrado');
    return u;
  }
}

module.exports = { UpdateUserUseCase };
