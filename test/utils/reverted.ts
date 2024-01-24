export const revertedMessage = {
    // abstract proposal contract
    proposal_vote_delay_exist: "proposal: this vote delay value already set",
    proposal_vote_period_exist: "proposal: this vote period value already set",
    proposal_vote_threshold_exist: "proposal: this vote threshold value already set",
    proposal_vote_not_exist: "proposal: proposalId not exist",
    proposal_propose_period_exist: "proposal: this propose period value already set",
    proposal_propose_too_soon: "proposal: propose again later",
    proposal_vote_threshold_max: "proposal: greater than max threshold",
    proposal_vote_threshold_min: "proposal: less than min threshold",
    proposal_already_exists:"proposal: proposalId already exists",
    proposal_max_stack: "proposal: propose max stack",
    proposal_vote_twice: "proposal: not allow to vote twice",
    proposal_not_start: "proposal: proposal not start",
    proposal_expire: "proposal: proposal expired",
    proposal_not_pending: "proposal: proposal not pending",
    proposal_voting_period: "proposal: are in voting period",
    // abstract initializer contract
    initializer_already_initialized: "initializer: already init",
    initializer_only_can_call: "initializer: onlyInitializer can call",
    // abstract transaction transaport contract
    // TODO
    // committee contract
    committee_only_admin_can_call: "committee: onlyAdmin can call",
    committee_only_agent_can_call: "committee: onlyAgent can call",
    committee_only_committee_can_call: "committee: onlyCommittee can call",
    committee_only_proposer_can_call: "committee: onlyProposer can call",
    committee_proposal_not_exist: "committee: proposal not exist",
    committee_propose_past_block:"committee: propose past block",
    committee_propose_zero_address: "committee: propose zero address",
    committee_propose_invalid_block: "committee: invalid blocknumber",
    committee_propose_too_future: "committee: block too future",
    committee_propose_add_exist_address: "committee: propose add existing committee",
    committee_propose_remove_non_exist_address: "committee: propose remove not exist committee",
    committee_propose_to_exist_block: "committee: blocknumber has propose",
    committee_grant_exist_agent: "committee: grant exist agent address",
    committee_revoke_non_exist_agent: "committee: revoke non agent address",
    committee_grant_exist_proposer: "committee: grant exist proposer address",
    committee_revoke_non_exist_proposer: "committee: revoke non proposer address",
    // treasury contract
    treasury_proposal_not_exist: "treasury: proposal not exist",
    treasury_propose_past_block: "treasury: propose past block",
    treasury_propose_invalid_block: "treasury: invalid blocknumber",
    treasury_propose_invalid_amount: "treasury: invalid amount",
    treasury_propose_amount_exceed: "treasury: amount exceed",
    treasury_propose_released_to_zero_address:"treasury: propose released to zero address",
    treasury_propose_locked_to_non_zero_address: "treasury: propose locked to non-zero address",
    treasury_propose_to_exist_block: "treasury: blocknumber has propose",
    treasury_propose_too_future: "treasury: block too future",
    // transaction fee distributor contract
    // TODO
}