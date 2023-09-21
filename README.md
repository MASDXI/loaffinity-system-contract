# Loaffinity System Contract

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

### Prerequisite

- [node](https://nodejs.org/en) or using [nvm](https://github.com/nvm-sh/nvm) for install
- [yarn](https://yarnpkg.com/)

### Setup Repository

```shell
git clone 
```

```shell
cd loaffinity-system-contract/
```

```shell
yarn install
```

### Command for development

Try running some of the following tasks:

``` shell
npx hardhat help
yarn build 
yarn clean
yarn compile
yarn coverage
yarn size
yarn test
```
### Script for interact with system contract

``` shell
npx hardhat propose_committee --account "<address>" --proposaltype "0 or 1:number" --blocknumber "<blocknumber>" --network "<config_network>"
npx hardhat propose_supply --account "<address>" --amount "<amount>" --proposaltype "0 or 1:number" --blocknumber "<blocknumber>" --network "<config_network>"
npx hardhat grant_proposer --account "<address>" --action "0 or 1:number" --network "<config_network>"
npx hardhat is_committee --account "<address>" --network "<config_network>"
npx hardhat is_proposer --account "<address>" --network "<config_network>"
npx hardhat vote --proposalid "<bytes32string>" --auth "true or false :boolean" --contract "0 or 1:number" --network "<config_network>"
npx hardhat get_proposal_id_by_blocknumber --block "<blocknumber>" --contract "0 or 1:number" --network "<config_network>"
npx hardhat get_proposal_by_blocknumber --block "<blocknumber>" --contract "0 or 1:number" --network "<config_network>"
npx hardhat get_proposal_by_proposalid --proposalid "<bytes32string>" --contract "0 or 1:number" --network "<config_network>"

# Example
npx hardhat propose_committee --account "0x9784e7348e2A4EbDC059e0BCC575D874d96ce88c" --proposaltype 1 --blocknumber 50 --network local
npx hardhat propose_supply --account "0x9784e7348e2A4EbDC059e0BCC575D874d96ce88c" --amount "100000000000000000" --proposaltype 1 --blocknumber 250 --network local
```

### Building System Contract
1. Copy deployedBytecode output after run `yarn build` to consensus/clique/system_contract.go  
2. Copy ABI output after run `yarn build` to consensus/clique/abi.go

### Noted Issue
- Current System Contract Call implementation tx are contain in block and can't trace the event
- Not have MIN,MAX committee size
- Not have MIN,MAX proposer size
- Single Root admin for add and remove proposer.
- Proposer can spamming propose to future block.
- Configuration configuration such as voting delay, voting period, and threshold can't be change after contract initialize.
- Everyblock can contain only one proposal.
- For burn supply smart contract can't preventing account to move fund before proposal execute.
- For proposal that vote not reach to the threshold, off-chain operation should ignore that proposal to preventing execute revert transaction.
