module yield_farm_owner::my_yield_farm {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::timestamp;

    struct Farm<StakingToken, RewardToken> has key {
        total_staked: u64,
        reward_rate: u64,
        last_update_time: u64,
        reward_per_token_stored: u128,
        staking_coin: coin::Coin<StakingToken>,
        reward_coin: coin::Coin<RewardToken>,
    }

    struct Staker<StakingToken> has key {
        amount: u64,
        reward_per_token_paid: u128,
        rewards: u64,
    }

    public fun initialize<StakingToken, RewardToken>(
        sender: &signer,
        reward_rate: u64,
        reward_amount: u64,
    ) {
        let reward_coin = coin::withdraw<RewardToken>(sender, reward_amount);
        move_to(sender, Farm<StakingToken, RewardToken> {
            total_staked: 0,
            reward_rate,
            last_update_time: timestamp::now_seconds(),
            reward_per_token_stored: 0,
            staking_coin: coin::zero<StakingToken>(),
            reward_coin,
        });
    }

    public fun stake<StakingToken, RewardToken>(
        sender: &signer,
        amount: u64,
    ) acquires Farm, Staker {
        let farm = borrow_global_mut<Farm<StakingToken, RewardToken>>(signer::address_of(sender));
        update_rewards<StakingToken, RewardToken>(farm, signer::address_of(sender));

        let staker = if (exists<Staker<StakingToken>>(signer::address_of(sender))) {
            borrow_global_mut<Staker<StakingToken>>(signer::address_of(sender))
        } else {
            move_to(sender, Staker<StakingToken> {
                amount: 0,
                reward_per_token_paid: 0,
                rewards: 0,
            });
            borrow_global_mut<Staker<StakingToken>>(signer::address_of(sender))
        };

        let staked_coin = coin::withdraw<StakingToken>(sender, amount);
        coin::merge(&mut farm.staking_coin, staked_coin);
        farm.total_staked = farm.total_staked + amount;
        staker.amount = staker.amount + amount;
    }

    public fun unstake<StakingToken, RewardToken>(
        sender: &signer,
        amount: u64,
    ) acquires Farm, Staker {
        let farm = borrow_global_mut<Farm<StakingToken, RewardToken>>(signer::address_of(sender));
        update_rewards<StakingToken, RewardToken>(farm, signer::address_of(sender));

        let staker = borrow_global_mut<Staker<StakingToken>>(signer::address_of(sender));
        assert!(staker.amount >= amount, 1);

        let unstaked_coin = coin::extract(&mut farm.staking_coin, amount);
        coin::deposit(signer::address_of(sender), unstaked_coin);
        farm.total_staked = farm.total_staked - amount;
        staker.amount = staker.amount - amount;
    }

    public fun claim_rewards<StakingToken, RewardToken>(
        sender: &signer,
    ) acquires Farm, Staker {
        let farm = borrow_global_mut<Farm<StakingToken, RewardToken>>(signer::address_of(sender));
        update_rewards<StakingToken, RewardToken>(farm, signer::address_of(sender));

        let staker = borrow_global_mut<Staker<StakingToken>>(signer::address_of(sender));
        let reward_amount = staker.rewards;
        staker.rewards = 0;

        let reward_coin = coin::extract(&mut farm.reward_coin, reward_amount);
        coin::deposit(signer::address_of(sender), reward_coin);
    }

    fun update_rewards<StakingToken, RewardToken>(
        farm: &mut Farm<StakingToken, RewardToken>,
        staker_address: address,
    ) acquires Staker {
        let current_time = timestamp::now_seconds();
        let time_passed = current_time - farm.last_update_time;

        if (time_passed > 0 && farm.total_staked > 0) {
            let reward = (time_passed as u128) * (farm.reward_rate as u128);
            farm.reward_per_token_stored = farm.reward_per_token_stored + (reward * 1000000000000000000) / (farm.total_staked as u128);
        }
        farm.last_update_time = current_time;

        if (exists<Staker<StakingToken>>(staker_address)) {
            let staker = borrow_global_mut<Staker<StakingToken>>(staker_address);
            staker.rewards = staker.rewards + earned<StakingToken, RewardToken>(farm, staker);
            staker.reward_per_token_paid = farm.reward_per_token_stored;
        }
    }

    fun earned<StakingToken, RewardToken>(
        farm: &Farm<StakingToken, RewardToken>,
        staker: &Staker<StakingToken>,
    ): u64 {
        ((staker.amount as u128) * (farm.reward_per_token_stored - staker.reward_per_token_paid)) / 1000000000000000000 as u64
    }
}
