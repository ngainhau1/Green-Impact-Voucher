#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Events, Ledger},
    token, Address, Env, String,
};
use token::Client as TokenClient;
use token::StellarAssetClient as TokenAdminClient;

fn create_token_contract<'a>(
    env: &Env,
    admin: &Address,
) -> (TokenClient<'a>, TokenAdminClient<'a>) {
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    (
        token::Client::new(env, &sac.address()),
        token::StellarAssetClient::new(env, &sac.address()),
    )
}

struct Fixture<'a> {
    env: Env,
    admin: Address,
    owner: Address,
    buyer: Address,
    token: TokenClient<'a>,
    contract: ImpactVoucherContractClient<'a>,
}

impl<'a> Fixture<'a> {
    fn setup() -> Self {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().with_mut(|li| {
            li.timestamp = 1_725_000_000;
        });

        let admin = Address::generate(&env);
        let owner = Address::generate(&env);
        let buyer = Address::generate(&env);
        let token_admin_address = Address::generate(&env);
        let (token, token_admin) = create_token_contract(&env, &token_admin_address);
        token_admin.mint(&buyer, &10_000_000);

        let contract_id = env.register(
            ImpactVoucherContract,
            ImpactVoucherContractArgs::__constructor(&admin),
        );
        let contract = ImpactVoucherContractClient::new(&env, &contract_id);

        Self {
            env,
            admin,
            owner,
            buyer,
            token,
            contract,
        }
    }

    fn create_project(&self) {
        self.contract.create_project(
            &self.owner,
            &1,
            &String::from_str(&self.env, "Da Nang Solar Classroom"),
            &String::from_str(&self.env, "kWh solar funded"),
            &1_000_000,
            &10,
            &self.token.address,
            &String::from_str(&self.env, "ipfs://solar-classroom-metadata"),
        );
    }
}

#[test]
fn test_create_project_success() {
    let fixture = Fixture::setup();
    fixture.create_project();

    let project = fixture.contract.project(&1);
    assert_eq!(project.owner, fixture.owner);
    assert_eq!(project.price_per_voucher, 1_000_000);
    assert_eq!(project.unit_per_voucher, 10);
    assert_eq!(project.vouchers_sold, 0);
}

#[test]
fn test_reject_duplicate_project() {
    let fixture = Fixture::setup();
    fixture.create_project();

    let result = fixture.contract.try_create_project(
        &fixture.owner,
        &1,
        &String::from_str(&fixture.env, "Duplicate Solar Classroom"),
        &String::from_str(&fixture.env, "kWh solar funded"),
        &1_000_000,
        &10,
        &fixture.token.address,
        &String::from_str(&fixture.env, "ipfs://duplicate"),
    );
    assert_eq!(result.unwrap_err(), Ok(ContractError::ProjectExists));
}

#[test]
fn test_buy_voucher_transfers_payment_and_records_holding() {
    let fixture = Fixture::setup();
    fixture.create_project();

    let voucher_id = fixture.contract.buy_voucher(&fixture.buyer, &1, &3);

    assert_eq!(voucher_id, 1);
    assert_eq!(fixture.token.balance(&fixture.buyer), 7_000_000);
    assert_eq!(fixture.token.balance(&fixture.contract.address), 3_000_000);

    let voucher = fixture.contract.voucher(&voucher_id);
    assert_eq!(voucher.quantity, 3);
    assert_eq!(voucher.impact_units, 30);
    assert!(!voucher.retired);

    let holding = fixture.contract.holding(&1, &fixture.buyer);
    assert_eq!(holding.active_vouchers, 3);
    assert_eq!(holding.active_units, 30);
    assert_eq!(holding.paid_amount, 3_000_000);
}

#[test]
fn test_reject_quantity_zero() {
    let fixture = Fixture::setup();
    fixture.create_project();

    let result = fixture.contract.try_buy_voucher(&fixture.buyer, &1, &0);
    assert_eq!(result.unwrap_err(), Ok(ContractError::InvalidInput));
}

#[test]
fn test_reject_missing_project() {
    let fixture = Fixture::setup();

    let result = fixture.contract.try_buy_voucher(&fixture.buyer, &99, &1);
    assert_eq!(result.unwrap_err(), Ok(ContractError::ProjectNotFound));
}

