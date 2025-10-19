module staking_owner::my_staking {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::timestamp;

    const REWARD_RATE: u64 = 100; // Rewards per second
    const TOKEN_MODULE_ADDRESS: address = {{TOKEN_MODULE_ADDRESS}};

    struct StakingInfo<phantom CoinType> has key {
        staked_amount: u64,
        last_claimed: u64,
    }

    public entry fun stake<CoinType>(sender: &signer, amount: u64) {
        let sender_addr = signer::address_of(sender);
        coin::transfer<CoinType>(sender, &signer::address_of(sender), amount);
        if (!exists<StakingInfo<CoinType>>(sender_addr)) {
            move_to(sender, StakingInfo<CoinType> {
                staked_amount: 0,
                last_claimed: timestamp::now_seconds(),
            });
        }
        let staking_info = borrow_global_mut<StakingInfo<CoinType>>(sender_addr);
        staking_info.staked_amount = staking_info.staked_amount + amount;
    }

    public entry fun unstake<CoinType>(sender: &signer, amount: u64) {
        let sender_addr = signer::address_of(sender);
        let staking_info = borrow_global_mut<StakingInfo<CoinType>>(sender_addr);
        staking_info.staked_amount = staking_info.staked_amount - amount;
        coin::transfer<CoinType>(&signer::address_of(sender), sender, amount);
    }

    public entry fun claim_rewards<CoinType>(sender: &signer) {
        let sender_addr = signer::address_of(sender);
        let staking_info = borrow_global_mut<StakingInfo<CoinType>>(sender_addr);
        let now = timestamp::now_seconds();
        let rewards = (now - staking_info.last_claimed) * REWARD_RATE;
        staking_info.last_claimed = now;
        coin::mint<CoinType>(&signer::address_of(sender), rewards);
        coin::transfer<CoinType>(&signer::address_of(sender), sender, rewards);
    }
}
