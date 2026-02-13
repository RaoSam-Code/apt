module owner::my_staking {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    struct StakePool has key {
        total_staked: u64,
    }

    fun init_module(account: &signer) {
        move_to(account, StakePool { total_staked: 0 });
    }

    public entry fun stake(account: &signer, amount: u64) acquires StakePool {
        let pool = borrow_global_mut<StakePool>(@owner);
        let coins = coin::withdraw<AptosCoin>(account, amount);
        // In real impl, deposit to resource account
        coin::deposit(signer::address_of(account), coins); // Temporary: send back
        pool.total_staked = pool.total_staked + amount;
    }
}
