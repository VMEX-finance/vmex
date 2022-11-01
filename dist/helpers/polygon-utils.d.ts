import { Contract } from 'ethers/lib/ethers';
export declare const usingPolygon: () => boolean;
export declare const verifyAtPolygon: (id: string, instance: Contract, args: (string | string[])[]) => Promise<void>;
