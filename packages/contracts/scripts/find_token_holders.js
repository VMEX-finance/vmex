const fs = require('fs')

const getAllUsersQuery = (first, skip) => {
    return `{
        users(first: ${first}, skip: ${skip}) {
            id
            reserves {
                reserve {
                    underlyingAsset
                    tranche{id}
                    aToken{id}
                }
                aTokenBalanceHistory(orderBy: timestamp, orderDirection: desc, first: 1) {
                    scaledATokenBalance
                    index
                    timestamp
                }
            }
        }
    }`;
}

const LP_TRANCHE = 0
const BASE_TRANCHE = 1
const LSD_TRANCHE = 2

const TOKEN_WETH = '0x4200000000000000000000000000000000000006';
const TOKEN_USDC = '0x7F5c764cBc14f9669B88837ca1490cCa17c31607';
const TOKEN_WSTETH = '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb';

const main = async () => {
    const query = getAllUsersQuery(100, 0);
    const response = await fetch('https://api.thegraph.com/subgraphs/name/fico23/vmex-optimism-test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ query })
    });

    const data = await response.json();
    console.log(JSON.stringify(data));
    console.log(data.data.users.length)

    const usdcLPTrancheUsers = {
        aToken: '',
        users: []
    }
    const wethLPTrancheUsers = {
        aToken: '',
        users: []
    }
    const wethLSDTrancheUsers = {
        aToken: '',
        users: []
    }
    const wstethLPTrancheUsers = {
        aToken: '',
        users: []
    }

    for(const user of data.data.users) {
        let x = user.reserves.find(x => x.reserve.underlyingAsset.toLowerCase() === TOKEN_USDC.toLowerCase() && x.reserve.tranche.id.endsWith(`:${LP_TRANCHE}`))
        if (x && x.aTokenBalanceHistory[0] && x.aTokenBalanceHistory[0].scaledATokenBalance !== '0'){
            usdcLPTrancheUsers.users.push(user.id)
            usdcLPTrancheUsers.aToken = x.reserve.aToken.id
        }

        x = user.reserves.find(x => x.reserve.underlyingAsset.toLowerCase() === TOKEN_WETH.toLowerCase() && x.reserve.tranche.id.endsWith(`:${LP_TRANCHE}`))
        if (x && x.aTokenBalanceHistory[0] && x.aTokenBalanceHistory[0].scaledATokenBalance !== '0'){
            wethLPTrancheUsers.users.push(user.id)
            wethLPTrancheUsers.aToken = x.reserve.aToken.id
        }

        x = user.reserves.find(x => x.reserve.underlyingAsset.toLowerCase() === TOKEN_WETH.toLowerCase() && x.reserve.tranche.id.endsWith(`:${LSD_TRANCHE}`))
        if (x && x.aTokenBalanceHistory[0] && x.aTokenBalanceHistory[0].scaledATokenBalance !== '0'){
            wethLSDTrancheUsers.users.push(user.id)
            wethLSDTrancheUsers.aToken = x.reserve.aToken.id
        }

        x = user.reserves.find(x => x.reserve.underlyingAsset.toLowerCase() === TOKEN_WSTETH.toLowerCase() && x.reserve.tranche.id.endsWith(`:${LP_TRANCHE}`))
        if (x && x.aTokenBalanceHistory[0]  && x.aTokenBalanceHistory[0].scaledATokenBalance !== '0'){
            wstethLPTrancheUsers.users.push(user.id)
            wstethLPTrancheUsers.aToken = x.reserve.aToken.id
        }
    }
    console.log(usdcLPTrancheUsers.users.length)
    console.log(wethLPTrancheUsers.users.length)
    console.log(wethLSDTrancheUsers.users.length)
    console.log(wstethLPTrancheUsers.users.length)

    fs.writeFileSync('usdcLPTrancheUsers.json', JSON.stringify(usdcLPTrancheUsers))
    fs.writeFileSync('wethLPTrancheUsers.json', JSON.stringify(wethLPTrancheUsers))
    fs.writeFileSync('wethLSDTrancheUsers.json', JSON.stringify(wethLSDTrancheUsers))
    fs.writeFileSync('wstethLPTrancheUsers.json', JSON.stringify(wstethLPTrancheUsers))

}

main();
