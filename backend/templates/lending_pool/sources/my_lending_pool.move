module lending_pool_owner::my_lending_pool {
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::account;
    use aptos_framework::event;
    use std::error;
    use std::signer;

    /// Error codes
    const E_NOT_OWNER: u64 = 1;
    const E_INVALID_AMOUNT: u64 = 2;
    const E_INSUFFICIENT_FUNDS: u64 = 3;
    const E_LOAN_NOT_FOUND: u64 = 4;
    const E_LOAN_ALREADY_REPAID: u64 = 5;

    struct LendingPool has key {
        total_deposited: u64,
        total_borrowed: u64,
        interest_rate: u64, // Basis points, e.g., 100 = 1%
        owner: address,
        next_loan_id: u64,
        deposit_events: event::EventHandle<DepositEvent>,
        borrow_events: event::EventHandle<BorrowEvent>,
        repay_events: event::EventHandle<RepayEvent>,
    }

    struct Loan has store, drop {
        id: u64,
        borrower: address,
        amount: u64,
        interest: u64,
        repaid: bool,
    }

    struct DepositEvent has drop, store {
        depositor: address,
        amount: u64,
        timestamp: u64,
    }

    struct BorrowEvent has drop, store {
        borrower: address,
        loan_id: u64,
        amount: u64,
        interest_rate: u64,
        timestamp: u64,
    }

    struct RepayEvent has drop, store {
        borrower: address,
        loan_id: u64,
        amount: u64,
        interest_paid: u64,
        timestamp: u64,
    }

    fun init_module(sender: &signer) {
        let owner_address = signer::address_of(sender);
        move_to(sender, LendingPool {
            total_deposited: 0,
            total_borrowed: 0,
            interest_rate: 100, // 1%
            owner: owner_address,
            next_loan_id: 0,
            deposit_events: event::new_event_handle(sender),
            borrow_events: event::new_event_handle(sender),
            repay_events: event::new_event_handle(sender),
        });
    }

    public entry fun deposit(sender: &signer, amount: u64) acquires LendingPool {
        assert!(amount > 0, error::invalid_argument(E_INVALID_AMOUNT));

        let pool = borrow_global_mut<LendingPool>(@lending_pool_owner);
        pool.total_deposited = pool.total_deposited + amount;

        coin::deposit(pool.owner, coin::withdraw(sender, amount));

        event::emit_event(&mut pool.deposit_events, DepositEvent {
            depositor: signer::address_of(sender),
            amount,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    public entry fun borrow(sender: &signer, amount: u64) acquires LendingPool {
        assert!(amount > 0, error::invalid_argument(E_INVALID_AMOUNT));

        let pool = borrow_global_mut<LendingPool>(@lending_pool_owner);
        assert!(pool.total_deposited >= pool.total_borrowed + amount, error::not_enough_resources(E_INSUFFICIENT_FUNDS));

        let loan_id = pool.next_loan_id;
        pool.next_loan_id = pool.next_loan_id + 1;
        pool.total_borrowed = pool.total_borrowed + amount;

        let interest = amount * pool.interest_rate / 10000; // interest_rate is in basis points (10000 basis points = 100%)

        move_to(sender, Loan {
            id: loan_id,
            borrower: signer::address_of(sender),
            amount,
            interest,
            repaid: false,
        });

        coin::withdraw(pool.owner, amount); // Transfer from pool to borrower
        coin::deposit(signer::address_of(sender), coin::create_coin(amount)); // This line needs to be adjusted based on how you handle coin transfers

        event::emit_event(&mut pool.borrow_events, BorrowEvent {
            borrower: signer::address_of(sender),
            loan_id,
            amount,
            interest_rate: pool.interest_rate,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    public entry fun repay(sender: &signer, loan_id: u64) acquires LendingPool, Loan {
        let borrower_address = signer::address_of(sender);
        let loan = borrow_global_mut<Loan>(borrower_address); // This needs to be adjusted to find the specific loan

        assert!(loan.id == loan_id, error::not_found(E_LOAN_NOT_FOUND));
        assert!(!loan.repaid, error::invalid_state(E_LOAN_ALREADY_REPAID));

        let total_repay_amount = loan.amount + loan.interest;
        let repaid_coin = coin::withdraw(sender, total_repay_amount);
        coin::deposit(borrow_global_mut<LendingPool>(@lending_pool_owner).owner, repaid_coin);

        let pool = borrow_global_mut<LendingPool>(@lending_pool_owner);
        pool.total_borrowed = pool.total_borrowed - loan.amount;
        pool.total_deposited = pool.total_deposited + loan.interest; // Interest goes to the pool

        loan.repaid = true;

        event::emit_event(&mut pool.repay_events, RepayEvent {
            borrower: borrower_address,
            loan_id,
            amount: loan.amount,
            interest_paid: loan.interest,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    public fun get_total_deposited(): u64 acquires LendingPool {
        borrow_global<LendingPool>(@lending_pool_owner).total_deposited
    }

    public fun get_total_borrowed(): u64 acquires LendingPool {
        borrow_global<LendingPool>(@lending_pool_owner).total_borrowed
    }

    public fun get_interest_rate(): u64 acquires LendingPool {
        borrow_global<LendingPool>(@lending_pool_owner).interest_rate
    }

    public fun get_loan(borrower: address, loan_id: u64): Loan acquires Loan {
        // This function needs to be adjusted to find the specific loan
        borrow_global<Loan>(borrower)
    }
}
