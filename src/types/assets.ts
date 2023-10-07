import { AssetType } from "lantah-base";
import { Orbitr } from "./../orbitr_api";

export interface AssetRecord extends Orbitr.BaseResponse {
  asset_type: AssetType.credit4 | AssetType.credit12;
  asset_code: string;
  asset_issuer: string;
  paging_token: string;
  accounts: Orbitr.AssetAccounts;
  balances: Orbitr.AssetBalances;
  num_claimable_balances: number;
  num_liquidity_pools: number;
  num_contracts: number;
  num_accounts: number;
  amount: string;
  claimable_balances_amount: string;
  liquidity_pools_amount: string;
  contracts_amount: string;
  flags: Orbitr.Flags;
}
