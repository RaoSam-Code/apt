module owner::my_dao {
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::timestamp;

    struct DAOConfig has key {
        voting_delay: u64,
        voting_duration: u64,
        proposal_threshold: u64,
    }

    fun init_module(account: &signer) {
        move_to(account, DAOConfig {
            voting_delay: 86400, // 1 day
            voting_duration: 604800, // 1 week
            proposal_threshold: 100,
        });
    }

    public entry fun update_config(account: &signer, new_delay: u64, new_duration: u64) acquires DAOConfig {
        let config = borrow_global_mut<DAOConfig>(signer::address_of(account));
        config.voting_delay = new_delay;
        config.voting_duration = new_duration;
    }
}
