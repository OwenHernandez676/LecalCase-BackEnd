const { NotFoundError } = require('../../../../shared/errors/app-error');

class FindCaseUseCase {
  constructor(cases) {
    this.cases = cases;
  }

  async execute(id) {
    const c = await this.cases.findById(id);
    if (!c) throw new NotFoundError('Expediente no encontrado');
    return c;
  }
}

module.exports = { FindCaseUseCase };
