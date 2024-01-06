# Loaffinity System Contract

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

### Prerequisite

- [node](https://nodejs.org/en) or using [nvm](https://github.com/nvm-sh/nvm) for install
- [yarn](https://yarnpkg.com/)

### Setup Repository

```shell
git clone <repository>
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
0x57b009ce2ed43ece2fc8f9cedc972782f9f16663c06389009da18e252b5472d2
# Example
npx hardhat propose_committee --account "0x9784e7348e2A4EbDC059e0BCC575D874d96ce88c" --proposaltype 1 --blocknumber 50 --network local
npx hardhat propose_supply --account "0x9784e7348e2A4EbDC059e0BCC575D874d96ce88c" --amount "100000000000000000" --proposaltype 1 --blocknumber 250 --network local
```

### Building System Contract
1. Make sure you have set the value in `.env` file
2. Using command `yarn compile` to compile smart contract
3. Copy deployedBytecode output after run `yarn build` to and place to genesis.json
4. when start the network if wanted to activate the contract you should using hardtask activate contract from example above

### Noted Issue
- Proposer have majority and right to create proposal by their own, avoid Proposer spamming proposal to future block potentially DoS contract.
- Single Root admin for add and remove proposer.
- Configuration configuration such as voting delay, voting period, and threshold can't be change after contract initialize.
- Everyblock can contain only one proposal.

### TODO
- [] refactoring test
- [] update readme and documentation
