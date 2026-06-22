use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum EscrowStatus {
    Pending,
    Funded,
    Completed,
    Disputed,
    Refunded,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EscrowTransaction {
    pub id: String,
    pub payer: String,
    pub payee: String,
    pub amount: f64,
    pub status: EscrowStatus,
    pub arbitrator: Option<String>,
}

pub struct EscrowManager {
    pub transactions: std::collections::HashMap<String, EscrowTransaction>,
}

impl EscrowManager {
    pub fn new() -> Self {
        Self { transactions: std::collections::HashMap::new() }
    }

    pub fn create_transaction(&mut self, payer: String, payee: String, amount: f64) -> String {
        let id = Uuid::new_v4().to_string();
        let tx = EscrowTransaction {
            id: id.clone(),
            payer,
            payee,
            amount,
            status: EscrowStatus::Pending,
            arbitrator: None,
        };
        self.transactions.insert(id.clone(), tx);
        id
    }

    pub fn fund(&mut self, id: &str) -> bool {
        if let Some(tx) = self.transactions.get_mut(id) {
            tx.status = EscrowStatus::Funded;
            return true;
        }
        false
    }

    pub fn release(&mut self, id: &str) -> bool {
        if let Some(tx) = self.transactions.get_mut(id) {
            if tx.status == EscrowStatus::Funded {
                tx.status = EscrowStatus::Completed;
                return true;
            }
        }
        false
    }

    pub fn dispute(&mut self, id: &str, arbitrator_id: String) -> bool {
        if let Some(tx) = self.transactions.get_mut(id) {
            if tx.status == EscrowStatus::Funded {
                tx.status = EscrowStatus::Disputed;
                tx.arbitrator = Some(arbitrator_id);
                return true;
            }
        }
        false
    }
}
