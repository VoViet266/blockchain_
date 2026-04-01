import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API, { getProducts } from "../../services/api.service";
import {
  connectWalletWithEthers,
  getConnectedWalletWithEthers,
  subscribeWalletChanges,
  WALLET_STORAGE_KEY,
} from "../../services/wallet.service";
import { STATUS_OPTIONS_MAP } from "../../enum/status_option";

const STATUS_FILTER_OPTIONS = ["ALL", "PLANTED", "HARVESTED", "PACKAGED", "SHIPPED", "DELIVERED", "SOLD"];

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState("Sẵn sàng kết nối ví để bắt đầu truy xuất nguồn gốc.");
  const [isConnecting, setIsConnecting] = useState(false);
  const [products, setProducts] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState("");

  const shortWallet = useMemo(() => {
    if (!wallet) return "Chưa kết nối";
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  }, [wallet]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.origin?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || item.latest_version?.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);


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
      } catch {
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
        const response = await getProducts(wallet);
        setProducts(response || []);
      } catch (error) {
        if (!error?.response) {
          setProductsError("Không kết nối được backend");
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
    } catch {
      return imagePath;
    }
  };

  return (
    <div className="min-h-[100vh] p-[24px] font-sf-pro text-[#21352c] overflow-x-hidden bg-[radial-gradient(circle_at_12%_18%,rgba(255,196,95,0.28),transparent_42%),radial-gradient(circle_at_88%_12%,rgba(28,127,91,0.2),transparent_40%),linear-gradient(150deg,#f7f4e8_0%,#eef3dc_50%,#dff0e4_100%)]">
      <div className="max-w-[1080px] mx-auto grid gap-[18px] animate-[fade-up_680ms_ease-out]">

        <span className="w-fit border-[1px] border-[#2f6d56] text-[#245542] text-[12px] tracking-[0.12em] uppercase rounded-[999px] px-[12px] py-[8px] bg-white/60 backdrop-blur-[4px]">
          Niềm tin tuyệt đối
        </span>

        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-[18px]">
          <article className="bg-white/78 border-[1px] border-[#285946]/20 rounded-[24px] p-[24px] shadow-[0_24px_45px_rgba(40,70,58,0.08)]">
            <h1 className="mt-[14px] mb-[10px] text-[34px] md:text-[5vw] lg:text-[60px] leading-[1.05] text-[#132e24] font-bold">
              Agri Trace Platform
            </h1>
            <p className="m-0 text-[#365548] max-w-[52ch] leading-[1.65]">
              Theo dõi toàn bộ vòng đời nông sản từ thu hoạch, vận chuyển đến điểm bán với dữ liệu minh bạch trên blockchain.
            </p>

            <div className="flex flex-wrap gap-[12px] mt-[22px]">
              {!wallet && (
                <button
                  className="inline-flex items-center justify-center rounded-[14px] px-[18px] py-[12px] text-[15px] cursor-pointer transition-all duration-200 hover:-translate-y-[2px] bg-gradient-to-br from-[#2f8a62] to-[#1f6647] text-[#f6fff9] shadow-[0_14px_24px_rgba(31,102,71,0.26)] disabled:opacity-70"
                  onClick={connectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Đang kết nối..." : "Kết nối MetaMask"}
                </button>
              )}

              {wallet && (
                <button
                  className="inline-flex cursor-pointer items-center justify-center rounded-[14px] px-[18px] py-[12px] text-[15px] transition-all duration-200 hover:-translate-y-[2px] bg-[#fff2f2] text-[#7b2b2b] border-[1px] border-[#984242]/30"
                  type="button"
                  onClick={disconnectWallet}
                >
                  Ngắt kết nối
                </button>
              )}

              <Link
                className="inline-flex items-center justify-center rounded-[14px] px-[18px] py-[12px] text-[15px] transition-all duration-200 hover:-translate-y-[2px] bg-[#f2efe2] text-[#1f4538] border-[1px] border-[#23493c]/30 no-underline"
                to="/create"
              >
                Tạo sản phẩm mới
              </Link>
            </div>

            <div className="mt-[16px] p-[14px] rounded-[14px] bg-[#f6fbf7] border-[1px] border-[#d6e9de] text-[#2f594b] text-[14px]">
              {status}
            </div>
          </article>

          <article className="relative overflow-hidden grid content-between rounded-[24px] p-[24px] bg-[linear-gradient(160deg,rgba(16,40,33,0.97),rgba(30,77,60,0.95))] text-[#ecfff4]">
            <div className="absolute top-[-70px] right-[-48px] w-[180px] h-[180px] rounded-[50%] bg-[#ffd161]/20 blur-[2px] pointer-events-none"></div>
            <div className="absolute bottom-[-78px] left-[-56px] w-[180px] h-[180px] rounded-[50%] bg-[#bdffd6]/16 blur-[2px] pointer-events-none"></div>
            <div className="relative z-[2]">
              <p className="m-0 mb-[8px] text-[12px] uppercase tracking-[0.14em] text-[#dbffef]">Wallet</p>
              <p className="text-[24px] md:text-[28px] leading-[1.2] m-0 font-bold break-all text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.28)]">
                {shortWallet}
              </p>
              <p className="mt-[14px] mb-0 text-[#f3fff8] text-[14px] leading-[1.5]">
                Địa chỉ ví được dùng để ký giao dịch và xác thực mọi thao tác ghi nhận hành trình sản phẩm.
              </p>
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
          <article className="rounded-[18px] p-[16px] bg-white/78 border-[1px] border-[#23493c]/12 animate-[pop-in_480ms_ease-out]">
            <h3 className="m-0 mb-[8px] text-[18px] font-bold">Minh bạch</h3>
            <p className="m-0 text-[#3c5d4f] leading-[1.55] text-[14px]">Dữ liệu truy xuất không thể chỉnh sửa sau khi đã ghi lên blockchain.</p>
          </article>
          <article className="rounded-[18px] p-[16px] bg-white/78 border-[1px] border-[#23493c]/12 animate-[pop-in_480ms_ease-out]">
            <h3 className="m-0 mb-[8px] text-[18px] font-bold">Nhanh gọn</h3>
            <p className="m-0 text-[#3c5d4f] leading-[1.55] text-[14px]">Tạo sản phẩm, cập nhật trạng thái và tra cứu thông tin chỉ trong vài bước.</p>
          </article>
          <article className="rounded-[18px] p-[16px] bg-white/78 border-[1px] border-[#23493c]/12 animate-[pop-in_480ms_ease-out]">
            <h3 className="m-0 mb-[8px] text-[18px] font-bold">Đáng tin</h3>
            <p className="m-0 text-[#3c5d4f] leading-[1.55] text-[14px]">Người mua kiểm tra lịch sử hàng hóa tức thì bằng mã sản phẩm duy nhất.</p>
          </article>
        </section>

        <section className="mt-[8px] bg-white/78 border-[1px] border-[#285946]/20 rounded-[24px] p-[24px] shadow-[0_24px_45px_rgba(40,70,58,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[10px]">
            <div>
              <h2 className="m-0 text-[26px] md:text-[4vw] lg:text-[40px] text-[#163629] font-bold">Nông sản của bạn</h2>
              <p className="m-0 text-[#365548] text-[14px]">Sau khi kết nối MetaMask, hệ thống sẽ hiển thị các sản phẩm thuộc địa chỉ này.</p>
            </div>
            <span className="rounded-[999px] border-[1px] border-[#254f3f]/25 bg-white/75 px-[12px] py-[8px] text-[#2a5242] text-[13px]">
              {shortWallet}
            </span>
          </div>

          {!wallet && <div className="rounded-[12px] border-[1px] border-[#d6e9de] bg-[#f6fbf8] text-[#355f4f] p-[12px] text-[14px]">Hãy kết nối MetaMask để xem danh sách sản phẩm của bạn.</div>}
          {wallet && isLoadingProducts && <div className="rounded-[12px] border-[1px] border-[#d6e9de] bg-[#f6fbf8] text-[#355f4f] p-[12px] text-[14px]">Đang tải danh sách sản phẩm...</div>}
          {wallet && productsError && <div className="rounded-[12px] border-[1px] border-[#e6c0c0] bg-[#fff3f3] text-[#7d3434] p-[12px] text-[14px]">{productsError}</div>}

          {/* Thanh tìm kiếm và lọc */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <input
              type="text"
              placeholder="Tìm theo tên hoặc nguồn gốc..."
              className="px-12 py-10 rounded-xl border border-gray-200 focus:border-[#132e24] bg-white/50 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="px-12 py-10 rounded-xl outline-none cursor-pointer border focus:border-[#132e24] border-gray-200 bg-white/50"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_FILTER_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="mb-4 text-sm text-gray-500">
            Tổng: <strong>{filteredProducts.length}</strong> sản phẩm
          </div>


          {wallet && !isLoadingProducts && !productsError && products.length === 0 && (
            <div className="rounded-[12px] border-[1px] border-[#d6e9de] bg-[#f6fbf8] text-[#355f4f] p-[12px] text-[14px]">Ví này chưa có sản phẩm nào. Bạn có thể tạo sản phẩm mới ngay bây giờ.</div>
          )}

          {wallet && !isLoadingProducts && !productsError && products.length > 0 && Array.isArray(products) && (
            <div className={`grid grid-cols-1 ${filteredProducts.length === 0 ? 'md:grid-cols-1' : 'md:grid-cols-3'} gap-[12px]`}>
              {filteredProducts.length === 0 && (
                <div className="rounded-[12px] border-[1px] w-full min-h-200 flex items-center justify-center border-[#d6e9de] bg-[#f6fbf8] text-[#355f4f] p-[12px] text-[14px]">
                  Không tìm thấy sản phẩm nào khớp với tiêu chí tìm kiếm và lọc.
                </div>
              )}
              {filteredProducts.map((item) => (
                <Link key={item.id} className="grid gap-[10px] rounded-[18px] bg-white/82 border-[1px] border-[#23493c]/14 p-[12px] text-inherit no-underline transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_14px_24px_rgba(35,73,60,0.12)]" to={`/product/${item.id}`}>
                  {item.latest_version?.image && (
                    <img className="w-full h-[150px] object-cover rounded-[12px] border-[1px] border-[#d7e8de] bg-[#f0f6f2]" src={toImageUrl(item.latest_version.image)} alt={`Product ${item.name}`} />
                  )}
                  <h3 className="m-0 font-bold text-[#1f4134] text-[17px]">{item.name}</h3>
                  <p className="m-0 text-[#3d6051] text-[13px] leading-[1.5]">Origin: {item.origin}</p>
                  <span className="w-fit rounded-[999px] px-[9px] py-[5px] text-[11px] tracking-wider uppercase border-[1px] border-[#cfe5d8] text-[#266044] bg-[#ecf8f1] font-bold">
                    {STATUS_OPTIONS_MAP[item.latest_version?.status] || "NO STATUS"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}