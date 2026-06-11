class ListUsersUseCase {
  constructor(users) {
    this.users = users;
  }

  execute(rol) { return this.users.findAll(rol ? { rol } : undefined); }
}

module.exports = { ListUsersUseCase };
