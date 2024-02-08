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
2. Using command `yarn compile` to compile smart contract
3. Copy deployedBytecode output after run `yarn build` to and place to genesis.json
4. when start the network if wanted to activate the contract you should using hardtask activate contract from example above

### Noted Issue
- Proposer have majority and right to create proposal by their own, avoid Proposer spamming proposal to future block potentially DoS contract.
- Single Root admin for add and remove proposer.
- Configuration configuration such as voting delay, voting period, and threshold can't be change after contract initialize.
- Everyblock can contain only one proposal.

### TODO
- [] adding execute retention period (period delay before can execute)
- [] update and refactor task script
- [] update readme and documentation
