function buildTransaction(destination, operations = [], builderOpts = {}) {
  let txBuilderOpts = {
    fee: 100,
    networkPassphrase: LantahSdk.Networks.TESTNET,
    v1: true,
  };
  Object.assign(txBuilderOpts, builderOpts);
  let keypair = LantahSdk.Keypair.random();
  let account = new LantahSdk.Account(keypair.publicKey(), "56199647068161");
  let transaction = new LantahSdk.TransactionBuilder(
    account,
    txBuilderOpts,
  ).addOperation(
    LantahSdk.Operation.payment({
      destination: destination,
      asset: LantahSdk.Asset.native(),
      amount: "100.50",
    }),
  );

  operations.forEach((op) => (transaction = transaction.addOperation(op)));

  transaction = transaction.setTimeout(LantahSdk.TimeoutInfinite).build();
  transaction.sign(keypair);

  if (builderOpts.feeBump) {
    return LantahSdk.TransactionBuilder.buildFeeBumpTransaction(
      keypair,
      "200",
      transaction,
      txBuilderOpts.networkPassphrase,
    );
  } else {
    return transaction;
  }
}

function buildAccount(id, data = {}) {
  return {
    _links: {
      data: {
        href: `https://orbitr-testnet.lantah.network/accounts/${id}/data/{key}`,
        templated: true,
      },
    },
    id: id,
    account_id: id,
    sequence: "3298702387052545",
    subentry_count: 1,
    last_modified_ledger: 768061,
    thresholds: {
      low_threshold: 0,
      med_threshold: 0,
      high_threshold: 0,
    },
    flags: {
      auth_required: false,
      auth_revocable: false,
      auth_immutable: false,
    },
    balances: [
      {
        balance: "9999.9999900",
        buying_liabilities: "0.0000000",
        selling_liabilities: "0.0000000",
        asset_type: "native",
      },
    ],
    signers: [
      {
        weight: 1,
        key: id,
        type: "ed25519_public_key",
      },
    ],
    data: data,
  };
}

function mockAccountRequest(axiosMock, id, status, data = {}) {
  let response;

  switch (status) {
    case 404:
      response = Promise.reject({
        response: { status: 404, statusText: "NotFound", data: {} },
      });
      break;
    case 400:
      response = Promise.reject({
        response: { status: 400, statusText: "BadRequestError", data: {} },
      });
      break;
    default:
      response = Promise.resolve({ data: buildAccount(id, data) });
      break;
  }

  axiosMock
    .expects("get")
    .withArgs(sinon.match(`https://orbitr-testnet.lantah.network/accounts/${id}`))
    .returns(response)
    .once();
}

describe("server.js check-memo-required", function () {
  beforeEach(function () {
    this.server = new LantahSdk.Server("https://orbitr-testnet.lantah.network");
    this.axiosMock = sinon.mock(OrbitrAxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("fails if memo is required", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(this.axiosMock, accountId, 200, {
      "config.memo_required": "MQ==",
    });
    let transaction = buildTransaction(accountId);

    this.server
      .checkMemoRequired(transaction)
      .then(
        function () {
          expect.fail("promise should have failed");
        },
        function (err) {
          expect(err).to.be.instanceOf(LantahSdk.AccountRequiresMemoError);
          expect(err.accountId).to.eq(accountId);
          expect(err.operationIndex).to.eq(0);
          done();
        },
      )
      .catch(function (err) {
        done(err);
      });
  });

  it("fee bump - fails if memo is required", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(this.axiosMock, accountId, 200, {
      "config.memo_required": "MQ==",
    });
    let transaction = buildTransaction(accountId, [], { feeBump: true });

    this.server
      .checkMemoRequired(transaction)
      .then(
        function () {
          expect.fail("promise should have failed");
        },
        function (err) {
          expect(err).to.be.instanceOf(LantahSdk.AccountRequiresMemoError);
          expect(err.accountId).to.eq(accountId);
          expect(err.operationIndex).to.eq(0);
          done();
        },
      )
      .catch(function (err) {
        done(err);
      });
  });

  it("returns false if account doesn't exist", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(this.axiosMock, accountId, 404, {});
    let transaction = buildTransaction(accountId);

    this.server
      .checkMemoRequired(transaction)
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("returns false if data field is not present", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(this.axiosMock, accountId, 200, {});
    let transaction = buildTransaction(accountId);

    this.server
      .checkMemoRequired(transaction)
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("returns err with client errors", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(this.axiosMock, accountId, 400, {});
    let transaction = buildTransaction(accountId);

    this.server
      .checkMemoRequired(transaction)
      .then(
        function () {
          expect.fail("promise should have failed");
        },
        function (err) {
          expect(err).to.be.instanceOf(LantahSdk.NetworkError);
          done();
        },
      )
      .catch(function (err) {
        done(err);
      });
  });

  it("doesn't repeat account check if the destination is more than once", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(this.axiosMock, accountId, 200, {});

    let operations = [
      LantahSdk.Operation.payment({
        destination: accountId,
        asset: LantahSdk.Asset.native(),
        amount: "100.50",
      }),
    ];

    let transaction = buildTransaction(accountId, operations);

    this.server
      .checkMemoRequired(transaction)
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("other operations", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(this.axiosMock, accountId, 200, {});

    const destinations = [
      "GASGNGGXDNJE5C2O7LDCATIVYSSTZKB24SHYS6F4RQT4M4IGNYXB4TIV",
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    ];

    const usd = new LantahSdk.Asset(
      "USD",
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
    );
    const eur = new LantahSdk.Asset(
      "EUR",
      "GDTNXRLOJD2YEBPKK7KCMR7J33AAG5VZXHAJTHIG736D6LVEFLLLKPDL",
    );
    const liquidityPoolAsset = new LantahSdk.LiquidityPoolAsset(eur, usd, 30);

    let operations = [
      LantahSdk.Operation.accountMerge({
        destination: destinations[0],
      }),
      LantahSdk.Operation.pathPaymentStrictReceive({
        sendAsset: LantahSdk.Asset.native(),
        sendMax: "5.0000000",
        destination: destinations[1],
        destAsset: LantahSdk.Asset.native(),
        destAmount: "5.50",
        path: [usd, eur],
      }),
      LantahSdk.Operation.pathPaymentStrictSend({
        sendAsset: LantahSdk.Asset.native(),
        sendAmount: "5.0000000",
        destination: destinations[2],
        destAsset: LantahSdk.Asset.native(),
        destMin: "5.50",
        path: [usd, eur],
      }),
      LantahSdk.Operation.changeTrust({
        asset: usd,
      }),
      LantahSdk.Operation.changeTrust({
        asset: liquidityPoolAsset,
      }),
    ];

    destinations.forEach((d) => mockAccountRequest(this.axiosMock, d, 200, {}));

    let transaction = buildTransaction(accountId, operations);

    this.server
      .checkMemoRequired(transaction)
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
  it("checks for memo required by default", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    let memo = LantahSdk.Memo.text("42");
    let transaction = buildTransaction(accountId, [], { memo });
    this.server
      .checkMemoRequired(transaction)
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
});
