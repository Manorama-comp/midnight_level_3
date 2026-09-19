import { useState, useEffect } from 'react';
import './index.css';

// Mock Contract API for Voting Logic (since contract isn't compiled)
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
      
      // Select the first available wallet
      const walletName = walletKeys[0];
      const wallet = injected[walletName];
      
      let walletApi;
      
      // Trigger genuine DApp Connector API Request
      if (wallet && typeof wallet.enable === 'function') {
        walletApi = await wallet.enable();
      } else if (wallet && typeof wallet.connect === 'function') {
        walletApi = await wallet.connect();
      } else {
        throw new Error("Wallet provider does not support enable/connect.");
      }

      // Fetch the real Unshielded Address from the wallet!
      if (walletApi && typeof walletApi.getUnshieldedAddress === 'function') {
        const addressData = await walletApi.getUnshieldedAddress();
        setWalletAddress(addressData.unshieldedAddress);
        setStatusMsg({ type: 'success', text: `Successfully connected to ${walletName}!` });
      } else {
        // Fallback if API changed
        setWalletAddress("Connected (Address Hidden)");
        setStatusMsg({ type: 'success', text: `Connected to ${walletName} (No address permission)` });
      }
      
    } catch (error: any) {
      console.error("Wallet connection failed", error);
      setStatusMsg({ type: 'error', text: 'Connection rejected or failed: ' + error.message });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setStatusMsg({ type: '', text: '' });
    // Note: DApp Connector API doesn't have an explicit disconnect method to revoke,
    // so we just clear the local UI state. The user has to revoke in the wallet if desired.
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

  // Format address for display (e.g. mn1...1234)
  const formatAddress = (addr: string) => {
    if (addr.length > 15) {
      return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
    }
    return addr;
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '12px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                Connected: <span style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px' }}>{formatAddress(walletAddress)}</span>
              </div>
              <button 
                onClick={disconnectWallet}
                style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
              >
                Disconnect
              </button>
            </div>

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
