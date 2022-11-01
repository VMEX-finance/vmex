import { TypechainConfig } from "./types";

declare module "@nomiclabs/buidler/types" {
  interface BuidlerConfig {
    typechain?: TypechainConfig;
  }
}
