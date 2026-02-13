module owner::my_token {
    use aptos_framework::fungible_asset::{Self, Metadata};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;
    use std::option;
    use std::string::{Self, String};
    use std::signer;

    /// The token symbol
    const SYMBOL: vector<u8> = b"{{TOKEN_SYMBOL}}";
    /// The token name
    const NAME: vector<u8> = b"{{TOKEN_NAME}}";
    /// The token decimals
    const DECIMALS: u8 = 8;
    /// The token icon URI
    const ICON_URI: vector<u8> = b"http://example.com/icon.png";
    /// The token project URI
    const PROJECT_URI: vector<u8> = b"http://example.com";

    // Resources
    struct TokenConfig has key {
        mint_ref: fungible_asset::MintRef,
        burn_ref: fungible_asset::BurnRef,
        transfer_ref: fungible_asset::TransferRef,
    }

    /// Initialize the token
    fun init_module(admin: &signer) {
        let constructor_ref = &object::create_named_object(admin, SYMBOL);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(),
            string::utf8(NAME),
            string::utf8(SYMBOL),
            DECIMALS,
            string::utf8(ICON_URI),
            string::utf8(PROJECT_URI),
        );

        let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(constructor_ref);

        move_to(admin, TokenConfig { mint_ref, burn_ref, transfer_ref });
    }

    /// Mint tokens to a specific account
    public entry fun mint(admin: &signer, to: address, amount: u64) acquires TokenConfig {
        let config = borrow_global<TokenConfig>(signer::address_of(admin));
        let fa = fungible_asset::mint(&config.mint_ref, amount);
        primary_fungible_store::deposit(to, fa);
    }
}
