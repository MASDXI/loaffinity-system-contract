#### Proposal Abstract
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
```

#### Proposal Behavior
```
                             "vote_start"            "vote_end"                 "execute_proposal"
Proposal:1 |<-----vote_delay----->|<-----vote_period----->|<-----rentention_period----->|
Proposal:2 |<---propose_period--->|<-----vote_delay----->|<-----vote_period----->|<-----rentention_period----->|
Proposal:3                        |<---propose_period--->|<-----vote_delay----->|<-----vote_period----->|<-----rentention_period----->|
```
