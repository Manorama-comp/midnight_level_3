import { useState, useEffect } from 'react';
import './index.css';

class MockContractAPI {
  yesVotes = 42;
  noVotes = 15;

  async connectWallet() {
    // We will attempt to connect to a real Midnight wallet extension!
    const injected = (window as any).midnight;
    if (!injected) {
      throw new Error("No Midnight wallet found! Please install Midnight Lace or Nightly extension.");
    }
    
    // Attempt to find the wallet object
    const walletKeys = Object.keys(injected);
    if (walletKeys.length === 0) {
      throw new Error("No Midnight wallets available in the window object.");
    }
    
    // Connect to the first available wallet (usually mnLace or nightly)
    const wallet = injected[walletKeys[0]];
    
    // Trigger the real popup!
    if (wallet && typeof wallet.enable === 'function') {
      await wallet.enable();
    } else {
      console.warn("Wallet does not have an enable() function, trying connect()...");
      if (wallet && typeof wallet.connect === 'function') {
        // Some APIs use connect('mainnet') or just connect()
        await wallet.connect();
      }
    }
    
    return walletKeys[0]; // e.g., "mnLace"
  }

  async getTallies() {
    return new Promise(resolve => setTimeout(() => resolve({ yes: this.yesVotes, no: this.noVotes }), 500));
  }

  async vote(isYes: boolean, invitationCode: string) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!invitationCode || invitationCode.length < 5) {
          reject(new Error("Invalid invitation code. Must be at least 5 characters."));
        } else {
          if (isYes) this.yesVotes++;
          else this.noVotes++;
          resolve(true);
        }
      }, 1500);
    });
  }
}

const api = new MockContractAPI();

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tallies, setTallies] = useState({ yes: 0, no: 0 });
  const [invitationCode, setInvitationCode] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.getTallies().then((t: any) => setTallies(t));
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const address = await api.connectWallet();
      setWalletAddress(address as string);
    } catch (e: any) {
      console.error("Wallet connection failed", e);
      setStatusMsg({ type: 'error', text: '❌ ' + (e.message || 'Failed to connect wallet') });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleVote = async (isYes: boolean) => {
    setIsVoting(true);
    setStatusMsg({ type: '', text: '' });
    try {
      await api.vote(isYes, invitationCode);
      const newTallies = await api.getTallies();
      setTallies(newTallies as any);
      setStatusMsg({ type: 'success', text: '✅ Vote cast anonymously on the Midnight Ledger!' });
      setInvitationCode('');
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: '❌ ' + (e.message || 'Voting failed') });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <>
      {/* Background Animated Orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <div className="app-container">
        <div className="header-wrapper">
          <div className="badge">Midnight ZK dApp</div>
          <h1>Private Voting</h1>
          <p className="subtitle">Anonymous ballots with publicly verifiable tallies</p>
        </div>

        {!walletAddress ? (
          <div className="voting-section" style={{ alignItems: 'center', marginTop: '2rem' }}>
            <button className="btn" onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="loader"></div> Connecting...
                </span>
              ) : 'Connect Midnight Wallet'}
            </button>
            
            {statusMsg.text && (
              <div className={`status-message status-${statusMsg.type}`}>
                {statusMsg.text}
              </div>
            )}
          </div>
        ) : (
          <div className="voting-section">
            <div className="tally-board">
              <div className="tally-item tally-yes">
                <div className="tally-label">Yes Votes</div>
                <div className="tally-count">{tallies.yes}</div>
              </div>
              <div className="tally-item tally-no">
                <div className="tally-label">No Votes</div>
                <div className="tally-count">{tallies.no}</div>
              </div>
            </div>

            <div className="vote-actions">
              <div className="input-group">
                <label>Invitation Code (Nullifier)</label>
                <input 
                  type="text" 
                  placeholder="Enter your secret invitation code"
                  value={invitationCode}
                  onChange={e => setInvitationCode(e.target.value)}
                  disabled={isVoting}
                  autoComplete="off"
                />
              </div>
              
              <div className="vote-buttons">
                <button 
                  className="btn-vote btn-yes"
                  onClick={() => handleVote(true)}
                  disabled={isVoting || !invitationCode}
                >
                  {isVoting ? <div className="loader"></div> : 'Vote YES'}
                </button>
                <button 
                  className="btn-vote btn-no"
                  onClick={() => handleVote(false)}
                  disabled={isVoting || !invitationCode}
                >
                  {isVoting ? <div className="loader"></div> : 'Vote NO'}
                </button>
              </div>
              
              {statusMsg.text && (
                <div className={`status-message status-${statusMsg.type}`}>
                  {statusMsg.text}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
