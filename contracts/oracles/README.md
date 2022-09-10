#VMEX LP Oracles

### This repo contains the oracles used for getting an LP price on-chain for the VMEX protocol

To use the oracles, simply deploy one instance of each, and use price oracles to pass in values to these oracles to return an LP price for the given pool. The oracles accept an array of prices as a parameter as well as an address to the pool, depending on the protocol. The prices can be obtained from any other oracle source, including the ``BaseOracle.sol`` or the ``VmexWrapper.sol`` contracts. The BaseOracle gets a 3 minute TWAPped price from UniV3 pools, and the VmexWrapper will wrap around existing AaveOracle contracts already deployed. 

##### TODO:
	- Potentially fix Convex Oracle manipulation
	- UniV3 Oracle
		- More research on ways to port UniV2 equation to UniV3
		- potential new pricing model for NFT positions based on underlying and potential for fee accumulation
		- potential Chainlink custom oracle to get total NFT supply
