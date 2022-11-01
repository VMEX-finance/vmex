export declare const SUPPORTED_ETHERSCAN_NETWORKS: string[];
export declare const verifyEtherscanContract: (address: string, constructorArguments: (string | string[])[], libraries?: string) => Promise<void>;
export declare const runTaskWithRetry: (task: string, params: any, times: number, msDelay: number, cleanup: () => void) => Promise<void>;
export declare const checkVerification: () => void;
