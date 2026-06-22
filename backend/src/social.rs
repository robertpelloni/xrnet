use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use bellman::{Circuit, ConstraintSystem, SynthesisError};
use bls12_381::{Bls12, Scalar};

use bellman::groth16::{
    generate_random_parameters, prepare_verifying_key, Parameters
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InterestProfile {
    pub hashed_interests: Vec<String>,
}

#[derive(Clone)]
struct MatchmakingCircuit {
    pub secret_interest: Option<Scalar>,
}

impl Circuit<Scalar> for MatchmakingCircuit {
    fn synthesize<CS: ConstraintSystem<Scalar>>(
        self,
        cs: &mut CS,
    ) -> Result<(), SynthesisError> {
        // Simple mock circuit: prove knowledge of a secret such that secret * secret = public_hash
        // This is a placeholder for actual interest hash verification
        let secret_value = cs.alloc(
            || "secret interest",
            || self.secret_interest.ok_or(SynthesisError::AssignmentMissing),
        )?;

        let squared_value = cs.alloc(
            || "squared interest",
            || {
                let mut v = self.secret_interest.ok_or(SynthesisError::AssignmentMissing)?;
                let temp = v;
                v *= &temp;
                Ok(v)
            },
        )?;

        // Enforce secret * secret = squared
        cs.enforce(
            || "squaring",
            |lc| lc + secret_value,
            |lc| lc + secret_value,
            |lc| lc + squared_value,
        );

        Ok(())
    }
}

pub struct MatchmakingEngine;

impl MatchmakingEngine {
    pub fn hash_interest(interest: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(interest.to_lowercase().trim());
        format!("{:x}", hasher.finalize())
    }

    pub fn find_matches(my_profile: &InterestProfile, other_profile: &InterestProfile) -> Vec<String> {
        my_profile.hashed_interests.iter()
            .filter(|i| other_profile.hashed_interests.contains(i))
            .cloned()
            .collect()
    }

    pub fn generate_zk_parameters() -> Parameters<Bls12> {
        let mut rng = rand::thread_rng();
        let params = generate_random_parameters::<Bls12, _, _>(
            MatchmakingCircuit { secret_interest: None },
            &mut rng,
        ).unwrap();
        params
    }

    // A simulated ZK-Proof verification for matching
    pub fn verify_zk_match(
        params: &Parameters<Bls12>,
        _interest_hash: &str,
    ) -> bool {
        // In a real scenario, the proof would be passed and verified.
        // Here we simulate the verification of a generated proof.
        let _pvk = prepare_verifying_key(&params.vk);

        // Mock proof and verification
        true
    }
}
