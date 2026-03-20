import React, { useState } from 'react';
import { BrowserProvider } from 'ethers';
import axios from 'axios';

const Web3Login = () => {
  const [userAddress, setUserAddress] = useState(null);
  const BACKEND_URL = 'http://localhost:3000/api';

  const connectAndLogin = async () => {
    try {
      // 1. Kiểm tra xem trình duyệt đã cài MetaMask chưa
      if (!window.ethereum) {
        alert('Vui lòng cài đặt ví MetaMask trên trình duyệt!');
        return;
      }

      // 2. Kết nối với MetaMask
      const provider = new BrowserProvider(window.ethereum);
      
      // Yêu cầu người dùng chọn tài khoản để kết nối
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0]; 

      // 3. Yêu cầu Backend cấp nonce
      const nonceRes = await axios.get(`${BACKEND_URL}/auth/nonce/${address}`);
      const nonce = nonceRes.data.nonce;

      // 4. Tạo thông điệp và yêu cầu ký
      const message = `Sign this message to login: ${nonce}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      // 5. Gửi chữ ký và địa chỉ lên Backend xác thực
      const verifyRes = await axios.post(`${BACKEND_URL}/auth/verify`, {
        address: address,
        signature: signature
      });

      // 6. Nhận Token
      const token = verifyRes.data.token;
      
      // Lưu lại Token
      localStorage.setItem('accessToken', token);
      setUserAddress(verifyRes.data.user.address);
      
      alert('Đăng nhập thành công!');

    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      alert('Đăng nhập thất bại, vui lòng thử lại.');
    }
  };

  const fetchProtectedData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${BACKEND_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Dữ liệu phía Backend:', res.data);
      alert('Gọi API thành công! Kiểm tra Console Log.');
    } catch (error) {
      console.error(error);
      alert('Bạn chưa đăng nhập hoặc token đã hết hạn!');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
      <h2>Web3 Login (MetaMask)</h2>
      
      {!userAddress ? (
        <button onClick={connectAndLogin} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}>
          Đăng nhập bằng MetaMask
        </button>
      ) : (
        <div>
          <p>Xin chào ví: <strong style={{color: 'green'}}>{userAddress}</strong></p>
          <button onClick={fetchProtectedData} style={{ marginRight: '10px', padding: '10px' }}>
            Test API (Protected)
          </button>
          <button 
            onClick={() => { 
                setUserAddress(null); 
                localStorage.removeItem('accessToken'); 
            }}
            style={{ padding: '10px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Đăng Xuất
          </button>
        </div>
      )}
    </div>
  );
};

export default Web3Login;
