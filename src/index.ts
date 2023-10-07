// tslint:disable-next-line: no-reference
/// <reference path="../types/dom-monkeypatch.d.ts" />

/* tslint:disable:no-var-requires */
const version = require("../package.json").version;

// Expose all types
export * from "./orbitr_api";
export * from "./server_api";

// lantah-sdk classes to expose
export * from "./account_response";
export * from "./errors";
export { Config } from "./config";
export { Server } from "./server";
export {
  FederationServer,
  FEDERATION_RESPONSE_MAX_SIZE
} from "./federation_server";
export {
  LantahTomlResolver,
  STELLAR_TOML_MAX_SIZE
} from "./stellar_toml_resolver";
export {
  default as OrbitrAxiosClient,
  SERVER_TIME_MAP,
  getCurrentServerTime
} from "./orbitr_axios_client";
export * from "./utils";

// expose classes and functions from lantah-base
export * from "lantah-base";

export { version };

export default module.exports;