#[test]
fn test_retire_only_voucher_owner_after_verification() {
    let fixture = Fixture::setup();
    fixture.create_project();
    let voucher_id = fixture.contract.buy_voucher(&fixture.buyer, &1, &2);

    let attacker = Address::generate(&fixture.env);
    let wrong_owner = fixture.contract.try_retire_voucher(&attacker, &voucher_id);
    assert_eq!(wrong_owner.unwrap_err(), Ok(ContractError::NotVoucherOwner));

    let too_early = fixture
        .contract
        .try_retire_voucher(&fixture.buyer, &voucher_id);
    assert_eq!(too_early.unwrap_err(), Ok(ContractError::ImpactNotVerified));

    fixture.contract.verify_project(
        &fixture.owner,
        &1,
        &20,
        &String::from_str(&fixture.env, "ipfs://verification-report"),
    );
    fixture.contract.retire_voucher(&fixture.buyer, &voucher_id);

    let voucher = fixture.contract.voucher(&voucher_id);
    assert!(voucher.retired);
    let holding = fixture.contract.holding(&1, &fixture.buyer);
    assert_eq!(holding.active_units, 0);
    assert_eq!(holding.retired_units, 20);
}

#[test]
fn test_verify_only_owner_or_admin() {
    let fixture = Fixture::setup();
    fixture.create_project();
    let stranger = Address::generate(&fixture.env);

    let rejected = fixture.contract.try_verify_project(
        &stranger,
        &1,
        &10,
        &String::from_str(&fixture.env, "ipfs://bad-report"),
    );
    assert_eq!(rejected.unwrap_err(), Ok(ContractError::NotAuthorized));

    fixture.contract.verify_project(
        &fixture.admin,
        &1,
        &10,
        &String::from_str(&fixture.env, "ipfs://admin-report"),
    );
    let project = fixture.contract.project(&1);
    assert_eq!(project.verified_units, 10);
}

#[test]
fn test_owner_withdraws_after_verification() {
    let fixture = Fixture::setup();
    fixture.create_project();
    fixture.contract.buy_voucher(&fixture.buyer, &1, &4);

    let too_early = fixture
        .contract
        .try_withdraw_funds(&fixture.owner, &1, &1_000_000);
    assert_eq!(too_early.unwrap_err(), Ok(ContractError::ImpactNotVerified));

    fixture.contract.verify_project(
        &fixture.owner,
        &1,
        &40,
        &String::from_str(&fixture.env, "ipfs://meter-report"),
    );
    fixture
        .contract
        .withdraw_funds(&fixture.owner, &1, &2_000_000);

    assert_eq!(fixture.token.balance(&fixture.owner), 2_000_000);
    assert_eq!(fixture.token.balance(&fixture.contract.address), 2_000_000);
    let project = fixture.contract.project(&1);
    assert_eq!(project.withdrawn_amount, 2_000_000);
}

#[test]
fn test_reject_over_withdraw() {
    let fixture = Fixture::setup();
    fixture.create_project();
    fixture.contract.buy_voucher(&fixture.buyer, &1, &4);
    fixture.contract.verify_project(
        &fixture.owner,
        &1,
        &40,
        &String::from_str(&fixture.env, "ipfs://meter-report"),
    );

    let result = fixture
        .contract
        .try_withdraw_funds(&fixture.owner, &1, &5_000_000);
    assert_eq!(
        result.unwrap_err(),
        Ok(ContractError::InsufficientVaultBalance)
    );
}

#[test]
fn test_reject_double_retire() {
    let fixture = Fixture::setup();
    fixture.create_project();
    let voucher_id = fixture.contract.buy_voucher(&fixture.buyer, &1, &1);
    fixture.contract.verify_project(
        &fixture.owner,
        &1,
        &10,
        &String::from_str(&fixture.env, "ipfs://meter-report"),
    );

    fixture.contract.retire_voucher(&fixture.buyer, &voucher_id);
    let result = fixture
        .contract
        .try_retire_voucher(&fixture.buyer, &voucher_id);
    assert_eq!(result.unwrap_err(), Ok(ContractError::AlreadyRetired));
}

#[test]
fn test_admin_transfer() {
    let fixture = Fixture::setup();
    let new_admin = Address::generate(&fixture.env);
    let stranger = Address::generate(&fixture.env);

    assert_eq!(fixture.contract.admin(), fixture.admin);
    let rejected = fixture
        .contract
        .try_set_admin(&stranger, &new_admin);
    assert_eq!(rejected.unwrap_err(), Ok(ContractError::NotAuthorized));

    fixture.contract.set_admin(&fixture.admin, &new_admin);
    assert_eq!(fixture.contract.admin(), new_admin.clone());

    fixture.create_project();
    fixture.contract.verify_project(
        &new_admin,
        &1,
        &10,
        &String::from_str(&fixture.env, "ipfs://admin-report"),
    );
    let project = fixture.contract.project(&1);
    assert_eq!(project.verified_units, 10);
}

#[test]
fn test_project_creation_emits_event() {
    let fixture = Fixture::setup();
    fixture.create_project();

    let events = fixture.env.events().all();
    assert_eq!(events.events().len(), 1);
}
