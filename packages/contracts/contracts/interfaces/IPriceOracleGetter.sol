// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

/**
 * @title IPriceOracleGetter interface
 * @notice Interface for the Aave price oracle.
 **/
import "hardhat/console.sol";
abstract contract IPriceOracleGetter {
    struct TimePrice {
        uint256 timestamp;
        uint256 cumulatedPrice;
        uint256 currentPrice;
    }

    mapping(address=>mapping(uint16=>TimePrice)) public cumulatedPrices; //asset => index => price
    //store most recent index to the most recently updated cumulatedPrice
    //store last index. 
    mapping(address =>uint16) public recent; //points to the most recent index
    mapping(address =>uint16) public last;//points to the last index
    mapping(address =>uint16) public numPrices;

    constructor(){
        //loop through all assets, set timestamp to current block's timestamp
        //or have a genesis timestamp, this genesis timestamp updates every time 
    }

    /**
     * @dev returns the asset price in ETH
     * @param asset the address of the asset
     * @return the ETH price of the asset
     **/
    function getAssetPrice(address asset) external virtual view returns (uint256);

    function updateTWAP(address asset) external virtual;

    function getAssetTWAPPrice(address asset) external view virtual returns (uint256);

    function _updateState(address asset, uint256 currentPrice) internal {
            // console.log("updateState currentPrice: ",currentPrice);
        if(numPrices[asset]!=0){
            uint16 prev = recent[asset];
            //if this index is past 24 hours ago, don't use, just set cumulatedPrice to zero? Doing so is actually the same as keeping the below calculation cause the last pointer is set as this pointer
            if(recent[asset]==type(uint16).max)
                recent[asset] =0;
            else
                recent[asset]+=1;//handle going back around in circle

            //this is a right ended Riemann sum. In times of rising prices, it overestimates the average, and when prices are lowering, it underestimates
            //can use trapezoid rule instead by taking the average between the current price and the previous price
            //same as midpoint rule since discrete time sampling
            uint256 averageInterpolatedPrice = (cumulatedPrices[asset][prev].currentPrice + currentPrice)/2;
            cumulatedPrices[asset][recent[asset]].cumulatedPrice = cumulatedPrices[asset][prev].cumulatedPrice + (block.timestamp-cumulatedPrices[asset][prev].timestamp) * averageInterpolatedPrice;
            // console.log("updateState cumulatedPrices[asset][prev].cumulatedPrice: ",cumulatedPrices[asset][prev].cumulatedPrice);
            // console.log("updateState (block.timestamp-cumulatedPrices[asset][prev].timestamp): ",(block.timestamp-cumulatedPrices[asset][prev].timestamp));
            // console.log("updateState new cumulatedPrices.cumulatedPrice: ",cumulatedPrices[asset][recent[asset]].cumulatedPrice);
            
        }
        else{
            cumulatedPrices[asset][recent[asset]].cumulatedPrice = 0;
            
        }        
        cumulatedPrices[asset][recent[asset]].currentPrice = currentPrice;
        cumulatedPrices[asset][recent[asset]].timestamp = block.timestamp;
        // console.log("updateState new cumulatedPrices.timestamp: ",cumulatedPrices[asset][recent[asset]].timestamp);
        numPrices[asset]+=1;

        //get rid of outdated prices. Average O(1)
        //only get rid of them if there are stuff to get rid of
        while(numPrices[asset]>0 && (block.timestamp - cumulatedPrices[asset][last[asset]].timestamp) > 1 days){
            // console.log("updateState removing last: ",last[asset]);
            if(last[asset]==type(uint16).max){
                last[asset] = 0;
            }
            else{
                last[asset] +=1;
            }
            numPrices[asset]-=1;
        }
    }

    function _getAssetTWAPPrice(address asset, uint256 currentPrice) internal view returns (uint256){
            // console.log("_getAssetTWAPPrice currentPrice: ",currentPrice);
        if(cumulatedPrices[asset][recent[asset]].currentPrice == 0){ //this check shouldn't be needed since state update happens before this is called
            //this is only called in the very beginning before recent[asset] is populated
            return currentPrice;
        }
        uint256 averageInterpolatedPrice = (cumulatedPrices[asset][recent[asset]].currentPrice + currentPrice)/2;
        // console.log("_getAssetTWAPPrice averageInterpolatedPrice: ",averageInterpolatedPrice);
        uint16 tmpLast = last[asset];
        uint16 tmpNumPrices = numPrices[asset];
        //get rid of outdated prices. Average O(1)
        while(tmpNumPrices>0 && (block.timestamp - cumulatedPrices[asset][tmpLast].timestamp) > 1 days){
            console.log("updateState removing tmpLast: ",tmpLast);
            if(tmpLast==type(uint16).max){
                tmpLast = 0;
            }
            else{
                tmpLast +=1;
            }
            tmpNumPrices-=1;
        }

        //if there hasn't been an update in a long time, then this may be the average over a big interval and not reflect what the price has been hovering around for the last couple days
        //better to be conservative still and return the average.
        if(tmpNumPrices==0)//if 0, that means that not enough data to calculate, only one update in the last 24 hours.
            return averageInterpolatedPrice;

        //worst case, if not updated long enough, or all updates are close to current price, average will be current price
        //also if a lot of updates happened a day ago, calling this now will interpolate the current price as the price through that entire time so it will weigh current price more that prevoius prices
        if(block.timestamp - cumulatedPrices[asset][tmpLast].timestamp == 0){ //to avoid divide by zero error. This happens when we update state and immediately try to read twap price, and it is the first price in a 24 hour span
            return averageInterpolatedPrice;
        }
        //no state update, but temporarily calculate what the cumulatedPrice would be if there was an update. Note that prev is recent[asset]
        uint256 tmpCumulatedPrices = cumulatedPrices[asset][recent[asset]].cumulatedPrice + (block.timestamp-cumulatedPrices[asset][recent[asset]].timestamp) * averageInterpolatedPrice;
        // console.log("_getAssetTWAPPrice tmpCumulatedPrices: ",tmpCumulatedPrices);
        // console.log("_getAssetTWAPPrice cumulatedPrices[asset][tmpLast].cumulatedPrice: ",cumulatedPrices[asset][tmpLast].cumulatedPrice);
        // console.log("_getAssetTWAPPrice block.timestamp: ",block.timestamp);
        // console.log("_getAssetTWAPPrice cumulatedPrices[asset][tmpLast].timestamp: ",cumulatedPrices[asset][tmpLast].timestamp);
        return (tmpCumulatedPrices - cumulatedPrices[asset][tmpLast].cumulatedPrice)/(block.timestamp - cumulatedPrices[asset][tmpLast].timestamp);
    }

}
