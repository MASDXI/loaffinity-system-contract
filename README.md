# Loaffinity System Smart Contract

Loaffinity system smart contract is smart contract pre-loaded at genesis block of the blockchain network, system smart contract serve specifiy function to extend capibities of core blockchain.  
It's basically adopt pattern like [open governance](https://polkadot.network/features/opengov/) some parameter on blockchain can be changed directly through the smart contract level without requiring to do `HARDFORK` for update the network parameter.

### Prerequisite

- [node](https://nodejs.org/en) or using [nvm](https://github.com/nvm-sh/nvm) for install
- [yarn](https://yarnpkg.com/)

### Setup Repository
You can set up repository on your local development envirotment following step below.  
Clone repository to your machine
```shell
# github repository
git clone https://github.com/nextclan/loaffinity-system-contract.git
# gitlab repository
git clone https://gitlab.com/nextclan/loaffinity-system-contract.git
```
Change work directory
```shell
cd loaffinity-system-contract/
```
Installing dependencies
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
you can see what action perform in each command in `./package.json`


### Script for interact with system smart contract
``` shell
# Initialized System Smart Contract
npx hardhat initialized --network "dev"
npx hardhat initialized --network "testnet"
npx hardaht initialized --network "mainnet"

# Proposal Command
npx hardhat get_proposal_by_blocknumber --help
npx hardhat get_proposal_by_proposalid --help
npx hardhat get_proposal_id_by_blocknumber --help

# Propose Command
npx hardhat propose_committee --help
npx hardhat propose_supply --help

# Grant Command
npx hardhat grant_agent --help
npx hardhat grant_proposer --help
npx hardhat grant_merchant --help
npx hardhat grant_serviceprovider --help

# Role Command
npx hardhat is_committee --help
npx hardhat is_proposer --help
npx hardhat is_agent --help

# Proxy Command
npx hardhat serviceprovider --help // implementation contract change
npx hardhat gaspriceoracle --help  // implementation contract change
npx hardhat gaspriceoracle --help  // update ratio/threshold
```
More detail about task command can found [here](./docs/task.md)

### Script for deploy contract

```
yarn deploy:contract:gaspriceoracle --network <network>
yarn deploy:contract:serviceprovider --network <network>
```
More detail about deployment command can found [here](./docs/deployment.md)

### Building System Smart Contract
1. Make sure you have set the value in `.env` file
2. Using command `yarn compile` to compile smart contract valid initalizer will be auto generate from `Intializer.sol.template`
3. Copy deployedBytecode output after run `yarn compile` or `yarn compile` and place to your `genesis.json`
4. when start the network if wanted to activate the contract you should using hardhat task activate contract from example above

### Noted Issue and Risk Appetite
- Proposer have majority and right to create proposal by their own, avoid Proposer spamming proposal to future block potentially DoS contract.
- Single Root admin for add and remove proposer.
- Configuration configuration such as voting delay, voting period, and threshold can't be change after contract initialize.
- Everyblock can contain only one proposal at that time.
- System Smart Contract not use storage upgrade cause to avoid storage corrupt and meke system smart contract unusable and breaking entrie network.

### Rational
1. System Smart Contract following the [EIP-1352](https://eips.ethereum.org/EIPS/eip-1352)  
    | System Smart Contract         | Reserve Address                              |
    |-------------------------------|--------------------------------------------- |
    | `CommitteeContract`           | `0x0000000000000000000000000000000000000776` |
    | `TreasuryContract`            | `0x0000000000000000000000000000000000000777` |
    | `GasPriceOracleProxy`         | `0x0000000000000000000000000000000000000778` |
    | `ServiceProviderProxy`        | `0x0000000000000000000000000000000000000779` |
    | `TransactionFeeDistributor`   | `0x0000000000000000000000000000000000000780` |
    ##### ** `TransactionFeeDistributor` system smart contract not implemented yet
2. System Smart Contract Implementaion of `GasPriceOracleProxy` and `ServiceProviderProxy` can be upgrade using proxy pattern see [interface](./docs/proxyinterface.md)
3. System Smart Contract proposal are not rely on `block.timestamp` see [proposal behavior](./docs/proposal.md/#proposal-behavior)

### TODO
- [] refactor limit root admin valid till given block height `n`
- [] refactor implementation into proxy pattern
- [] refactor hardhat deploy script
- [] refactor hardhat task script
- [] update readme and documentation
