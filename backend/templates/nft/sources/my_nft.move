module owner::my_nft {
    use std::string::{Self, String};
    use std::vector;
    use std::signer;
    use aptos_token::token;

    const ENOT_ authorized: u64 = 1;

    struct CollectionConfig has key {
        name: String,
        uri: String,
    }

    fun init_module(account: &signer) {
        let name = string::utf8(b"{{TOKEN_NAME}}");
        let description = string::utf8(b"An awesome NFT collection created with Visual Builder");
        let uri = string::utf8(b"https://aptos.dev");
        let supply = 0; // Infinite supply by default for MVP
        let mutate_setting = vector<bool>[ false, false, false ];

        token::create_collection(
            account,
            name,
            description,
            uri,
            supply,
            mutate_setting
        );
    }

    public entry fun mint_nft(account: &signer, description: String, name: String, uri: String) {
        let token_data_id = token::create_tokendata(
            account,
            string::utf8(b"{{TOKEN_NAME}}"),
            name,
            description,
            0, // Max
            uri,
            signer::address_of(account), // Royalty payee
            100, // Denominator
            5, // Numerator (5%)
            token::create_token_mutability_config(
                &vector<bool>[ false, false, false, false, true ]
            ),
            vector::empty<String>(),
            vector::empty<vector<u8>>(),
            vector::empty<String>(),
        );

        token::mint_token(
            account,
            token_data_id,
            1, // Amount
        );
    }
}
