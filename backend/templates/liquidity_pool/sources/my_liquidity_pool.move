module liquidity_pool_owner::my_liquidity_pool {
    use std::signer;
    use aptos_framework::coin;

    struct Pool<TokenA, TokenB> has key {
        reserve_a: u64,
        reserve_b: u64,
        coin_a: coin::Coin<TokenA>,
        coin_b: coin::Coin<TokenB>,
    }

    public fun initialize<TokenA, TokenB>(
        sender: &signer,
        amount_a: u64,
        amount_b: u64,
    ) {
        let coin_a = coin::withdraw<TokenA>(sender, amount_a);
        let coin_b = coin::withdraw<TokenB>(sender, amount_b);
        move_to(sender, Pool<TokenA, TokenB> {
            reserve_a: amount_a,
            reserve_b: amount_b,
            coin_a,
            coin_b,
        });
    }

    public fun add_liquidity<TokenA, TokenB>(
        sender: &signer,
        amount_a: u64,
        amount_b: u64,
    ) acquires Pool {
        let pool = borrow_global_mut<Pool<TokenA, TokenB>>(signer::address_of(sender));
        let coin_a = coin::withdraw<TokenA>(sender, amount_a);
        let coin_b = coin::withdraw<TokenB>(sender, amount_b);
        coin::merge(&mut pool.coin_a, coin_a);
        coin::merge(&mut pool.coin_b, coin_b);
        pool.reserve_a = pool.reserve_a + amount_a;
        pool.reserve_b = pool.reserve_b + amount_b;
    }

    public fun remove_liquidity<TokenA, TokenB>(
        sender: &signer,
        amount_a: u64,
        amount_b: u64,
    ) acquires Pool {
        let pool = borrow_global_mut<Pool<TokenA, TokenB>>(signer::address_of(sender));
        assert!(pool.reserve_a >= amount_a, 1);
        assert!(pool.reserve_b >= amount_b, 2);
        let coin_a = coin::extract(&mut pool.coin_a, amount_a);
        let coin_b = coin::extract(&mut pool.coin_b, amount_b);
        coin::deposit(signer::address_of(sender), coin_a);
        coin::deposit(signer::address_of(sender), coin_b);
        pool.reserve_a = pool.reserve_a - amount_a;
        pool.reserve_b = pool.reserve_b - amount_b;
    }

    public fun swap<TokenA, TokenB>(
        sender: &signer,
        amount_in: u64,
    ) acquires Pool {
        let pool = borrow_global_mut<Pool<TokenA, TokenB>>(signer::address_of(sender));
        let coin_in = coin::withdraw<TokenA>(sender, amount_in);
        let amount_out = (amount_in * pool.reserve_b) / (pool.reserve_a + amount_in);
        let coin_out = coin::extract(&mut pool.coin_b, amount_out);
        coin::deposit(signer::address_of(sender), coin_out);
        coin::merge(&mut pool.coin_a, coin_in);
        pool.reserve_a = pool.reserve_a + amount_in;
        pool.reserve_b = pool.reserve_b - amount_out;
    }
}
