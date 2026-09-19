import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WitnessContext } from '@midnight-ntwrk/compact-runtime';

// Get __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the only folder inside ./managed
const managedPath = path.join(__dirname, 'managed');
const [folder] = fs.readdirSync(managedPath).filter(f =>
  fs.statSync(path.join(managedPath, f)).isDirectory()
);

// Dynamically import the contract
const { Ledger } = await import(`./managed/${folder}/contract/index.cjs`);


export type VotingPrivateState = {
  readonly secret_vote: boolean;
  readonly invitation_code: Uint8Array;
};

export const createVotingPrivateState = (secret_vote: boolean, invitation_code: Uint8Array) => ({
  secret_vote,
  invitation_code,
});

export const witnesses = {
  local_secret_vote: ({ privateState }: WitnessContext<typeof Ledger, VotingPrivateState>): [VotingPrivateState, boolean] => {
    return [privateState, privateState.secret_vote];
  },
  local_invitation_code: ({ privateState }: WitnessContext<typeof Ledger, VotingPrivateState>): [VotingPrivateState, Uint8Array] => {
    return [privateState, privateState.invitation_code];
  },
};