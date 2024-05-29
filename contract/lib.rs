//!
//! Smart Contract for Requesting Balance Change and Confirmation
//!
//! This smart contract allows users to request changes to their balance
//! and requires confirmation by the contract owner before the changes can be executed.
//! It provides a secure and transparent way to manage balance adjustments within the contract.
//!
//! The contract owner has the authority to approve or reject balance change requests made by users.
//! Only after confirmation by the contract owner will the requested changes be applied to the user's balance.
//!
//! Features:
//! - Users can submit requests to increase or decrease their balance.
//! - Requests are pending until confirmed by the contract owner.
//! - The contract owner has the sole authority to confirm or reject balance change requests.
//! - Once confirmed, the requested balance changes are applied to the user's balance.
//! - Provides transparency and accountability in managing balance adjustments.
//!
//! Usage:
//! 1. Users initiate a balance change request by calling the appropriate function with the desired amount.
//! 2. The request is added to the pending list until confirmed by the contract owner.
//! 3. The contract owner reviews pending requests and can confirm them.
//! 4. Confirmed requests are executed, and the user's balance is updated accordingly.
//!
//! Note: This contract assumes that the contract owner is a trusted entity with the authority to manage balance changes within the contract.
#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod tubbly {
    use ink::storage::Mapping;

    type RequestId = u128;
    type BalanceType = u128;

    #[derive(Clone)]
    #[cfg_attr(
        feature = "std",
        derive(Debug, PartialEq, Eq, ink::storage::traits::StorageLayout)
    )]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub struct Request {
        pub callee: AccountId,
        pub balance: BalanceType,
    }

    impl Request {
        pub fn new(callee: AccountId, balance: BalanceType) -> Self {
            Self { callee, balance }
        }
    }

    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        Forbidden,
        NotFound,
    }

    #[ink(event)]
    pub struct Submission {
        #[ink(topic)]
        req_id: RequestId,
    }

    #[ink(event)]
    pub struct Confirmation {
        #[ink(topic)]
        req_id: RequestId,
    }

    #[ink(storage)]
    pub struct Tubbly {
        owner: AccountId,
        balances: Mapping<AccountId, BalanceType>,
        requests: Mapping<RequestId, Request>,
        next_id: RequestId,
    }

    impl Tubbly {
        #[ink(constructor)]
        pub fn new() -> Self {
            let owner = Self::env().caller();
            let balances = Mapping::default();
            let requests = Mapping::default();
            let next_id = RequestId::default();
            Self {
                owner,
                balances,
                requests,
                next_id,
            }
        }

        #[ink(message)]
        pub fn submit(&mut self, balance: BalanceType) -> RequestId {
            let req_id = self.next_id;
            self.next_id = self.next_id.checked_add(1).expect("Request ids exhausted.");

            let callee = self.env().caller();
            let request = Request::new(callee, balance);
            self.requests.insert(req_id, &request);

            self.env().emit_event(Submission { req_id });

            req_id
        }

        #[ink(message)]
        pub fn confirm(&mut self, req_id: RequestId) -> Result<BalanceType, Error> {
            let from = self.env().caller();
            if from != self.owner {
                return Err(Error::Forbidden);
            }

            let request = self.take_request(req_id).expect("Wrong request id.");

            self.balances.insert(request.callee, &request.balance);

            self.env().emit_event(Confirmation { req_id });

            Ok(request.balance)
        }

        #[ink(message)]
        pub fn request_of(&self, req_id: RequestId) -> Result<Request, Error> {
            let from = self.env().caller();
            if from != self.owner {
                return Err(Error::Forbidden);
            }

            let request = self.requests.get(req_id).expect("Wrong request id");

            Ok(request)
        }

        #[ink(message)]
        pub fn balance_of(&self, owner: AccountId) -> BalanceType {
            self.balances.get(owner).unwrap_or_default()
        }

        fn take_request(&mut self, req_id: RequestId) -> Option<Request> {
            let request = self.requests.get(req_id);
            if request.is_some() {
                self.requests.remove(req_id);
            }
            request
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        use ink::env::test;

        fn set_caller(sender: AccountId) {
            test::set_caller::<Environment>(sender);
        }

        fn set_from_owner() {
            set_caller(default_accounts().alice);
        }

        fn set_from_no_owner() {
            set_caller(default_accounts().bob);
        }

        fn default_accounts() -> test::DefaultAccounts<Environment> {
            test::default_accounts::<Environment>()
        }

        #[ink::test]
        fn construction_works() {
            let tubbly = Tubbly::new();

            let accounts = default_accounts();

            assert_eq!(tubbly.owner, accounts.alice);
            assert_eq!(tubbly.next_id, RequestId::default());
        }

        #[ink::test]
        fn submit_works() {
            let mut tubbly = Tubbly::new();

            let accounts = default_accounts();

            let req_id = tubbly.submit(100);

            let request = tubbly.requests.get(req_id);
            assert!(request.is_some());

            let req = request.unwrap();
            assert_eq!(req.callee, accounts.alice);
            assert_eq!(req.balance, 100);
        }

        #[ink::test]
        #[should_panic]
        fn submit_fails() {
            let mut tubbly = Tubbly::new();

            tubbly.next_id = RequestId::MAX;

            tubbly.submit(100);
        }

        #[ink::test]
        fn next_id_works() {
            let mut tubbly = Tubbly::new();

            let req_id_0 = tubbly.submit(100);
            let req_id_1 = tubbly.submit(200);
            let req_id_2 = tubbly.submit(300);

            assert_eq!(req_id_0, 0);
            assert_eq!(req_id_1, 1);
            assert_eq!(req_id_2, 2);
        }

        #[ink::test]
        fn confirm_works() {
            let mut tubbly = Tubbly::new();

            let accounts = default_accounts();

            set_from_no_owner();

            let req_id = tubbly.submit(100);

            let request = tubbly.requests.get(req_id);
            assert!(request.is_some());

            let req = request.unwrap();
            assert_eq!(req.callee, accounts.bob);
            assert_eq!(req.balance, 100);

            set_from_owner();

            assert!(tubbly.confirm(req_id).is_ok());
        }

        #[ink::test]
        fn confirm_permission_denied() {
            let mut tubbly = Tubbly::new();

            set_from_no_owner();

            assert_eq!(tubbly.confirm(0), Err(Error::Forbidden));
        }

        #[ink::test]
        #[should_panic]
        fn confirm_fails() {
            let mut tubbly = Tubbly::new();

            assert!(tubbly.confirm(1).is_ok());
        }

        #[ink::test]
        fn balance_of_works() {
            let mut tubbly = Tubbly::new();

            let accounts = default_accounts();

            assert_eq!(tubbly.balance_of(accounts.bob), 0);

            set_from_no_owner();

            let req_id = tubbly.submit(100);

            let request = tubbly.requests.get(req_id);
            assert!(request.is_some());

            let req = request.unwrap();
            assert_eq!(req.callee, accounts.bob);
            assert_eq!(req.balance, 100);

            set_from_owner();

            assert!(tubbly.confirm(req_id).is_ok());

            assert_eq!(tubbly.balance_of(accounts.bob), 100);
        }
    }
}
