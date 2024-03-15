## Consortium Committee Contract

### Description

Consortium Commmitee Smart Contract use for governance committee member including create proposal for add or remove committee.

### Role and Privilage
- Commitee can vote accept or reject proposal
- Proposer can create proposal to popose add or remove committee
- Executor can execute proposal

### CLI for interact wtith consortium commitee contract

#### `initialize_contract`
``` sh
npx hardhat initialize_committee
```
parameter  
- delay BigInt
- period BigInt
- proposeperiod BigInt
- retention BigInt
- committees array of address
- admin address

---

#### `get_committee_count`
``` sh
npx hardhat get_committee_count
```
---

#### `is_agent`
```sh
npx hardhat is_agent
```
---

#### `is_committee`
```sh
npx hardhat is_committee
```
---

#### `is_propose`
```sh
npx hardhat is_propose
```
---

#### `grant_agent`
```sh
npx hardhat grant_agent
```
---

#### `grant_proposer`
```sh
npx hardhat grant_proposer
```
---

#### `propose_committee`
```sh
npx hardhat propose_committee
```
---

### 