import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api.service";
import {
  connectWalletWithEthers,
  getConnectedWalletWithEthers,
  subscribeWalletChanges,
  WALLET_STORAGE_KEY,
} from "../services/wallet.service";

export default function Create() {
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [image, setImage] = useState(null);
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState("Điền thông tin và kết nối ví để tạo sản phẩm.");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shortWallet = useMemo(() => {
    if (!wallet) return "Chưa kết nối";
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  }, [wallet]);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setStatus("Đang mở MetaMask...");

      const account = await connectWalletWithEthers();
      setWallet(account);
      localStorage.setItem(WALLET_STORAGE_KEY, account);
      setStatus("Kết nối ví thành công (ethers).");
    } catch (error) {
      setStatus(error?.message || "Kết nối ví thất bại.");
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const syncWalletFromMetaMask = async () => {
      try {
        const account = await getConnectedWalletWithEthers();

        if (account) {
          setWallet(account);
          localStorage.setItem(WALLET_STORAGE_KEY, account);
          setStatus("Đã tự khôi phục kết nối ví từ phiên trước.");
          return;
        }

        setWallet("");
        localStorage.removeItem(WALLET_STORAGE_KEY);
      } catch (_error) {
        const cachedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
        if (cachedWallet) {
          setWallet(cachedWallet);
        }
      }
    };

    const unsubscribe = subscribeWalletChanges((account) => {
      if (account) {
        setWallet(account);
        localStorage.setItem(WALLET_STORAGE_KEY, account);
        setStatus("Đã cập nhật ví MetaMask.");
      } else {
        setWallet("");
        localStorage.removeItem(WALLET_STORAGE_KEY);
        setStatus("MetaMask đã ngắt kết nối. Vui lòng kết nối lại để tiếp tục.");
      }
    });

    syncWalletFromMetaMask();

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !origin.trim() || !image) {
      setStatus("Vui lòng nhập đầy đủ Name, Origin và chọn ảnh sản phẩm.");
      return;
    }

    if (!wallet) {
      setStatus("Vui lòng kết nối ví trước khi tạo sản phẩm.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("origin", origin.trim());
    formData.append("wallet", wallet);
    formData.append("image", image);

    try {
      setIsSubmitting(true);
      setStatus("Đang tạo sản phẩm và ghi dữ liệu lên blockchain...");

      await API.post("/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus("Tạo sản phẩm thành công.");
      setName("");
      setOrigin("");
      setImage(null);
    } catch (error) {
      if (!error?.response) {
        setStatus("Không kết nối được backend. Hãy chạy Django server và thử lại.");
      } else {
        setStatus(error?.response?.data?.detail || error?.message || "Tạo sản phẩm thất bại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-page">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');

          .create-page {
            min-height: 100vh;
            padding: 24px;
            background:
              radial-gradient(circle at 85% 12%, rgba(41, 153, 104, 0.2), transparent 36%),
              radial-gradient(circle at 8% 20%, rgba(255, 191, 92, 0.2), transparent 34%),
              linear-gradient(150deg, #f7f3e6 0%, #edf4df 52%, #e0efe7 100%);
            color: #23372e;
            font-family: "Space Grotesk", sans-serif;
          }

          .create-shell {
            max-width: 980px;
            margin: 0 auto;
            display: grid;
            gap: 14px;
            animation: fade-up 550ms ease-out;
          }

          .create-card {
            background: rgba(255, 255, 255, 0.78);
            border: 1px solid rgba(39, 76, 61, 0.18);
            border-radius: 24px;
            padding: 24px;
            box-shadow: 0 20px 40px rgba(40, 76, 61, 0.08);
          }

          .create-title {
            margin: 0 0 8px;
            font-family: "Fraunces", serif;
            font-size: clamp(30px, 4vw, 48px);
            color: #163629;
          }

          .create-sub {
            margin: 0;
            color: #3a5b4d;
            line-height: 1.6;
          }

          .wallet-pill {
            margin-top: 14px;
            width: fit-content;
            border-radius: 999px;
            border: 1px solid rgba(32, 74, 57, 0.25);
            background: #f8fbf5;
            padding: 8px 12px;
            font-size: 13px;
            color: #2a5443;
          }

          .action-row {
            margin-top: 16px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .btn {
            border: none;
            border-radius: 14px;
            padding: 11px 16px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.18s ease, box-shadow 0.18s ease;
          }

          .btn:hover {
            transform: translateY(-2px);
          }

          .btn-primary {
            background: linear-gradient(135deg, #2a875f, #1f6648);
            color: #effff6;
            box-shadow: 0 12px 20px rgba(31, 102, 72, 0.23);
          }

          .btn-secondary {
            border: 1px solid rgba(34, 72, 58, 0.35);
            background: #f7efe0;
            color: #2e5544;
          }

          .status-box {
            margin-top: 14px;
            border-radius: 14px;
            border: 1px solid #d8e7dd;
            background: #f6fbf8;
            padding: 12px;
            color: #32594b;
            font-size: 14px;
          }

          .form-grid {
            margin-top: 20px;
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .input-group {
            display: grid;
            gap: 6px;
          }

          .input-label {
            font-size: 13px;
            color: #365748;
            font-weight: 600;
          }

          .input,
          .file-input {
            border: 1px solid rgba(41, 82, 66, 0.24);
            border-radius: 12px;
            padding: 12px;
            font: inherit;
            background: #ffffff;
            color: #1f392f;
          }

          .file-input {
            padding: 9px;
          }

          .full {
            grid-column: 1 / -1;
          }

          .submit-row {
            margin-top: 16px;
            display: flex;
            justify-content: flex-end;
          }

          @keyframes fade-up {
            from {
              opacity: 0;
              transform: translateY(14px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 700px) {
            .create-page {
              padding: 16px;
            }

            .create-card {
              border-radius: 18px;
              padding: 18px;
            }

            .form-grid {
              grid-template-columns: 1fr;
            }

            .submit-row {
              justify-content: stretch;
            }

            .submit-row .btn {
              width: 100%;
            }
          }
        `}
      </style>

      <div className="create-shell">
        <section className="create-card">
          <h1 className="create-title">Create Product</h1>
          <p className="create-sub">
            Đăng ký sản phẩm mới, lưu thông tin xuất xứ và ảnh minh chứng lên hệ thống truy xuất nguồn gốc.
          </p>

          <div className="wallet-pill">Wallet: {shortWallet}</div>

          <div className="action-row">
            <Link className="btn btn-secondary" to="/">
              Về trang chủ
            </Link>
            {!wallet && (
              <button className="btn btn-secondary" type="button" onClick={connectWallet} disabled={isConnecting}>
                {isConnecting ? "Đang kết nối..." : "Connect Wallet"}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="input-group">
                <span className="input-label">Product Name</span>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Green Tea Leaves"
                />
              </label>

              <label className="input-group">
                <span className="input-label">Origin</span>
                <input
                  className="input"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="VD: Lam Dong, Vietnam"
                />
              </label>

              <label className="input-group full">
                <span className="input-label">Product Image</span>
                <input
                  className="file-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="status-box">{status}</div>

            <div className="submit-row">
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang tạo..." : "Create Product"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
