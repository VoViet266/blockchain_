import React, { useState } from "react";
import Web3Service from "../../services/web3_login.service";

const MetamaskIcon = () => (
  <svg viewBox="0 0 32 32" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
     <path d="M28.4 6.7L24 10.9L20.8 4.1L16 6.4L11.2 4.1L8 10.9L3.6 6.7L2.3 14.3L16 31.2L29.7 14.3L28.4 6.7Z" fill="#E17726"/>
     <path d="M16 6.4L20.8 4.1L18.6 13.8L16 16L13.4 13.8L11.2 4.1L16 6.4Z" fill="#E27625"/>
     <path d="M16 16L18.6 13.8L21.9 16L16 19.3L10.1 16L13.4 13.8L16 16Z" fill="#D5BFB2"/>
     <path d="M13.4 13.8L13.1 15.7L9.8 13.5L12 12.7L13.4 13.8Z" fill="#233447"/>
     <path d="M18.6 13.8L20 12.7L22.2 13.5L18.9 15.7L18.6 13.8Z" fill="#233447"/>
     <path d="M9.8 13.5L13.1 15.7L10.8 19.3L6.5 17.4L9.8 13.5Z" fill="#CC6228"/>
     <path d="M22.2 13.5L25.5 17.4L21.2 19.3L18.9 15.7L22.2 13.5Z" fill="#CC6228"/>
     <path d="M16 19.3L18.3 15.7L21.8 19.7L16 21.8L10.2 19.7L13.7 15.7L16 19.3Z" fill="#E27525"/>
     <path d="M21.8 19.7L26.1 17.8L16 31.2V21.8L21.8 19.7Z" fill="#F6851B"/>
     <path d="M10.2 19.7L16 21.8V31.2L5.9 17.8L10.2 19.7Z" fill="#F6851B"/>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const BadgeCheckIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" stroke="var(--success)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{margin: '0 auto 16px auto', display: 'block'}}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const Web3Login = () => {
  const [userAddress, setUserAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const connectAndLogin = async () => {
    try {
      setIsLoading(true);
      if (!window.ethereum) {
        alert("Vui lòng cài đặt MetaMask để sử dụng tính năng này!");
        setIsLoading(false);
        return;
      }
      const address = await Web3Service.connectAndLogin();
      if (address) {
        setUserAddress(address);
      }
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProtectedData = async () => {
    try {
      await Web3Service.fetchProtectedData();
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      alert("Gọi API thất bại, vui lòng thử lại.");
    }
  };

  const handleLogout = () => {
    setUserAddress(null);
    localStorage.removeItem("accessToken");
  };

  const shortenAddress = (str) => {
    if (!str) return "";
    return `${str.slice(0, 6)}...${str.slice(str.length - 4)}`;
  };

  return (
    <div
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--glass-border)",
        borderRadius: "24px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "440px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.05)",
        position: "relative",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: "24px"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        {/* Glow behind the logo */}
        <div style={{
           position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', 
           width: '60px', height: '60px', background: 'var(--accent)', filter: 'blur(30px)', opacity: 0.5, zIndex: -1
        }}></div>
        
        <div style={{ 
          width: "64px", height: "64px", margin: "0 auto 24px", background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--glass-border)", borderRadius: "16px", display: "flex", alignItems: "center", 
          justifyContent: "center", boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
        }}>
          <MetamaskIcon />
        </div>
        <h2 style={{ fontSize: "28px", margin: "0 0 8px", fontWeight: "700", letterSpacing: "-0.5px" }}>Welcome to DApp</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.5" }}>
          Decentralized Authentication.<br/>Sign securely using your Web3 Wallet.
        </p>
      </div>

      {!userAddress ? (
        <div style={{ marginTop: "16px" }}>
          <button
            className="auth-button"
            onClick={connectAndLogin}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s infinite linear' }}></div>
                Connecting...
              </span>
            ) : (
              <>
                <MetamaskIcon />
                Continue with MetaMask
              </>
            )}
          </button>
        </div>
      ) : (
        <div style={{ 
            background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)", 
            borderRadius: "16px", padding: "24px", marginTop: "8px", textAlign: "center"
          }}>
          <BadgeCheckIcon />
          <h3 style={{ margin: "0 0 4px", fontSize: "18px", color: "var(--text-main)" }}>Authentication Successful</h3>
          <div style={{ 
             display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.3)",
             padding: "6px 14px", borderRadius: "30px", border: "1px solid rgba(255,255,255,0.05)",
             color: "var(--accent-hover)", fontSize: "14px", fontWeight: "500", fontFamily: "var(--mono)",
             margin: "16px 0 24px"
          }}>
            <UserIcon />
            {shortenAddress(userAddress)}
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button className="auth-button secondary" onClick={fetchProtectedData}>
              Test Protected API
            </button>
            <button className="auth-button danger" onClick={handleLogout}>
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Basic Keyframes for internal loading spinner */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Web3Login;
