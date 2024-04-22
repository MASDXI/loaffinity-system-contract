# Loaffinity System Contract

Loaffinity system contract is smart contract pre-loaded at genesis block of the blockchain network, system contract serve specifiy function to extend capibities of core blockchain. it's basically adopt pattern like [open governance](https://polkadot.network/features/opengov/) some parameter on blockchain can be changed directly through the smart contract level without requiring to do `HARDFORK` for update the network parameter.

### Prerequisite

- [node](https://nodejs.org/en) or using [nvm](https://github.com/nvm-sh/nvm) for install
- [yarn](https://yarnpkg.com/)

### Setup Repository

```shell
# github repository
git clone https://github.com/nextclan/loaffinity-system-contract.git
# gitlab repository
git clone https://gitlab.com/nextclan/loaffinity-system-contract.git
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


```
Proposal Abstract Contract

vote delay <type:uint256> <blocknumber>
    freeze period before vote start
vote period <type:uint256> <blocknumber>
    active vote period
vote threshold <type:uint8> <50 - 100>
    threshold of vote
propose period <type:uint32> <0 - (2^32-1)>
    period between propose proposal
retention period <type:uint32> <0 - (2^32-1)>
    period for cancelation after vote end (emergency use)

                             "vote_start"            "vote_end"                 "execute_proposal"
Proposal:1 |<-----vote_delay----->|<-----vote_period----->|<-----rentention_period----->|
Proposal:2 |<---propose_period--->|<-----vote_delay----->|<-----vote_period----->|<-----rentention_period----->|
Proposal:3                        |<---propose_period--->|<-----vote_delay----->|<-----vote_period----->|<-----rentention_period----->|
```


``` shell
# Initialized System Contract
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

# Role Command
npx hardhat is_committee --help
npx hardhat is_proposer --help
npx hardhat is_agent --help
```

### Building System Contract
1. Make sure you have set the value in `.env` file
2. Using command `yarn compile` to compile smart contract valid initalizer will be auto generate from `Intializer.sol.template`
3. Copy deployedBytecode output after run `yarn compile` or `yarn compile` and place to your `genesis.json`
4. when start the network if wanted to activate the contract you should using hardhat task activate contract from example above

### Noted Issue and Risk Appetite
- Proposer have majority and right to create proposal by their own, avoid Proposer spamming proposal to future block potentially DoS contract.
- Single Root admin for add and remove proposer.
- Configuration configuration such as voting delay, voting period, and threshold can't be change after contract initialize.
- Everyblock can contain only one proposal.
- System Contract Implementaion `SHOULD BE` flexible enough to change

### TODO
- [] refactor limit root admin valid till given block height `n`
- [] refactor implementation into proxy pattern
- [] refactor hardhat deploy script
- [] refactor hardhat task script
- [] update readme and documentation
