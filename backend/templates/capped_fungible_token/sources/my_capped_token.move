module {{token_owner}}::my_capped_token {
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::event;
    use aptos_framework::managed_coin;
    use aptos_framework::account;
    use std::error;
    use std::signer;

    /// Error codes
    const EALREADY_INITIALIZED: u64 = 1;
    const ENOT_INITIALIZED: u64 = 2;
    const ECAP_EXCEEDED: u64 = 3;
    const EINVALID_CAP: u64 = 4;

    /// Struct representing the capped fungible token
    struct CappedToken has key {
        total_supply: u64,
        cap: u64,
        /// Event handle for minting events
        mint_events: event::EventHandle<MintEvent>,
    }

    /// Event emitted when tokens are minted
    struct MintEvent has drop, store {
        amount: u64,
        recipient: address,
    }

    /// Initializes the capped fungible token with a given cap.
    /// Can only be called once.
    public fun initialize(
        account: &signer,
        token_name: vector<u8>,
        token_symbol: vector<u8>,
        token_decimals: u8,
        cap: u64,
    ) {
        assert!(!exists<CappedToken>(signer::address_of(account)), error::already_exists(EALREADY_INITIALIZED));
        assert!(cap > 0, error::invalid_argument(EINVALID_CAP));

        managed_coin::initialize<CappedToken>(
            account,
            token_name,
            token_symbol,
            token_decimals,
            false, // not transferable by default
        );

        move_to(account, CappedToken {
            total_supply: 0,
            cap,
            mint_events: event::new_event_handle<MintEvent>(account),
        });
    }

    /// Mints new tokens and deposits them into the recipient's account.
    /// The total supply cannot exceed the defined cap.
    public fun mint(
        account: &signer,
        recipient: address,
        amount: u64,
    ): Coin<CappedToken> acquires CappedToken {
        assert!(exists<CappedToken>(signer::address_of(account)), error::not_found(ENOT_INITIALIZED));
        let token_data = borrow_global_mut<CappedToken>(signer::address_of(account));

        let new_total_supply = token_data.total_supply + amount;
        assert!(new_total_supply <= token_data.cap, error::out_of_range(ECAP_EXCEEDED));

        token_data.total_supply = new_total_supply;

        event::emit_event(&mut token_data.mint_events, MintEvent { amount, recipient });

        managed_coin::mint<CappedToken>(account, amount, recipient)
    }

    /// Burns tokens from the sender's account.
    public fun burn(account: &signer, amount: u64) acquires CappedToken {
        assert!(exists<CappedToken>(signer::address_of(account)), error::not_found(ENOT_INITIALIZED));
        let token_data = borrow_global_mut<CappedToken>(signer::address_of(account));

        token_data.total_supply = token_data.total_supply - amount;

        managed_coin::burn<CappedToken>(account, amount);
    }

    /// Returns the total supply of the capped token.
    public fun total_supply(token_owner_address: address): u64 acquires CappedToken {
        assert!(exists<CappedToken>(token_owner_address), error::not_found(ENOT_INITIALIZED));
        borrow_global<CappedToken>(token_owner_address).total_supply
    }

    /// Returns the cap of the capped token.
    public fun cap(token_owner_address: address): u64 acquires CappedToken {
        assert!(exists<CappedToken>(token_owner_address), error::not_found(ENOT_INITIALIZED));
        borrow_global<CappedToken>(token_owner_address).cap
    }

    /// Allows the owner to update the cap.
    public fun update_cap(account: &signer, new_cap: u64) acquires CappedToken {
        assert!(exists<CappedToken>(signer::address_of(account)), error::not_found(ENOT_INITIALIZED));
        assert!(new_cap > 0, error::invalid_argument(EINVALID_CAP));

        let token_data = borrow_global_mut<CappedToken>(signer::address_of(account));
        assert!(token_data.total_supply <= new_cap, error::out_of_range(ECAP_EXCEEDED)); // New cap must be greater than or equal to current supply
        token_data.cap = new_cap;
    }

    /// Transfers tokens from the sender to the recipient.
    public fun transfer(sender: &signer, recipient: address, amount: u64) {
        coin::transfer(sender, recipient, amount);
    }

    /// Registers a new account to receive tokens of this type.
    public fun register(account: &signer) {
        coin::register<CappedToken>(account);
    }

    /// Returns the balance of a given account for this token type.
    public fun balance(owner: address): u64 {
        coin::balance<CappedToken>(owner)
    }

    /// Withdraws tokens from the sender's account.
    public fun withdraw(account: &signer, amount: u64): Coin<CappedToken> {
        coin::withdraw<CappedToken>(account, amount)
    }

    /// Deposits tokens into the recipient's account.
    public fun deposit(recipient: address, coin: Coin<CappedToken>) {
        coin::deposit<CappedToken>(recipient, coin);
    }

    /// Returns the CoinInfo for the CappedToken.
    public fun get_coin_info(): &coin::CoinInfo<CappedToken> {
        coin::get_coin_info<CappedToken>()
    }
}
