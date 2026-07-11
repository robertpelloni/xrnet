import re

with open('backend/src/escrow.rs', 'r') as f:
    content = f.read()

if 'Arbitrated(bool)' not in content:
    content = content.replace(
        'Refunded,\n}',
        'Refunded,\n    Arbitrated(bool),\n}'
    )

if 'resolve_dispute' not in content:
    content = content.replace(
        '}\n}',
        '''    pub fn resolve_dispute(&mut self, id: &str, release_to_payee: bool) -> bool {
        if let Some(tx) = self.transactions.get_mut(id) {
            if tx.status == EscrowStatus::Disputed {
                tx.status = EscrowStatus::Arbitrated(release_to_payee);
                return true;
            }
        }
        false
    }
}'''
    )

with open('backend/src/escrow.rs', 'w') as f:
    f.write(content)

with open('backend/src/api/escrow.rs', 'r') as f:
    content = f.read()

if 'resolve_dispute' not in content:
    content = content.replace(
        '}\n}',
        '''        .route("/api/escrow/resolve/:id", post({
            let s = Arc::clone(&state);
            move |Path(id): Path<String>, Json(payload): Json<serde_json::Value>| async move {
                let release_to_payee = payload["release_to_payee"].as_bool().unwrap_or(false);
                let mut escrow = s.escrow_manager.lock().unwrap();
                let success = escrow.resolve_dispute(&id, release_to_payee);
                Json(json!({ "success": success }))
            }
        }))
}'''
    )

with open('backend/src/api/escrow.rs', 'w') as f:
    f.write(content)
