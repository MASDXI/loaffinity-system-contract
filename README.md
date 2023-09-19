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

### Command

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
### Building System Contract
1. Copy deployedBytecode output after run `yarn build` to consensus/clique/system_contract.go  
2. Copy ABI output after run `yarn build` to consensus/clique/abi.go

### Noted Issue
- Not have MIN,MAX committee size
- Not have MIN,MAX proposer size
- Single Root admin for add and remove proposer.
- Proposer can spamming propose to future block.
- Configuration configuration such as voting delay, voting period, and threshold can't be change after contract initialize.
- Everyblock can contain only one proposal.
- For burn supply smart contract can't preventing account to move fund before proposal execute.
- For proposal that vote not reach to the threshold, off-chain operation should ignore that proposal to preventing execute revert transaction.
