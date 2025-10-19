module governance_owner::my_governance {
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use std::signer;
    use std::vector;

    const E_NOT_ENOUGH_VOTES: u64 = 0;
    const E_PROPOSAL_NOT_ACTIVE: u64 = 1;
    const E_PROPOSAL_ALREADY_ACTIVE: u64 = 2;
    const E_PROPOSAL_NOT_QUEUED: u64 = 3;
    const E_PROPOSAL_ALREADY_QUEUED: u64 = 4;
    const E_PROPOSAL_NOT_EXECUTABLE: u64 = 5;
    const E_PROPOSAL_ALREADY_EXECUTED: u64 = 6;
    const E_VOTING_PERIOD_NOT_ENDED: u64 = 7;
    const E_QUORUM_NOT_REACHED: u64 = 8;
    const E_PROPOSAL_FAILED: u64 = 9;
    const E_ALREADY_VOTED: u64 = 10;
    const E_VOTING_NOT_STARTED: u64 = 11;
    const E_VOTING_ENDED: u64 = 12;
    const E_NOT_GOVERNANCE_OWNER: u64 = 13;
    const E_INVALID_PROPOSAL_ID: u64 = 14;
    const E_PROPOSAL_ALREADY_CANCELED: u64 = 15;
    const E_PROPOSAL_NOT_CANCELED: u64 = 16;
    const E_PROPOSAL_NOT_PENDING: u64 = 17;
    const E_PROPOSAL_NOT_SUCCEEDED: u64 = 18;
    const E_PROPOSAL_NOT_DEFEATED: u64 = 19;
    const E_PROPOSAL_NOT_EXPIRED: u64 = 20;
    const E_PROPOSAL_NOT_VOTED: u64 = 21;
    const E_PROPOSAL_NOT_QUEUED_FOR_EXECUTION: u64 = 22;
    const E_PROPOSAL_NOT_EXECUTED: u64 = 23;
    const E_PROPOSAL_NOT_CANCELED_BY_OWNER: u64 = 24;
    const E_PROPOSAL_NOT_CANCELED_BY_VOTES: u64 = 25;
    const E_PROPOSAL_NOT_CANCELED_BY_EXPIRATION: u64 = 26;
    const E_PROPOSAL_NOT_CANCELED_BY_QUORUM: u64 = 27;
    const E_PROPOSAL_NOT_CANCELED_BY_VOTING_PERIOD: u64 = 28;
    const E_PROPOSAL_NOT_CANCELED_BY_EXECUTION: u69 = 29;


    struct Proposal has store, drop {
        id: u64,
        proposer: address,
        start_time: u64,
        end_time: u64,
        for_votes: u64,
        against_votes: u64,
        abstain_votes: u64,
        executed: bool,
        canceled: bool,
        description: vector::U8,
    }

    struct Governance has key {
        next_proposal_id: u64,
        proposals: vector::Proposal,
        voting_period: u64, // in seconds
        quorum_percentage: u64, // percentage of total supply required for quorum
        total_supply: u64, // total supply of the governance token
        proposal_delay: u64, // delay before a proposal can be voted on
        execution_delay: u64, // delay before a successful proposal can be executed
        proposal_event_handle: event::EventHandle<ProposalEvent>,
    }

    struct ProposalEvent has drop, store {
        proposal_id: u64,
        event_type: u8, // 0: created, 1: voted, 2: queued, 3: executed, 4: canceled
        timestamp: u64,
    }

    public fun init_governance(
        governance_owner: &signer,
        voting_period: u64,
        quorum_percentage: u64,
        total_supply: u64,
        proposal_delay: u64,
        execution_delay: u64,
    ) {
        assert!(!exists<Governance>(signer::address_of(governance_owner)), E_GOVERNANCE_ALREADY_INITIALIZED);

        move_to(governance_owner, Governance {
            next_proposal_id: 0,
            proposals: vector::empty(),
            voting_period,
            quorum_percentage,
            total_supply,
            proposal_delay,
            execution_delay,
            proposal_event_handle: event::new_event_handle(governance_owner),
        });
    }

    public fun create_proposal(
        proposer: &signer,
        description: vector::U8,
    ): u64 acquires Governance {
        let governance_addr = signer::address_of(proposer); // Assuming governance is deployed at proposer's address for simplicity
        assert!(exists<Governance>(governance_addr), E_GOVERNANCE_NOT_INITIALIZED);
        let governance = borrow_global_mut<Governance>(governance_addr);

        let proposal_id = governance.next_proposal_id;
        governance.next_proposal_id = proposal_id + 1;

        let current_time = timestamp::now_seconds();
        let start_time = current_time + governance.proposal_delay;
        let end_time = start_time + governance.voting_period;

        let proposal = Proposal {
            id: proposal_id,
            proposer: signer::address_of(proposer),
            start_time,
            end_time,
            for_votes: 0,
            against_votes: 0,
            abstain_votes: 0,
            executed: false,
            canceled: false,
            description,
        };
        vector::push_back(&mut governance.proposals, proposal);

        event::emit_event(&mut governance.proposal_event_handle, ProposalEvent {
            proposal_id,
            event_type: 0, // Created
            timestamp: current_time,
        });
        proposal_id
    }

    public fun vote(
        voter: &signer,
        governance_addr: address,
        proposal_id: u64,
        vote_type: u8, // 0: against, 1: for, 2: abstain
        num_votes: u64,
    ) acquires Governance {
        assert!(exists<Governance>(governance_addr), E_GOVERNANCE_NOT_INITIALIZED);
        let governance = borrow_global_mut<Governance>(governance_addr);

        assert!(proposal_id < vector::length(&governance.proposals), E_INVALID_PROPOSAL_ID);
        let proposal = vector::borrow_mut(&mut governance.proposals, proposal_id);

        let current_time = timestamp::now_seconds();
        assert!(current_time >= proposal.start_time, E_VOTING_NOT_STARTED);
        assert!(current_time < proposal.end_time, E_VOTING_ENDED);
        assert!(!proposal.executed, E_PROPOSAL_ALREADY_EXECUTED);
        assert!(!proposal.canceled, E_PROPOSAL_ALREADY_CANCELED);

        // In a real scenario, you would check if the voter holds enough governance tokens
        // and if they have already voted. For simplicity, we skip these checks here.
        // For example:
        // let voter_balance = coin::balance<GovernanceToken>(signer::address_of(voter));
        // assert!(voter_balance >= num_votes, E_NOT_ENOUGH_VOTES);

        if (vote_type == 0) {
            proposal.against_votes = proposal.against_votes + num_votes;
        } else if (vote_type == 1) {
            proposal.for_votes = proposal.for_votes + num_votes;
        } else if (vote_type == 2) {
            proposal.abstain_votes = proposal.abstain_votes + num_votes;
        } else {
            // Invalid vote type, handle as error or default
        }

        event::emit_event(&mut governance.proposal_event_handle, ProposalEvent {
            proposal_id,
            event_type: 1, // Voted
            timestamp: current_time,
        });
    }

    public fun queue_proposal(
        governance_owner: &signer,
        governance_addr: address,
        proposal_id: u64,
    ) acquires Governance {
        assert!(signer::address_of(governance_owner) == governance_addr, E_NOT_GOVERNANCE_OWNER);
        assert!(exists<Governance>(governance_addr), E_GOVERNANCE_NOT_INITIALIZED);
        let governance = borrow_global_mut<Governance>(governance_addr);

        assert!(proposal_id < vector::length(&governance.proposals), E_INVALID_PROPOSAL_ID);
        let proposal = vector::borrow_mut(&mut governance.proposals, proposal_id);

        let current_time = timestamp::now_seconds();
        assert!(current_time >= proposal.end_time, E_VOTING_PERIOD_NOT_ENDED);
        assert!(!proposal.executed, E_PROPOSAL_ALREADY_EXECUTED);
        assert!(!proposal.canceled, E_PROPOSAL_ALREADY_CANCELED);

        let total_votes = proposal.for_votes + proposal.against_votes + proposal.abstain_votes;
        assert!(total_votes * 100 >= governance.quorum_percentage * governance.total_supply, E_QUORUM_NOT_REACHED);
        assert!(proposal.for_votes > proposal.against_votes, E_PROPOSAL_FAILED);

        // Mark as queued (we can add a 'queued' field to Proposal struct if needed)
        // For now, we consider it queued if it passes voting and is ready for execution delay
        event::emit_event(&mut governance.proposal_event_handle, ProposalEvent {
            proposal_id,
            event_type: 2, // Queued
            timestamp: current_time,
        });
    }

    public fun execute_proposal(
        governance_owner: &signer,
        governance_addr: address,
        proposal_id: u64,
    ) acquires Governance {
        assert!(signer::address_of(governance_owner) == governance_addr, E_NOT_GOVERNANCE_OWNER);
        assert!(exists<Governance>(governance_addr), E_GOVERNANCE_NOT_INITIALIZED);
        let governance = borrow_global_mut<Governance>(governance_addr);

        assert!(proposal_id < vector::length(&governance.proposals), E_INVALID_PROPOSAL_ID);
        let proposal = vector::borrow_mut(&mut governance.proposals, proposal_id);

        let current_time = timestamp::now_seconds();
        assert!(current_time >= proposal.end_time + governance.execution_delay, E_PROPOSAL_NOT_EXECUTABLE);
        assert!(!proposal.executed, E_PROPOSAL_ALREADY_EXECUTED);
        assert!(!proposal.canceled, E_PROPOSAL_ALREADY_CANCELED);

        let total_votes = proposal.for_votes + proposal.against_votes + proposal.abstain_votes;
        assert!(total_votes * 100 >= governance.quorum_percentage * governance.total_supply, E_QUORUM_NOT_REACHED);
        assert!(proposal.for_votes > proposal.against_votes, E_PROPOSAL_FAILED);

        proposal.executed = true;

        // In a real scenario, this is where the actual logic of the proposal would be executed.
        // For example, calling another module's function.

        event::emit_event(&mut governance.proposal_event_handle, ProposalEvent {
            proposal_id,
            event_type: 3, // Executed
            timestamp: current_time,
        });
    }

    public fun cancel_proposal(
        governance_owner: &signer,
        governance_addr: address,
        proposal_id: u64,
    ) acquires Governance {
        assert!(signer::address_of(governance_owner) == governance_addr, E_NOT_GOVERNANCE_OWNER);
        assert!(exists<Governance>(governance_addr), E_GOVERNANCE_NOT_INITIALIZED);
        let governance = borrow_global_mut<Governance>(governance_addr);

        assert!(proposal_id < vector::length(&governance.proposals), E_INVALID_PROPOSAL_ID);
        let proposal = vector::borrow_mut(&mut governance.proposals, proposal_id);

        assert!(!proposal.executed, E_PROPOSAL_ALREADY_EXECUTED);
        assert!(!proposal.canceled, E_PROPOSAL_ALREADY_CANCELED);

        proposal.canceled = true;

        event::emit_event(&mut governance.proposal_event_handle, ProposalEvent {
            proposal_id,
            event_type: 4, // Canceled
            timestamp: timestamp::now_seconds(),
        });
    }

    // Helper functions to get proposal state
    public fun get_proposal_state(governance_addr: address, proposal_id: u64): u8 acquires Governance {
        assert!(exists<Governance>(governance_addr), E_GOVERNANCE_NOT_INITIALIZED);
        let governance = borrow_global<Governance>(governance_addr);
        assert!(proposal_id < vector::length(&governance.proposals), E_INVALID_PROPOSAL_ID);
        let proposal = vector::borrow(&governance.proposals, proposal_id);

        if (proposal.executed) {
            return 5; // Executed
        }
        if (proposal.canceled) {
            return 6; // Canceled
        }

        let current_time = timestamp::now_seconds();
        if (current_time < proposal.start_time) {
            return 0; // Pending
        }
        if (current_time < proposal.end_time) {
            return 1; // Active
        }

        let total_votes = proposal.for_votes + proposal.against_votes + proposal.abstain_votes;
        if (total_votes * 100 < governance.quorum_percentage * governance.total_supply) {
            return 2; // Defeated (Quorum not reached)
        }
        if (proposal.for_votes <= proposal.against_votes) {
            return 3; // Defeated (Failed to pass)
        }

        if (current_time < proposal.end_time + governance.execution_delay) {
            return 4; // Succeeded (Queued for execution)
        }

        return 7; // Expired (Succeeded but not executed within delay)
    }

    // Error codes for governance
    const E_GOVERNANCE_ALREADY_INITIALIZED: u64 = 100;
    const E_GOVERNANCE_NOT_INITIALIZED: u64 = 101;
}
