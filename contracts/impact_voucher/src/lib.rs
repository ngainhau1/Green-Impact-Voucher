#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, Address, Env, String,
};

const DAY_IN_LEDGERS: u32 = 17_280;
const INSTANCE_TTL: u32 = 7 * DAY_IN_LEDGERS;
const INSTANCE_THRESHOLD: u32 = 6 * DAY_IN_LEDGERS;
const PERSISTENT_TTL: u32 = 90 * DAY_IN_LEDGERS;
const PERSISTENT_THRESHOLD: u32 = 89 * DAY_IN_LEDGERS;

#[contracttype]
pub enum DataKey {
    Admin,
    VoucherCount,
    Project(u32),
    Voucher(u64),
    Holding(u32, Address),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Project {
    pub owner: Address,
    pub title: String,
    pub impact_unit: String,
    pub metadata_hash: String,
    pub report_hash: String,
    pub payment_token: Address,
    pub price_per_voucher: i128,
    pub unit_per_voucher: u32,
    pub verification_deadline: u64,
    pub vouchers_sold: u32,
    pub funded_amount: i128,
    pub withdrawn_amount: i128,
    pub refunded_amount: i128,
    pub verified_units: u32,
    pub retired_units: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Voucher {
    pub id: u64,
    pub project_id: u32,
    pub owner: Address,
    pub quantity: u32,
    pub impact_units: u32,
    pub paid_amount: i128,
    pub retired: bool,
    pub refunded: bool,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Holding {
    pub vouchers_owned: u32,
    pub active_vouchers: u32,
    pub retired_vouchers: u32,
    pub refunded_vouchers: u32,
    pub active_units: u32,
    pub retired_units: u32,
    pub refunded_units: u32,
    pub paid_amount: i128,
    pub refunded_amount: i128,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ContractError {
    InvalidInput = 1,
    ProjectExists = 2,
    ProjectNotFound = 3,
    VoucherNotFound = 4,
    NotAuthorized = 5,
    NotVoucherOwner = 6,
    AlreadyRetired = 7,
    ImpactNotVerified = 8,
    InsufficientVaultBalance = 9,
    ArithmeticOverflow = 10,
    VerificationDeadlineNotReached = 11,
    AlreadyRefunded = 12,
    ProjectAlreadyVerified = 13,
}

#[contractevent(topics = ["project"], data_format = "single-value")]
pub struct ProjectCreated {
    #[topic]
    pub owner: Address,
    #[topic]
    pub project_id: u32,
    pub funded_amount: i128,
}

#[contractevent(topics = ["buy"], data_format = "single-value")]
pub struct VoucherBought {
    #[topic]
    pub buyer: Address,
    #[topic]
    pub project_id: u32,
    pub voucher_id: u64,
}

#[contractevent(topics = ["verify"], data_format = "single-value")]
pub struct ProjectVerified {
    #[topic]
    pub verifier: Address,
    #[topic]
    pub project_id: u32,
    pub verified_units: u32,
}

#[contractevent(topics = ["retire"], data_format = "single-value")]
pub struct VoucherRetired {
    #[topic]
    pub owner: Address,
    #[topic]
    pub project_id: u32,
    pub voucher_id: u64,
}

#[contractevent(topics = ["withdraw"], data_format = "single-value")]
pub struct FundsWithdrawn {
    #[topic]
    pub owner: Address,
    #[topic]
    pub project_id: u32,
    pub amount: i128,
}

#[contractevent(topics = ["refund"], data_format = "single-value")]
pub struct VoucherRefunded {
    #[topic]
    pub owner: Address,
    #[topic]
    pub project_id: u32,
    #[topic]
    pub voucher_id: u64,
    pub amount: i128,
}

#[contractevent(topics = ["admin"], data_format = "single-value")]
pub struct AdminChanged {
    #[topic]
    pub previous_admin: Address,
    #[topic]
    pub new_admin: Address,
    pub changed_at: u64,
}

#[contract]
pub struct ImpactVoucherContract;

#[contractimpl]
impl ImpactVoucherContract {
    pub fn __constructor(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::VoucherCount, &0_u64);
        extend_instance_ttl(&env);
    }

    pub fn admin(env: Env) -> Address {
        read_admin(&env)
    }

    pub fn set_admin(
        env: Env,
        current_admin: Address,
        new_admin: Address,
    ) -> Result<(), ContractError> {
        current_admin.require_auth();

        let admin = read_admin(&env);
        if current_admin != admin {
            return Err(ContractError::NotAuthorized);
        }

        env.storage().instance().set(&DataKey::Admin, &new_admin);
        extend_instance_ttl(&env);
        AdminChanged {
            previous_admin: current_admin,
            new_admin,
            changed_at: env.ledger().timestamp(),
        }
        .publish(&env);

        Ok(())
    }

    pub fn create_project(
        env: Env,
        owner: Address,
        project_id: u32,
        title: String,
        impact_unit: String,
        price_per_voucher: i128,
        unit_per_voucher: u32,
        payment_token: Address,
        metadata_hash: String,
        verification_deadline: u64,
    ) -> Result<(), ContractError> {
        owner.require_auth();

        if project_id == 0
            || price_per_voucher <= 0
            || unit_per_voucher == 0
            || title.len() == 0
            || impact_unit.len() == 0
            || metadata_hash.len() == 0
            || verification_deadline <= env.ledger().timestamp()
        {
            return Err(ContractError::InvalidInput);
        }

        let project_key = DataKey::Project(project_id);
        if env.storage().persistent().has(&project_key) {
            return Err(ContractError::ProjectExists);
        }

        let project = Project {
            owner: owner.clone(),
            title,
            impact_unit,
            metadata_hash,
            report_hash: String::from_str(&env, ""),
            payment_token,
            price_per_voucher,
            unit_per_voucher,
            verification_deadline,
            vouchers_sold: 0,
            funded_amount: 0,
            withdrawn_amount: 0,
            refunded_amount: 0,
            verified_units: 0,
            retired_units: 0,
        };

        env.storage().persistent().set(&project_key, &project);
        extend_persistent_ttl(&env, &project_key);
        extend_instance_ttl(&env);
        ProjectCreated {
            owner,
            project_id,
            funded_amount: project.funded_amount,
        }
        .publish(&env);

        Ok(())
    }

    pub fn buy_voucher(
        env: Env,
        buyer: Address,
        project_id: u32,
        quantity: u32,
    ) -> Result<u64, ContractError> {
        buyer.require_auth();
        if quantity == 0 {
            return Err(ContractError::InvalidInput);
        }

        let project_key = DataKey::Project(project_id);
        let mut project = read_project(&env, project_id)?;
        let quantity_i128 = quantity as i128;
        let paid_amount = project
            .price_per_voucher
            .checked_mul(quantity_i128)
            .ok_or(ContractError::ArithmeticOverflow)?;
        let impact_units = project
            .unit_per_voucher
            .checked_mul(quantity)
            .ok_or(ContractError::ArithmeticOverflow)?;

        token::Client::new(&env, &project.payment_token).transfer(
            &buyer,
            &env.current_contract_address(),
            &paid_amount,
        );

        let voucher_id = next_voucher_id(&env)?;
        let voucher = Voucher {
            id: voucher_id,
            project_id,
            owner: buyer.clone(),
            quantity,
            impact_units,
            paid_amount,
            retired: false,
            refunded: false,
            created_at: env.ledger().timestamp(),
        };

        project.vouchers_sold = project
            .vouchers_sold
            .checked_add(quantity)
            .ok_or(ContractError::ArithmeticOverflow)?;
        project.funded_amount = project
            .funded_amount
            .checked_add(paid_amount)
            .ok_or(ContractError::ArithmeticOverflow)?;

        let voucher_key = DataKey::Voucher(voucher_id);
        env.storage().persistent().set(&voucher_key, &voucher);
        extend_persistent_ttl(&env, &voucher_key);

        env.storage().persistent().set(&project_key, &project);
        extend_persistent_ttl(&env, &project_key);

        let holding_key = DataKey::Holding(project_id, buyer.clone());
        let mut holding = read_holding_or_empty(&env, project_id, buyer.clone());
        holding.vouchers_owned = holding
            .vouchers_owned
            .checked_add(quantity)
            .ok_or(ContractError::ArithmeticOverflow)?;
        holding.active_vouchers = holding
            .active_vouchers
            .checked_add(quantity)
            .ok_or(ContractError::ArithmeticOverflow)?;
        holding.active_units = holding
            .active_units
            .checked_add(impact_units)
            .ok_or(ContractError::ArithmeticOverflow)?;
        holding.paid_amount = holding
            .paid_amount
            .checked_add(paid_amount)
            .ok_or(ContractError::ArithmeticOverflow)?;
        env.storage().persistent().set(&holding_key, &holding);
        extend_persistent_ttl(&env, &holding_key);
        extend_instance_ttl(&env);

        VoucherBought {
            buyer,
            project_id,
            voucher_id,
        }
        .publish(&env);

        Ok(voucher_id)
    }

    pub fn verify_project(
        env: Env,
        verifier: Address,
        project_id: u32,
        verified_units: u32,
        report_hash: String,
    ) -> Result<(), ContractError> {
        verifier.require_auth();
        if verified_units == 0 || report_hash.len() == 0 {
            return Err(ContractError::InvalidInput);
        }

        let admin = read_admin(&env);
        let project_key = DataKey::Project(project_id);
        let mut project = read_project(&env, project_id)?;

        if verifier != admin && verifier != project.owner {
            return Err(ContractError::NotAuthorized);
        }
        if verified_units < project.verified_units {
            return Err(ContractError::InvalidInput);
        }

        project.verified_units = verified_units;
        project.report_hash = report_hash;
        env.storage().persistent().set(&project_key, &project);
        extend_persistent_ttl(&env, &project_key);
        extend_instance_ttl(&env);

        ProjectVerified {
            verifier,
            project_id,
            verified_units: project.verified_units,
        }
        .publish(&env);

        Ok(())
    }

    pub fn retire_voucher(env: Env, owner: Address, voucher_id: u64) -> Result<(), ContractError> {
        owner.require_auth();

        let voucher_key = DataKey::Voucher(voucher_id);
        let mut voucher: Voucher = env
            .storage()
            .persistent()
            .get(&voucher_key)
            .ok_or(ContractError::VoucherNotFound)?;

        if voucher.owner != owner {
            return Err(ContractError::NotVoucherOwner);
        }
        if voucher.retired {
            return Err(ContractError::AlreadyRetired);
        }
        if voucher.refunded {
            return Err(ContractError::AlreadyRefunded);
        }

        let project_key = DataKey::Project(voucher.project_id);
        let mut project = read_project(&env, voucher.project_id)?;
        let next_retired = project
            .retired_units
            .checked_add(voucher.impact_units)
            .ok_or(ContractError::ArithmeticOverflow)?;
        if next_retired > project.verified_units {
            return Err(ContractError::ImpactNotVerified);
        }

        voucher.retired = true;
        project.retired_units = next_retired;

        let holding_key = DataKey::Holding(voucher.project_id, owner.clone());
        let mut holding = read_holding_or_empty(&env, voucher.project_id, owner.clone());
        if holding.active_vouchers < voucher.quantity || holding.active_units < voucher.impact_units
        {
            return Err(ContractError::InvalidInput);
        }
        holding.active_vouchers -= voucher.quantity;
        holding.retired_vouchers = holding
            .retired_vouchers
            .checked_add(voucher.quantity)
            .ok_or(ContractError::ArithmeticOverflow)?;
        holding.active_units -= voucher.impact_units;
        holding.retired_units = holding
            .retired_units
            .checked_add(voucher.impact_units)
            .ok_or(ContractError::ArithmeticOverflow)?;

        env.storage().persistent().set(&voucher_key, &voucher);
        env.storage().persistent().set(&project_key, &project);
        env.storage().persistent().set(&holding_key, &holding);
        extend_persistent_ttl(&env, &voucher_key);
        extend_persistent_ttl(&env, &project_key);
        extend_persistent_ttl(&env, &holding_key);

        VoucherRetired {
            owner,
            project_id: voucher.project_id,
            voucher_id,
        }
        .publish(&env);

        Ok(())
    }

    pub fn refund_voucher(env: Env, owner: Address, voucher_id: u64) -> Result<(), ContractError> {
        owner.require_auth();

        let voucher_key = DataKey::Voucher(voucher_id);
        let mut voucher: Voucher = env
            .storage()
            .persistent()
            .get(&voucher_key)
            .ok_or(ContractError::VoucherNotFound)?;

        if voucher.owner != owner {
            return Err(ContractError::NotVoucherOwner);
        }
        if voucher.retired {
            return Err(ContractError::AlreadyRetired);
        }
        if voucher.refunded {
            return Err(ContractError::AlreadyRefunded);
        }

        let project_key = DataKey::Project(voucher.project_id);
        let mut project = read_project(&env, voucher.project_id)?;
        if project.verified_units > 0 {
            return Err(ContractError::ProjectAlreadyVerified);
        }
        if env.ledger().timestamp() <= project.verification_deadline {
            return Err(ContractError::VerificationDeadlineNotReached);
        }

        let available = project
            .funded_amount
            .checked_sub(project.withdrawn_amount)
            .ok_or(ContractError::ArithmeticOverflow)?
            .checked_sub(project.refunded_amount)
            .ok_or(ContractError::ArithmeticOverflow)?;
        if voucher.paid_amount > available {
            return Err(ContractError::InsufficientVaultBalance);
        }

        let holding_key = DataKey::Holding(voucher.project_id, owner.clone());
        let mut holding = read_holding_or_empty(&env, voucher.project_id, owner.clone());
        if holding.active_vouchers < voucher.quantity || holding.active_units < voucher.impact_units
        {
            return Err(ContractError::InvalidInput);
        }

        token::Client::new(&env, &project.payment_token).transfer(
            &env.current_contract_address(),
            &owner,
            &voucher.paid_amount,
        );

        voucher.refunded = true;
        project.refunded_amount = project
            .refunded_amount
            .checked_add(voucher.paid_amount)
            .ok_or(ContractError::ArithmeticOverflow)?;

        holding.active_vouchers -= voucher.quantity;
        holding.refunded_vouchers = holding
            .refunded_vouchers
            .checked_add(voucher.quantity)
            .ok_or(ContractError::ArithmeticOverflow)?;
        holding.active_units -= voucher.impact_units;
        holding.refunded_units = holding
            .refunded_units
            .checked_add(voucher.impact_units)
            .ok_or(ContractError::ArithmeticOverflow)?;
        holding.refunded_amount = holding
            .refunded_amount
            .checked_add(voucher.paid_amount)
            .ok_or(ContractError::ArithmeticOverflow)?;

        env.storage().persistent().set(&voucher_key, &voucher);
        env.storage().persistent().set(&project_key, &project);
        env.storage().persistent().set(&holding_key, &holding);
        extend_persistent_ttl(&env, &voucher_key);
        extend_persistent_ttl(&env, &project_key);
        extend_persistent_ttl(&env, &holding_key);
        extend_instance_ttl(&env);

        VoucherRefunded {
            owner,
            project_id: voucher.project_id,
            voucher_id,
            amount: voucher.paid_amount,
        }
        .publish(&env);

        Ok(())
    }

    pub fn withdraw_funds(
        env: Env,
        owner: Address,
        project_id: u32,
        amount: i128,
    ) -> Result<(), ContractError> {
        owner.require_auth();
        if amount <= 0 {
            return Err(ContractError::InvalidInput);
        }

        let project_key = DataKey::Project(project_id);
        let mut project = read_project(&env, project_id)?;
        if project.owner != owner {
            return Err(ContractError::NotAuthorized);
        }
        if project.verified_units == 0 {
            return Err(ContractError::ImpactNotVerified);
        }

        let available = project
            .funded_amount
            .checked_sub(project.withdrawn_amount)
            .ok_or(ContractError::ArithmeticOverflow)?
            .checked_sub(project.refunded_amount)
            .ok_or(ContractError::ArithmeticOverflow)?;
        if amount > available {
            return Err(ContractError::InsufficientVaultBalance);
        }

        token::Client::new(&env, &project.payment_token).transfer(
            &env.current_contract_address(),
            &owner,
            &amount,
        );

        project.withdrawn_amount = project
            .withdrawn_amount
            .checked_add(amount)
            .ok_or(ContractError::ArithmeticOverflow)?;
        env.storage().persistent().set(&project_key, &project);
        extend_persistent_ttl(&env, &project_key);

        FundsWithdrawn {
            owner,
            project_id,
            amount,
        }
        .publish(&env);

        Ok(())
    }

    pub fn project(env: Env, project_id: u32) -> Result<Project, ContractError> {
        read_project(&env, project_id)
    }

    pub fn voucher(env: Env, voucher_id: u64) -> Result<Voucher, ContractError> {
        env.storage()
            .persistent()
            .get(&DataKey::Voucher(voucher_id))
            .ok_or(ContractError::VoucherNotFound)
    }

    pub fn holding(env: Env, project_id: u32, owner: Address) -> Holding {
        read_holding_or_empty(&env, project_id, owner)
    }
}

fn read_admin(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Admin).unwrap()
}

fn read_project(env: &Env, project_id: u32) -> Result<Project, ContractError> {
    env.storage()
        .persistent()
        .get(&DataKey::Project(project_id))
        .ok_or(ContractError::ProjectNotFound)
}

fn read_holding_or_empty(env: &Env, project_id: u32, owner: Address) -> Holding {
    env.storage()
        .persistent()
        .get(&DataKey::Holding(project_id, owner))
        .unwrap_or(Holding {
            vouchers_owned: 0,
            active_vouchers: 0,
            retired_vouchers: 0,
            refunded_vouchers: 0,
            active_units: 0,
            retired_units: 0,
            refunded_units: 0,
            paid_amount: 0,
            refunded_amount: 0,
        })
}

fn next_voucher_id(env: &Env) -> Result<u64, ContractError> {
    let next = env
        .storage()
        .instance()
        .get(&DataKey::VoucherCount)
        .unwrap_or(0_u64)
        .checked_add(1)
        .ok_or(ContractError::ArithmeticOverflow)?;
    env.storage().instance().set(&DataKey::VoucherCount, &next);
    Ok(next)
}

fn extend_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_THRESHOLD, INSTANCE_TTL);
}

fn extend_persistent_ttl(env: &Env, key: &DataKey) {
    env.storage()
        .persistent()
        .extend_ttl(key, PERSISTENT_THRESHOLD, PERSISTENT_TTL);
}

mod test;
