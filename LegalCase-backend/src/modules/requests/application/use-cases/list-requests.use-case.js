class ListRequestsUseCase {
  constructor(requests) {
    this.requests = requests;
  }

  execute(estado) { return this.requests.findAll(estado); }
}

module.exports = { ListRequestsUseCase };
