module nft_owner::my_nft {
    use std::signer;
    use std::string::{Self, String};
    use aptos_token_objects::collection;
    use aptos_token_objects::token;

    const COLLECTION_NAME: vector<u8> = b"{{COLLECTION_NAME}}";
    const COLLECTION_DESCRIPTION: vector<u8> = b"{{COLLECTION_DESCRIPTION}}";
    const COLLECTION_URI: vector<u8> = b"{{COLLECTION_URI}}";

    fun init_module(sender: &signer) {
        collection::create_collection(
            sender,
            string::utf8(COLLECTION_NAME),
            string::utf8(COLLECTION_DESCRIPTION),
            string::utf8(COLLECTION_URI),
            1000, // max supply
            vector[false, false, false], // mutable flags
        );
    }

    public entry fun mint(sender: &signer, token_name: String, token_description: String, token_uri: String) {
        let collection_creator = signer::address_of(sender);
        let collection_name = string::utf8(COLLECTION_NAME);
        let token_creator = token::create_named_token(
            sender,
            collection_creator,
            collection_name,
            token_name,
            token_description,
            token_uri,
        );
        // Mint the token to the creator
        token::mint(sender, token_creator);
    }
}
