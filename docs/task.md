<!-- Proposal -->
## Proposal
Command for interact with Proposal can be use on both 
| System Smart Contract        | Reserve Address                              |
|------------------------------|----------------------------------------------|
|`CommitteeContract`           | `0x0000000000000000000000000000000000000776` |
|`TreasuryContract`            | `0x0000000000000000000000000000000000000777` |
### Proposal Command  
---
perform `READ` data from the smart contract similar to `/GET`
#### Example Command
- function getProposalByBlockNumber(`<blockNumber:number>`) → `<proposal:Oject<Proposal>>`
    ``` bash
    npx hardhat get_proposal_by_blocknumber "blockNumber"
    ``` 
- function getProposalByProposalId(`<proposalId:bytes32>`) → `<proposal:Oject<Proposal>>`
    ``` bash
    npx hardhat get_proposal_by_proposalid "proposalId"
    ``` 
- function getProposalIdByBlockNumber(`<blockNumber:number>`) → `<proposalId:bytes32>`
    ``` bash
    npx hardhat get_proposal_id_by_blocknumber "blockNumber"
    ``` 
#### Help Command
``` bash
npx hardhat get_proposal_by_blocknumber --help
npx hardhat get_proposal_by_proposalid --help
npx hardhat get_proposal_id_by_blocknumber --help
```
---
#### Propose Command 
--- 
perform `WRITE` data to the smart contract similar to `/POST`
#### Example Command
- function propose(``)
- function propose(``)
#### Help Command
``` bash
npx hardhat propose_committee --help
npx hardhat propose_supply --help
```
---
<!-- Proposal -->


<!-- Role Based Access Control -->
## Role Based Access Control
command section `Grant` can call by the `ROOT_ADMIN` only which is available to use till 'n' blockheight.  
but for the section `Role` are publicly and can be call by any.
#### Role Command
---
perform `READ` data from the smart contract similar to `/GET`
#### Example Command
- function isAgent(`<agent:address>`) → `<status:boolean>`
    ``` bash
    npx hardhat is_agent "agent"
    ``` 
- function isCommittee(`<committee:address>`) → `<status:boolean>`
    ``` bash
    npx hardhat is_committee "committee"
    ``` 
- function isMerchant(`<merchant:address>`) → `<status:boolean>`
    ``` bash
    npx hardhat is_merchant "merchant"
    ``` 
- function isProposer(`<proposer:address>`) → `<status:boolean>`
    ``` bash
    npx hardhat is_proposer "proposer"
    ``` 
- function isServiceProvider(`<serviceprovider:address`) → `<status:boolean>`
    ``` bash
    npx hardhat is_proposer "proposer"
    ``` 
#### Help Command
``` bash
npx hardhat is_agent --help
npx hardhat is_committee --help
npx hardhat is_merchant --help
npx hardhat is_proposer --help
npx hardhat is_serviceprovider --help
```
---
#### Grant Command
---
perform `WRITE` data to the smart contract similar to `/POST`
#### Example Command
- function grantAgent(`<agent:address`) → `<null>`  
  function revokeAgent(`<agent:address`) → `<null>`
    ``` bash
    npx hardhat grant_agent "agent" "action"
    ``` 
- function grantProposer(`<proposer:address`) → `<null>`  
  function revokeProposer(`<proposer:address`) → `<null>`
    ``` bash
    npx hardhat grant_proposer "proposer" "action"
    ``` 
- function grantMerchant(`<merchant:address`) → `<null>`  
  function revokeMerchant(`<merchant:address`) → `<null>`
    ``` bash
    npx hardhat grant_merchant "merchant" "action"
    ``` 
- function grantServiceProvider(`<serviceprovider:address`) → `<null>`  
  function revokeServiceProvider(`<serviceprovider:address`) → `<null>`
    ``` bash
    npx hardhat grant_serviceprovider "serviceprovider" "action" 
    ```
** `"action"` flag revoke is `0`, grant is `1`  
** directly grant committee is not provided, to grant new committee please following the voting process.  
#### Help Command
``` bash
npx hardhat grant_agent --help
npx hardhat grant_proposer --help
npx hardhat grant_merchant --help // TODO
npx hardhat grant_serviceprovider --help // TODO
```
<!-- Role Based Access Control -->

<!-- Proxy -->
## Proxy
Command for interact with Proxy can be use on both 
| System Smart Contract        | Reserve Address                              |
|------------------------------|----------------------------------------------|
|`GasPriceOracleProxy`         | `0x0000000000000000000000000000000000000778` |
|`ServiceProviderProxy`        | `0x0000000000000000000000000000000000000779` |
---
Command section `Update Config Command` can call by the `ROOT_ADMIN` only which is available to use till 'n' blockheight.

#### Read Config Command
perform `READ` data from the smart contract similar to `/GET`
#### Example Command
- function setImplementation(`smratcontarct:address`) → `<null>`
- function updateThreshold(`threshold:Object<Threshold>`) → `<null>`
- function status() → `<status:boolean>`
- function calculateTransactionFee() → `<gasFee:number>`
#### Help Command
``` bash
npx hardhat serviceprovider --help // implementation contract change // TODO
npx hardhat gaspriceoracle --help  // implementation contract change // TODO
npx hardhat gaspriceoracle --help  // update ratio/threshold         // TODO
```
---

#### Update Config Command
perform `WRITE` data to the smart contract similar to `/POST`
#### Example Command
#### Help Command
``` bash
npx hardhat serviceprovider --help // implementation contract change // TODO
npx hardhat gaspriceoracle --help  // implementation contract change // TODO
npx hardhat gaspriceoracle --help  // update ratio/threshold         // TODO
```
---
<!-- Proxy -->