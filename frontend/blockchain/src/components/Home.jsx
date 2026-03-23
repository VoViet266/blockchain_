import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api.service";
import {
  connectWalletWithEthers,
  getConnectedWalletWithEthers,
  subscribeWalletChanges,
  WALLET_STORAGE_KEY,
} from "../services/wallet.service";

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState("Sẵn sàng kết nối ví để bắt đầu truy xuất nguồn gốc.");
  const [isConnecting, setIsConnecting] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState("");

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
      setStatus(error?.message || "Kết nối thất bại, vui lòng thử lại.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet("");
    setProducts([]);
    setProductsError("");
    localStorage.removeItem(WALLET_STORAGE_KEY);
    setStatus("Đã ngắt kết nối trong ứng dụng. Nếu muốn thu hồi quyền hoàn toàn, hãy ngắt trong MetaMask.");
  };

  useEffect(() => {
    const syncWalletFromMetaMask = async () => {
      try {
        const account = await getConnectedWalletWithEthers();

        if (account) {
          setWallet(account);
          localStorage.setItem(WALLET_STORAGE_KEY, account);
          setStatus("Đã kết nối ví MetaMask.");
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

  useEffect(() => {
    const fetchWalletProducts = async () => {
      if (!wallet) {
        setProducts([]);
        setProductsError("");
        return;
      }

      try {
        setIsLoadingProducts(true);
        setProductsError("");
        const response = await API.get("/products/", {
          params: { wallet },
        });
        setProducts(response.data || []);
      } catch (error) {
        if (!error?.response) {
          setProductsError("Không kết nối được backend. Kiểm tra server Django đang chạy tại 127.0.0.1:8000.");
        } else {
          setProductsError(error?.response?.data?.detail || "Không tải được danh sách sản phẩm.");
        }
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchWalletProducts();
  }, [wallet]);

  const toImageUrl = (imagePath) => {
    if (!imagePath) return "";
    try {
      return new URL(imagePath, API.defaults.baseURL).toString();
    } catch (_e) {
      return imagePath;
    }
  };

  return (
    <div className="min-h-screen p-24 c-[#21352c] overflow-x-hidden bg-custom-gradient">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');

          

          .home-shell {
            max-width: 1080px;
            margin: 0 auto;
            display: grid;
            gap: 18px;
            animation: fade-up 680ms ease-out;
          }

          .brand-chip {
            width: fit-content;
            border: 1px solid #2f6d56;
            color: #245542;
            font-size: 12px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            border-radius: 999px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(4px);
          }

          .hero {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 18px;
          }

          .panel {
            background: rgba(255, 255, 255, 0.78);
            border: 1px solid rgba(40, 89, 70, 0.2);
            border-radius: 24px;
            padding: 24px;
            box-shadow: 0 24px 45px rgba(40, 70, 58, 0.08);
          }

          .hero h1 {
            margin: 14px 0 10px;
            font-family: "Fraunces", serif;
            font-size: clamp(34px, 5vw, 60px);
            line-height: 1.05;
            color: #132e24;
          }

          .hero .panel:not(.wallet-card) p {
            margin: 0;
            color: #365548;
            max-width: 52ch;
            line-height: 1.65;
          }

          .cta-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 22px;
          }

          .btn {
            border: none;
            border-radius: 14px;
            padding: 12px 18px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .btn:hover {
            transform: translateY(-2px);
          }

          .btn-primary {
            background: linear-gradient(135deg, #2f8a62, #1f6647);
            color: #f6fff9;
            box-shadow: 0 14px 24px rgba(31, 102, 71, 0.26);
          }

          .btn-secondary {
            background: #f2efe2;
            color: #1f4538;
            border: 1px solid rgba(35, 73, 60, 0.3);
          }

          .btn-danger {
            background: #fff2f2;
            color: #7b2b2b;
            border: 1px solid rgba(152, 66, 66, 0.3);
          }

          .status-box {
            margin-top: 16px;
            padding: 14px;
            border-radius: 14px;
            background: #f6fbf7;
            border: 1px solid #d6e9de;
            color: #2f594b;
            font-size: 14px;
          }

          .wallet-card {
            display: grid;
            align-content: space-between;
            background:
              linear-gradient(160deg, rgba(16, 40, 33, 0.97), rgba(30, 77, 60, 0.95));
            color: #ecfff4;
            position: relative;
            overflow: hidden;
          }

          .wallet-card::before,
          .wallet-card::after {
            content: "";
            position: absolute;
            width: 180px;
            height: 180px;
            border-radius: 50%;
            background: rgba(255, 209, 97, 0.2);
            filter: blur(2px);
          }

          .wallet-card::before {
            top: -70px;
            right: -48px;
          }

          .wallet-card::after {
            bottom: -78px;
            left: -56px;
            background: rgba(189, 255, 214, 0.16);
          }

          .wallet-content {
            position: relative;
            z-index: 2;
          }

          .wallet-card .wallet-title {
            margin: 0 0 8px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: #dbffef;
            opacity: 1;
          }

          .wallet-card .wallet-address {
            font-size: 28px;
            line-height: 1.2;
            margin: 0;
            font-weight: 700;
            word-break: break-all;
            color: #ffffff;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.28);
          }

          .wallet-card .wallet-sub {
            margin: 14px 0 0;
            color: #f3fff8;
            font-size: 14px;
            line-height: 1.5;
          }

          .feature-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }

          .feature {
            border-radius: 18px;
            padding: 16px;
            background: rgba(255, 255, 255, 0.78);
            border: 1px solid rgba(35, 73, 60, 0.12);
            animation: pop-in 480ms ease-out;
          }

          .feature h3 {
            margin: 0 0 8px;
            font-size: 18px;
          }

          .feature p {
            margin: 0;
            color: #3c5d4f;
            line-height: 1.55;
            font-size: 14px;
          }

          .product-section {
            margin-top: 8px;
          }

          .product-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 10px;
          }

          .product-title {
            margin: 0;
            font-family: "Fraunces", serif;
            font-size: clamp(26px, 4vw, 40px);
            color: #163629;
          }

          .product-note {
            margin: 0;
            color: #365548;
            font-size: 14px;
          }

          .wallet-inline {
            border-radius: 999px;
            border: 1px solid rgba(37, 79, 63, 0.25);
            background: rgba(255, 255, 255, 0.75);
            padding: 8px 12px;
            color: #2a5242;
            font-size: 13px;
          }

          .product-list {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }

          .product-item {
            display: grid;
            gap: 10px;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.82);
            border: 1px solid rgba(35, 73, 60, 0.14);
            padding: 12px;
            text-decoration: none;
            color: inherit;
            transition: transform 0.18s ease, box-shadow 0.18s ease;
          }

          .product-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 14px 24px rgba(35, 73, 60, 0.12);
          }

          .product-img {
            width: 100%;
            height: 150px;
            object-fit: cover;
            border-radius: 12px;
            border: 1px solid #d7e8de;
            background: #f0f6f2;
          }

          .product-name {
            margin: 0;
            font-weight: 700;
            color: #1f4134;
            font-size: 17px;
          }

          .product-meta {
            margin: 0;
            color: #3d6051;
            font-size: 13px;
            line-height: 1.5;
          }

          .product-badge {
            width: fit-content;
            border-radius: 999px;
            padding: 5px 9px;
            font-size: 11px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            border: 1px solid #cfe5d8;
            color: #266044;
            background: #ecf8f1;
            font-weight: 700;
          }

          .product-feedback {
            border-radius: 12px;
            border: 1px solid #d6e9de;
            background: #f6fbf8;
            color: #355f4f;
            padding: 12px;
            font-size: 14px;
          }

          .product-feedback.error {
            border-color: #e6c0c0;
            background: #fff3f3;
            color: #7d3434;
          }

          @keyframes fade-up {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pop-in {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.985);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (max-width: 900px) {
            .hero {
              grid-template-columns: 1fr;
            }

            .feature-grid {
              grid-template-columns: 1fr;
            }

            .product-list {
              grid-template-columns: 1fr;
            }

            .wallet-address {
              font-size: 24px;
            }
          }

          @media (max-width: 560px) {
            .home-page {
              padding: 16px;
            }

            .panel {
              padding: 18px;
              border-radius: 18px;
            }
          }
        `}
      </style>

      <div className="home-shell">
        <span className="brand-chip">Farm to Table Visibility</span>

        <section className="hero">
          <article className="panel">
            <h1>Agri Trace Platform</h1>
            <p>
              Theo dõi toàn bộ vòng đời nông sản từ thu hoạch, vận chuyển đến điểm bán với dữ liệu minh bạch trên blockchain.
            </p>

            <div className="cta-row">
              {!wallet && (
                <button className="btn btn-primary" onClick={connectWallet} disabled={isConnecting}>
                  {isConnecting ? "Đang kết nối..." : "Kết nối MetaMask"}
                </button>
              )}

              {wallet && (
                <button className="btn btn-danger" type="button" onClick={disconnectWallet}>
                  Ngắt kết nối
                </button>
              )}

              <Link className="btn btn-secondary" to="/create">
                Tạo sản phẩm mới
              </Link>
            </div>

            <div className="status-box">{status}</div>
          </article>

          <article className="panel wallet-card">
            <div className="wallet-content">
              <p className="wallet-title">Wallet</p>
              <p className="wallet-address">{shortWallet}</p>
              <p className="wallet-sub">
                Địa chỉ ví được dùng để ký giao dịch và xác thực mọi thao tác ghi nhận hành trình sản phẩm.
              </p>
            </div>
          </article>
        </section>

        <section className="feature-grid">
          <article className="feature">
            <h3>Minh bạch</h3>
            <p>Dữ liệu truy xuất không thể chỉnh sửa sau khi đã ghi lên blockchain.</p>
          </article>
          <article className="feature">
            <h3>Nhanh gọn</h3>
            <p>Tạo sản phẩm, cập nhật trạng thái và tra cứu thông tin chỉ trong vài bước.</p>
          </article>
          <article className="feature">
            <h3>Đáng tin</h3>
            <p>Người mua kiểm tra lịch sử hàng hóa tức thì bằng mã sản phẩm duy nhất.</p>
          </article>
        </section>

        <section className="product-section panel">
          <div className="product-head">
            <div>
              <h2 className="product-title">Nông sản của bạn</h2>
              <p className="product-note">Sau khi kết nối MetaMask, hệ thống sẽ hiển thị các sản phẩm thuộc địa chỉ này.</p>
            </div>
            <span className="wallet-inline">{shortWallet}</span>
          </div>

          {!wallet && <div className="product-feedback">Hãy kết nối MetaMask để xem danh sách sản phẩm của bạn.</div>}
          {wallet && isLoadingProducts && <div className="product-feedback">Đang tải danh sách sản phẩm...</div>}
          {wallet && productsError && <div className="product-feedback error">{productsError}</div>}

          {wallet && !isLoadingProducts && !productsError && products.length === 0 && (
            <div className="product-feedback">Ví này chưa có sản phẩm nào. Bạn có thể tạo sản phẩm mới ngay bây giờ.</div>
          )}

          {wallet && !isLoadingProducts && !productsError && products.length > 0 && Array.isArray(products) && (
            <div className="product-list">
              {products.map((item) => (
                <Link key={item.id} className="product-item" to={`/product/${item.id}`}>
                  {item.latest_version?.image && (
                    <img
                      className="product-img"
                      src={toImageUrl(item.latest_version.image)}
                      alt={`Product ${item.name}`}
                    />
                  )}
                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-meta">Origin: {item.origin}</p>
                  <span className="product-badge">{item.latest_version?.status || "NO STATUS"}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}