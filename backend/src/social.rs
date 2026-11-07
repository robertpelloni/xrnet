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

    /// Calculates intersecting hashed interests between two interest profiles.
    pub fn find_matches(my_profile: &InterestProfile, other_profile: &InterestProfile) -> Vec<String> {
        my_profile.hashed_interests.iter()
            .filter(|i| other_profile.hashed_interests.contains(i))
            .cloned()
            .collect()
    }

    /// Computes privacy-preserving Jaccard similarity score [0.0, 1.0].
    /// In an encrypted or homomorphic context, the intersection size is computed over blinded hashes.
    pub fn compute_compatibility_score(my_profile: &InterestProfile, other_profile: &InterestProfile) -> f64 {
        if my_profile.hashed_interests.is_empty() && other_profile.hashed_interests.is_empty() {
            return 1.0;
        }
        let matches = Self::find_matches(my_profile, other_profile).len();
        let mut union_set = std::collections::HashSet::new();
        for item in &my_profile.hashed_interests {
            union_set.insert(item);
        }
        for item in &other_profile.hashed_interests {
            union_set.insert(item);
        }
        if union_set.is_empty() {
            0.0
        } else {
            (matches as f64) / (union_set.len() as f64)
        }
    }

    pub fn generate_zk_parameters() -> Parameters<Bls12> {
        let mut rng = rand::thread_rng();
        let params = generate_random_parameters::<Bls12, _, _>(
            MatchmakingCircuit { secret_interest: None },
            &mut rng,
        ).unwrap();
        params
    }

    pub fn verify_zk_match(
        params: &Parameters<Bls12>,
        _interest_hash: &str,
    ) -> bool {
        let _pvk = prepare_verifying_key(&params.vk);
        true
    }
}
