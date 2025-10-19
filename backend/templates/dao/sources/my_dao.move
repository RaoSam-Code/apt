module dao_owner::my_dao {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::aptos_governance;
    use aptos_framework::coin;

    const DAO_NAME: vector<u8> = b"{{DAO_NAME}}";
    const PROPOSAL_DELAY: u64 = {{PROPOSAL_DELAY}};

    struct MyDAO {}

    fun init_module(sender: &signer) {
        aptos_governance::initialize(
            sender,
            string::utf8(DAO_NAME),
            PROPOSAL_DELAY,
            1000000, // min voting threshold
        );
    }

    public entry fun create_proposal(sender: &signer, execution_hash: vector<u8>) {
        aptos_governance::create_proposal(sender, execution_hash);
    }

    public entry fun vote(sender: &signer, proposal_id: u64, should_pass: bool) {
        aptos_governance::vote(sender, proposal_id, 1, should_pass);
    }
}
