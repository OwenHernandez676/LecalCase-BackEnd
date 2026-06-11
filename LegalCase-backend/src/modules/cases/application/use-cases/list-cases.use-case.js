class ListCasesUseCase {
  constructor(cases) {
    this.cases = cases;
  }

  execute(filter) { return this.cases.findAll(filter); }
}

module.exports = { ListCasesUseCase };
