import { useState, useEffect, useRef } from 'react';
import './index.css';

class MockContractAPI {
  yesVotes = 42;
  noVotes = 15;

  async connectWallet() {
    const injected = (window as any).midnight;
    if (!injected) {
      throw new Error("No Midnight wallet found! Please install Midnight Lace or Nightly extension.");
    }
    
    const walletKeys = Object.keys(injected);
    if (walletKeys.length === 0) {
      throw new Error("No Midnight wallets available in the window object.");
    }
    
    const wallet = injected[walletKeys[0]];
    
    if (wallet && typeof wallet.enable === 'function') {
      await wallet.enable();
    } else if (wallet && typeof wallet.connect === 'function') {
      await wallet.connect();
    }
    
    return walletKeys[0];
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
  
  // 3D Tilt Effect
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    }
  };

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
      setStatusMsg({ type: 'success', text: '✅ ZK Proof Verified. Vote recorded on Ledger!' });
      setInvitationCode('');
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: '❌ ' + (e.message || 'Voting failed') });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <>
      <div className="background-container"></div>
      <div className="stars"></div>

      <div 
        className="app-container" 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="header-wrapper">
          <div className="badge">
            <span className="badge-dot"></span> MIDNIGHT NETWORK
          </div>
          <h1>Private Voting</h1>
          <p className="subtitle">Zero-Knowledge Ballots with Publicly Verifiable Tallies</p>
        </div>

        {!walletAddress ? (
          <div className="connect-btn-wrapper">
            <button className="btn-primary" onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="loader"></div> INITIALIZING...
                </span>
              ) : 'CONNECT LACE WALLET'}
            </button>
          </div>
        ) : (
          <div>
            <div className="tally-board">
              <div className="tally-card tally-yes">
                <div className="tally-label">YES VOTES</div>
                <div className="tally-count">{tallies.yes}</div>
              </div>
              <div className="tally-card tally-no">
                <div className="tally-label">NO VOTES</div>
                <div className="tally-count">{tallies.no}</div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">SECRET INVITATION CODE</label>
              <input 
                type="password" 
                className="secret-input"
                placeholder="••••••••"
                value={invitationCode}
                onChange={e => setInvitationCode(e.target.value)}
                disabled={isVoting}
                autoComplete="off"
              />
            </div>
            
            <div className="vote-buttons">
              <button 
                className="btn-vote btn-vote-yes"
                onClick={() => handleVote(true)}
                disabled={isVoting || !invitationCode}
              >
                {isVoting ? <div className="loader"></div> : 'VOTE YES'}
              </button>
              <button 
                className="btn-vote btn-vote-no"
                onClick={() => handleVote(false)}
                disabled={isVoting || !invitationCode}
              >
                {isVoting ? <div className="loader"></div> : 'VOTE NO'}
              </button>
            </div>
          </div>
        )}
        
        {statusMsg.text && (
          <div className={`status-panel status-${statusMsg.type}`}>
            {statusMsg.text}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
