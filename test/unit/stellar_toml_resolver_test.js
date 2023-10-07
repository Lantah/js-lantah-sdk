const http = require("http");

describe("stellar_toml_resolver.js tests", function () {
  beforeEach(function () {
    this.axiosMock = sinon.mock(axios);
    LantahSdk.Config.setDefault();
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  describe("LantahTomlResolver.resolve", function () {
    afterEach(function () {
      LantahSdk.Config.setDefault();
    });

    it("returns lantah.toml object for valid request and lantah.toml file", function (done) {
      this.axiosMock
        .expects("get")
        .withArgs(sinon.match("https://acme.com/.well-known/lantah.toml"))
        .returns(
          Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.stellar.org/federation"
`,
          }),
        );

      LantahSdk.LantahTomlResolver.resolve("acme.com").then((lantahToml) => {
        expect(lantahToml.FEDERATION_SERVER).equals(
          "https://api.stellar.org/federation",
        );
        done();
      });
    });

    it("returns lantah.toml object for valid request and lantah.toml file when allowHttp is `true`", function (done) {
      this.axiosMock
        .expects("get")
        .withArgs(sinon.match("http://acme.com/.well-known/lantah.toml"))
        .returns(
          Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="http://api.stellar.org/federation"
`,
          }),
        );

      LantahSdk.LantahTomlResolver.resolve("acme.com", {
        allowHttp: true,
      }).then((lantahToml) => {
        expect(lantahToml.FEDERATION_SERVER).equals(
          "http://api.stellar.org/federation",
        );
        done();
      });
    });

    it("returns lantah.toml object for valid request and lantah.toml file when global Config.allowHttp flag is set", function (done) {
      LantahSdk.Config.setAllowHttp(true);

      this.axiosMock
        .expects("get")
        .withArgs(sinon.match("http://acme.com/.well-known/lantah.toml"))
        .returns(
          Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="http://api.stellar.org/federation"
`,
          }),
        );

      LantahSdk.LantahTomlResolver.resolve("acme.com").then((lantahToml) => {
        expect(lantahToml.FEDERATION_SERVER).equals(
          "http://api.stellar.org/federation",
        );
        done();
      });
    });

    it("rejects when lantah.toml file is invalid", function (done) {
      this.axiosMock
        .expects("get")
        .withArgs(sinon.match("https://acme.com/.well-known/lantah.toml"))
        .returns(
          Promise.resolve({
            data: `
/#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.stellar.org/federation"
`,
          }),
        );

      LantahSdk.LantahTomlResolver.resolve("acme.com")
        .should.be.rejectedWith(/Parsing error on line/)
        .and.notify(done);
    });

    it("rejects when there was a connection error", function (done) {
      this.axiosMock
        .expects("get")
        .withArgs(sinon.match("https://acme.com/.well-known/lantah.toml"))
        .returns(Promise.reject());

      LantahSdk.LantahTomlResolver.resolve(
        "acme.com",
      ).should.be.rejected.and.notify(done);
    });

    it("fails when response exceeds the limit", function (done) {
      // Unable to create temp server in a browser
      if (typeof window != "undefined") {
        return done();
      }
      var response = Array(LantahSdk.STELLAR_TOML_MAX_SIZE + 10).join("a");
      let tempServer = http
        .createServer((req, res) => {
          res.setHeader("Content-Type", "text/x-toml; charset=UTF-8");
          res.end(response);
        })
        .listen(4444, () => {
          LantahSdk.LantahTomlResolver.resolve("localhost:4444", {
            allowHttp: true,
          })
            .should.be.rejectedWith(
              /lantah.toml file exceeds allowed size of [0-9]+/,
            )
            .notify(done)
            .then(() => tempServer.close());
        });
    });

    it("rejects after given timeout when global Config.timeout flag is set", function (done) {
      LantahSdk.Config.setTimeout(1000);

      // Unable to create temp server in a browser
      if (typeof window != "undefined") {
        return done();
      }

      let tempServer = http
        .createServer((req, res) => {
          setTimeout(() => {}, 10000);
        })
        .listen(4444, () => {
          LantahSdk.LantahTomlResolver.resolve("localhost:4444", {
            allowHttp: true,
          })
            .should.be.rejectedWith(/timeout of 1000ms exceeded/)
            .notify(done)
            .then(() => {
              LantahSdk.Config.setDefault();
              tempServer.close();
            });
        });
    });

    it("rejects after given timeout when timeout specified in LantahTomlResolver opts param", function (done) {
      // Unable to create temp server in a browser
      if (typeof window != "undefined") {
        return done();
      }

      let tempServer = http
        .createServer((req, res) => {
          setTimeout(() => {}, 10000);
        })
        .listen(4444, () => {
          LantahSdk.LantahTomlResolver.resolve("localhost:4444", {
            allowHttp: true,
            timeout: 1000,
          })
            .should.be.rejectedWith(/timeout of 1000ms exceeded/)
            .notify(done)
            .then(() => tempServer.close());
        });
    });
  });
});
