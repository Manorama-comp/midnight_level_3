import { useState, useEffect } from 'react';
import './index.css';

// Mock Contract API
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
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  
  // Wallet Mock State
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  useEffect(() => {
    api.getTallies().then((t: any) => setTallies(t));
  }, []);

  const triggerWalletConnection = () => {
    setStatusMsg({ type: '', text: '' });
    setShowWalletPopup(true); // Show our fake wallet popup!
  };

  const handleWalletAuthorize = () => {
    setIsAuthorizing(true);
    // Simulate wallet connection delay
    setTimeout(() => {
      setIsAuthorizing(false);
      setShowWalletPopup(false);
      setWalletAddress("midnight-connected-address");
    }, 1200);
  };

  const handleWalletCancel = () => {
    setShowWalletPopup(false);
    setStatusMsg({ type: 'error', text: 'Connection rejected by user.' });
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
      {/* Mock Midnight Wallet Popup */}
      {showWalletPopup && (
        <div className="modal-overlay">
          <div className="wallet-popup">
            <div className="wallet-header">
              <div className="wallet-logo">M</div>
              <div className="wallet-title">Midnight Lace</div>
            </div>
            <div className="wallet-content">
              <p>
                <span className="wallet-url">localhost:5173</span> is requesting access to connect to your Midnight wallet.
              </p>
              <div className="wallet-actions">
                <button className="wallet-btn wallet-btn-cancel" onClick={handleWalletCancel} disabled={isAuthorizing}>
                  Cancel
                </button>
                <button className="wallet-btn wallet-btn-auth" onClick={handleWalletAuthorize} disabled={isAuthorizing}>
                  {isAuthorizing ? <div className="spinner" style={{ margin: '0 auto' }}></div> : 'Authorize'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="app-container">
        <div className="header">
          <div className="brand-badge">Midnight Network</div>
          <h1>Private Voting</h1>
          <p className="subtitle">Zero-Knowledge Ballots with Public Tallies</p>
        </div>

        {!walletAddress ? (
          <div className="connect-section">
            <button className="btn-connect" onClick={triggerWalletConnection}>
              Connect Wallet
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
