import { BrowserProvider } from 'ethers';
import axios from 'axios';

const Web3Service = {
    async connectAndLogin() {
        console.log('Bắt đầu quá trình đăng nhập Web3...');
        console.log(import.meta.env.VITE_BACKEND_URL);
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
            const nonceRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/nonce/${address}`);
            const nonce = nonceRes.data.nonce;

            // 4. Tạo thông điệp và yêu cầu ký
            const message = `Sign this message to login: ${nonce}`;
            const signer = await provider.getSigner();
            const signature = await signer.signMessage(message);

            // 5. Gửi chữ ký và địa chỉ lên Backend xác thực
            const verifyRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/verify`, {
                address: address,
                signature: signature
            });

            // 6. Nhận Token
            const token = verifyRes.data.token;

            // Lưu lại Token
            localStorage.setItem('accessToken', token);
            return verifyRes.data.user.address;

        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error);
            alert('Đăng nhập thất bại, vui lòng thử lại.');
        }
    },

    async fetchProtectedData() {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Dữ liệu từ Backend:', res.data);
            alert('Gọi API thành công! Kiểm tra Console Log.');
        } catch (error) {
            console.error(error);
            alert('Bạn chưa đăng nhập hoặc token đã hết hạn!');
        }

    }
}

export default Web3Service;