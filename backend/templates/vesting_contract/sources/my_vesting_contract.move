module vesting_owner::my_vesting_contract {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::timestamp;

    struct VestingSchedule<CoinType> has key {
        beneficiary: address,
        start_time: u64,
        duration: u64,
        total_amount: u64,
        released_amount: u64,
        coin: coin::Coin<CoinType>,
    }

    public fun initialize<CoinType>(
        sender: &signer,
        beneficiary: address,
        start_time: u64,
        duration: u64,
        total_amount: u64,
    ) {
        let vesting_coin = coin::withdraw<CoinType>(sender, total_amount);
        move_to(sender, VestingSchedule<CoinType> {
            beneficiary,
            start_time,
            duration,
            total_amount,
            released_amount: 0,
            coin: vesting_coin,
        });
    }

    public fun release<CoinType>(account: &signer) acquires VestingSchedule {
        let vesting_schedule = borrow_global_mut<VestingSchedule<CoinType>>(signer::address_of(account));
        let current_time = timestamp::now_seconds();
        
        assert!(current_time >= vesting_schedule.start_time, 1);

        let elapsed_time = current_time - vesting_schedule.start_time;
        let vested_amount = if (elapsed_time >= vesting_schedule.duration) {
            vesting_schedule.total_amount
        } else {
            (vesting_schedule.total_amount * elapsed_time) / vesting_schedule.duration
        };

        let releasable_amount = vested_amount - vesting_schedule.released_amount;
        assert!(releasable_amount > 0, 2);

        let released_coins = coin::extract(&mut vesting_schedule.coin, releasable_amount);
        coin::deposit(vesting_schedule.beneficiary, released_coins);
        vesting_schedule.released_amount = vested_amount;
    }
}
