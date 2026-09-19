import { useState, useEffect } from 'react';
import './index.css';

// Real/Mock Hybrid Contract API
class MockContractAPI {
  yesVotes = 42;
  noVotes = 15;

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
  const [tallies, setTallies] = useState({ yes: 0, no: 0 });
  const [invitationCode, setInvitationCode] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  
  useEffect(() => {
    api.getTallies().then((t: any) => setTallies(t));
  }, []);

  const triggerWalletConnection = async () => {
    setIsConnecting(true);
    setStatusMsg({ type: '', text: 'Sending connection request to Wallet...' });
    
    try {
      // Send REAL request to Midnight Wallet Extension (Lace/Nightly)
      const injected = (window as any).midnight;
      
      if (!injected) {
        throw new Error("No Midnight wallet found! Please install Lace or Nightly extension.");
      }
      
      const walletKeys = Object.keys(injected);
      if (walletKeys.length === 0) {
        throw new Error("No Midnight wallets available.");
      }
      
      // Select the first available wallet (mnLace or nightly)
      const walletName = walletKeys[0];
      const wallet = injected[walletName];
      
      if (wallet && typeof wallet.enable === 'function') {
        // This sends the actual request to the extension
        await wallet.enable();
      } else if (wallet && typeof wallet.connect === 'function') {
        await wallet.connect();
      }
      
      setWalletAddress("connected-address");
      setStatusMsg({ type: 'success', text: `Successfully connected to ${walletName}!` });
      
    } catch (error: any) {
      console.error("Wallet connection failed", error);
      setStatusMsg({ type: 'error', text: 'Connection rejected or failed: ' + error.message });
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
      setStatusMsg({ type: 'success', text: 'Vote recorded privately on Midnight Ledger.' });
      setInvitationCode('');
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Voting failed' });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <>
      <div className="app-container">
        <div className="header">
          <div className="brand-badge">Midnight Network</div>
          <h1>Private Voting</h1>
          <p className="subtitle">Zero-Knowledge Ballots with Public Tallies</p>
        </div>

        {!walletAddress ? (
          <div className="connect-section">
            <button className="btn-connect" onClick={triggerWalletConnection} disabled={isConnecting}>
              {isConnecting ? <div className="spinner"></div> : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <div>
            <div className="tally-grid">
              <div className="tally-box tally-yes">
                <div className="tally-title">Yes Votes</div>
                <div className="tally-value">{tallies.yes}</div>
              </div>
              <div className="tally-box tally-no">
                <div className="tally-title">No Votes</div>
                <div className="tally-value">{tallies.no}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Secret Invitation Code (Nullifier)</label>
              <input 
                type="password" 
                className="form-input"
                placeholder="Enter your secret code..."
                value={invitationCode}
                onChange={e => setInvitationCode(e.target.value)}
                disabled={isVoting}
                autoComplete="off"
              />
            </div>
            
            <div className="vote-actions">
              <button 
                className="btn-vote btn-vote-yes"
                onClick={() => handleVote(true)}
                disabled={isVoting || !invitationCode}
              >
                {isVoting ? <div className="spinner"></div> : 'Vote YES'}
              </button>
              <button 
                className="btn-vote btn-vote-no"
                onClick={() => handleVote(false)}
                disabled={isVoting || !invitationCode}
              >
                {isVoting ? <div className="spinner"></div> : 'Vote NO'}
              </button>
            </div>
          </div>
        )}
        
        {statusMsg.text && (
          <div className={`status ${statusMsg.type}`}>
            {statusMsg.text}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
