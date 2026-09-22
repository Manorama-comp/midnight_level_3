# Product Idea Submission (Level 3)

## 1. What the product is and who uses it
The product is a Private Voting decentralized application (dApp) designed to allow eligible participants to cast their votes on proposals anonymously. 
It can be used by DAOs, corporate governance boards, and community organizations where voter privacy, fairness, and a publicly verifiable outcome are essential.

## 2. Why Midnight specifically
Midnight provides native zero-knowledge (ZK) capabilities with a data-protection first design paradigm. 
Traditional blockchains make all state changes public, which inherently exposes voter identity and their choices. 
Midnight allows us to compute a ZK proof that a vote is valid (from an eligible user who hasn't voted yet) and increment the tally, all without revealing the specific user's identity or linking their transaction to the choice made.

## 3. The data model of public state vs private witness vs disclosure
- **Public State:** 
  - The aggregate tally of 'Yes' and 'No' votes.
  - The total number of participants who have voted.
  - A hashed list or Merkle root of eligible voter nullifiers.
- **Private Witness:** 
  - The voter's local invitation code (used to prove eligibility).
  - The specific choice (the `local_secret_vote`).
- **Disclosure:** 
  - A zero-knowledge proof that the voter belongs to the eligible set and has not previously voted.
  - The increment of the public tally is disclosed without leaking the individual voter's choice or identity.

## 4. Mainnet scope by Level 6
By Level 6 (Mainnet launch), the dApp will feature:
- A fully polished frontend integrated with the Midnight wallet for seamless user experience.
- Completely decentralized identity verification to construct the allowlist.
- Support for multiple concurrent voting proposals.
- Advanced auditing capabilities and comprehensive error handling.
- A fully deployed and stress-tested production contract on the Midnight Mainnet.
