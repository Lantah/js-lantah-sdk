---
title: Overview
---
The JavaScript Stellar SDK facilitates integration with the [Lantah Orbitr API server](https://github.com/lantah/go/tree/master/services/orbitr) and submission of Lantah transactions, either on Node.js or in the browser. It has two main uses: [querying Orbitr](#querying-orbitr) and [building, signing, and submitting transactions to the Lantah network](#building-transactions).

[Building and installing js-lantah-sdk](https://github.com/lantah/js-lantah-sdk)<br>
[Examples of using js-lantah-sdk](./examples.md)

# Querying Orbitr
js-lantah-sdk gives you access to all the endpoints exposed by Orbitr.

## Building requests
js-lantah-sdk uses the [Builder pattern](https://en.wikipedia.org/wiki/Builder_pattern) to create the requests to send
to Orbitr. Starting with a server object, you can chain methods together to generate a query.
(See the [Horizon reference](https://developers.stellar.org/api/) documentation for what methods are possible.)
```js
var LantahSdk = require('lantah-sdk');
var server = new LantahSdk.Server('https://orbitr-testnet.lantah.network');
// get a list of transactions that occurred in ledger 1400
server.transactions()
    .forLedger(1400)
    .call().then(function(r){ console.log(r); });

// get a list of transactions submitted by a particular account
server.transactions()
    .forAccount('GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW')
    .call().then(function(r){ console.log(r); });
```

Once the request is built, it can be invoked with `.call()` or with `.stream()`. `call()` will return a
[promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to the response given by Orbitr.

## Streaming requests
Many requests can be invoked with `stream()`. Instead of returning a promise like `call()` does, `.stream()` will return an `EventSource`.
Orbitr will start sending responses from either the beginning of time or from the point specified with `.cursor()`.
(See the [Horizon reference](https://developers.stellar.org/api/introduction/streaming/) documentation to learn which endpoints support streaming.)

For example, to log instances of transactions from a particular account:

```javascript
var LantahSdk = require('lantah-sdk')
var server = new LantahSdk.Server('https://orbitr-testnet.lantah.network');
var lastCursor=0; // or load where you left off

var txHandler = function (txResponse) {
    console.log(txResponse);
};

var es = server.transactions()
    .forAccount(accountAddress)
    .cursor(lastCursor)
    .stream({
        onmessage: txHandler
    })
```

## Handling responses

### XDR
The transaction endpoints will return some fields in raw [XDR](https://developers.stellar.org/api/introduction/xdr/)
form. You can convert this XDR to JSON using the `.fromXDR()` method.

An example of re-writing the txHandler from above to print the XDR fields as JSON:

```javascript
var txHandler = function (txResponse) {
    console.log( JSON.stringify(LantahSdk.xdr.TransactionEnvelope.fromXDR(txResponse.envelope_xdr, 'base64')) );
    console.log( JSON.stringify(LantahSdk.xdr.TransactionResult.fromXDR(txResponse.result_xdr, 'base64')) );
    console.log( JSON.stringify(LantahSdk.xdr.TransactionMeta.fromXDR(txResponse.result_meta_xdr, 'base64')) );
};

```


### Following links
The [HAL format](https://developers.stellar.org/api/introduction/response-format/) links returned with the Orbitr response are converted into functions you can call on the returned object.
This allows you to simply use `.next()` to page through results. It also makes fetching additional info, as in the following example, easy:

```js
server.payments()
    .limit(1)
    .call()
    .then(function(response){
        // will follow the transactions link returned by Orbitr
        response.records[0].transaction().then(function(txs){
            console.log(txs);
        });
    });
```


# Transactions

## Building transactions

See the [Building Transactions](https://github.com/stellar/js-stellar-base/blob/master/docs/reference/building-transactions.md) guide for information about assembling a transaction.

## Submitting transactions
Once you have built your transaction, you can submit it to the r network with `Server.submitTransaction()`.
```js
const LantahSdk = require('lantah-sdk')
const server = new LantahSdk.Server('https://orbitr-testnet.lantah.network');

(async function main() {
    const account = await server.loadAccount(publicKey);

    /*
        Right now, we have one function that fetches the base fee.
        In the future, we'll have functions that are smarter about suggesting fees,
        e.g.: `fetchCheapFee`, `fetchAverageFee`, `fetchPriorityFee`, etc.
    */
    const fee = await server.fetchBaseFee();

    const transaction = new LantahSdk.TransactionBuilder(account, { fee, networkPassphrase: LantahSdk.Networks.TESTNET })
        .addOperation(
            // this operation funds the new account with XLM
            LantahSdk.Operation.payment({
                destination: "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
                asset: LantahSdk.Asset.native(),
                amount: "2"
            })
        )
        .setTimeout(30)
        .build();

    // sign the transaction
    transaction.sign(LantahSdk.Keypair.fromSecret(secretString));

    try {
        const transactionResult = await server.submitTransaction(transaction);
        console.log(transactionResult);
    } catch (err) {
        console.error(err);
    }
})()
```
