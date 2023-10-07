import { AssetType } from "lantah-base";
import { Orbitr } from "./../orbitr_api";

export interface OfferAsset {
  asset_type: AssetType;
  asset_code?: string;
  asset_issuer?: string;
}

export interface OfferRecord extends Orbitr.BaseResponse {
  id: number | string;
  paging_token: string;
  seller: string;
  selling: OfferAsset;
  buying: OfferAsset;
  amount: string;
  price_r: Orbitr.PriceRShorthand;
  price: string;
  last_modified_ledger: number;
  last_modified_time: string;
  sponsor?: string;
}
