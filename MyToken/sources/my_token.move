module sender::my_token {
    use aptos_framework::coin;
    use aptos_framework::managed_coin;

    /// Define the token type
    struct MyToken has store, key {}

    /// Initialize the token with a name, symbol, and decimals
    public entry fun init(account: &signer) {
        managed_coin::initialize<MyToken>(
            account,
            b"My Token",   // name
            b"MYT",        // symbol
            6,             // decimals
            true           // monitor supply
        );
    }

    /// Mint new tokens
    public entry fun mint(account: &signer, recipient: address, amount: u64) {
        managed_coin::mint<MyToken>(account, recipient, amount);
    }

    /// Transfer tokens
    public entry fun transfer(account: &signer, recipient: address, amount: u64) {
        coin::transfer<MyToken>(account, recipient, amount);
    }
}