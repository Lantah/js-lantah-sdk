const { SorobanServer } = StellarSdk;

describe("Server#getHealth", function () {
  beforeEach(function () {
    this.server = new SorobanServer(serverUrl);
    this.axiosMock = sinon.mock(SorobanAxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("requests the correct endpoint", function (done) {
    let result = {
      status: "healthy",
    };

    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getHealth",
        params: null,
      })
      .returns(Promise.resolve({ data: { result } }));

    this.server
      .getHealth()
      .then(function (response) {
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
});
