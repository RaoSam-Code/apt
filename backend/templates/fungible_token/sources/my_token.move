module token_owner::my_token {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::coin;

    const TOKEN_NAME: vector<u8> = b"{{TOKEN_NAME}}";
    const TOKEN_SYMBOL: vector<u8> = b"{{TOKEN_SYMBOL}}";
    const TOKEN_DECIMALS: u8 = {{TOKEN_DECIMALS}};
    const INITIAL_SUPPLY: u64 = {{TOKEN_SUPPLY}};

    struct MyToken {}

    fun init_module(sender: &signer) {
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<MyToken>(
            sender,
            string::utf8(TOKEN_NAME),
            string::utf8(TOKEN_SYMBOL),
            TOKEN_DECIMALS,
            true,
        );

        coin::mint(sender, &mint_cap, INITIAL_SUPPLY);

        // Store capabilities
        move_to(sender, burn_cap);
        move_to(sender, freeze_cap);
        move_to(sender, mint_cap);
    }
}
