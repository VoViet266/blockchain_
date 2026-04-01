import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProduct, generateHash } from "../../services/api.service";
import {
  connectWalletWithEthers,
  getConnectedWalletWithEthers,
  subscribeWalletChanges,
  addProductContract,
  WALLET_STORAGE_KEY,
} from "../../services/wallet.service";

export default function Create() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [productType, setProductType] = useState("");
  const [variety, setVariety] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [plantAreaId, setPlantAreaId] = useState("");
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [producer, setProducer] = useState("");
  const [origin, setOrigin] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState(
    "Điền thông tin và kết nối ví để tạo sản phẩm.",
  );
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
        setStatus(
          "MetaMask đã ngắt kết nối. Vui lòng kết nối lại để tiếp tục.",
        );
      }
    });

    syncWalletFromMetaMask();

    return () => {
      unsubscribe();
    };
  }, []);
// Validation tạo sản phẩm submit form
  const handleSubmit = async (event) => {
    event.preventDefault();

        // helper
    const isNumber = (val) => !isNaN(val) && val !== "";
    const latLongRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;

    // 1. tên sản phẩm
    if (!name.trim() || name.trim().length < 3) {
      setStatus("Tên sản phẩm phải ≥ 3 ký tự.");
      return;
    }

    // 2. mã vùng trồng
    if (!plantAreaId.trim() || !/^\d+$/.test(plantAreaId)) {
      setStatus("Mã số vùng trồng phải là số.");
      return;
    }

    // 3. vùng trồng
    if (!origin.trim()) {
      setStatus("Vui lòng nhập vùng trồng.");
      return;
    }

    // 4. tọa độ
    if (location && !latLongRegex.test(location)) {
      setStatus("Tọa độ phải dạng: 10.123, 105.456");
      return;
    }

    // 5. nhiệt độ
    if (temperature && (!isNumber(temperature) || temperature < -50 || temperature > 100)) {
      setStatus("Nhiệt độ phải từ -50 đến 100°C.");
      return;
    }

    // 6. độ ẩm
    if (humidity && (!isNumber(humidity) || humidity < 0 || humidity > 100)) {
      setStatus("Độ ẩm phải từ 0% đến 100%.");
      return;
    }

    // 7. ảnh
    if (!image) {
      setStatus("Vui lòng chọn ảnh.");
      return;
    }

    if (!["image/jpeg", "image/png"].includes(image.type)) {
      setStatus("Chỉ chấp nhận ảnh JPG hoặc PNG.");
      return;
    }
    // 8. ví
    if (!wallet) {
      setStatus("Vui lòng kết nối ví trước khi tạo sản phẩm.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("product_type", productType.trim());
    formData.append("variety", variety.trim());
    formData.append("farm_name", farmName.trim());
    formData.append("location", location.trim());
    formData.append("producer", producer.trim());
    formData.append("plant_area_id", plantAreaId.trim());
    formData.append("origin", origin.trim());
    formData.append("temperature", temperature.trim());
    formData.append("humidity", humidity.trim());
    formData.append("description", description.trim());
    formData.append("wallet", wallet);
    formData.append("image", image);

    try {
      setIsSubmitting(true);

      setStatus("Đang tải ảnh và tạo hash...");
      const { uuid, hash, image: imageUrl } = await generateHash(formData);

      setStatus("Đang yêu cầu ký giao dịch...");
      const txHash = await addProductContract(uuid, hash);

      setStatus(
        `Đang lưu dữ liệu...`,
      );

      await createProduct({
        uuid,
        hash,
        txHash,
        name: name.trim(),
        product_type: productType.trim(),
        variety: variety.trim(),
        farm_name: farmName.trim(),
        location: location.trim(),
        producer: producer.trim(),
        plant_area_id: plantAreaId.trim(),
        origin: origin.trim(),
        temperature: temperature.trim(),
        humidity: humidity.trim(),
        description: description.trim(),
        wallet,
        image: imageUrl, // ✅ dùng URL, không phải file
      });

      setStatus(
        `Sản phẩm đã được ghi nhận! TxHash: ${txHash.slice(0, 10)}...`
      );

      navigate(`/product/${uuid}`);
      setName("");
      setOrigin("");
      setImage(null);
    } catch (error) {
      console.log("Lỗi tạo sản phẩm:", { error });

      // 🔥 bắt lỗi MetaMask (quan trọng)
      if (error.code === 4001) {
        setStatus("Bạn đã huỷ ký giao dịch.");
      } else if (!error?.response) {
        setStatus("Không kết nối được backend.");
      } else {
        setStatus(
          error?.response?.data?.detail ||
          error?.message ||
          "Thao tác thất bại."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100vh] p-[24px] font-sf-pro text-[#23372e] bg-[radial-gradient(circle_at_85%_12%,rgba(41,153,104,0.2),transparent_36%),radial-gradient(circle_at_8%_20%,rgba(255,191,92,0.2),transparent_34%),linear-gradient(150deg,#f7f3e6_0%,#edf4df_52%,#e0efe7_100%)]">
      <div className="max-w-[1000px] mx-auto grid gap-[20px] animate-[fade-up_550ms_ease-out]">
        <section className="bg-white/80 backdrop-blur-md border-[1px] border-[#274c3d]/15 rounded-[28px] p-[32px] shadow-[0_25px_50px_rgba(40,76,61,0.06)]">
          <div className="flex justify-between items-start flex-wrap gap-[15px]">
            <div>
              <h1 className="m-0 mb-[6px] text-[32px] md:text-[40px] text-[#20342b] font-bold tracking-tight ">
                Khởi tạo sản phẩm
              </h1>
            </div>
            <div className="flex flex-col items-end gap-[8px]">
              <div className="rounded-[999px] border-[1px] border-[#204a39]/20 bg-[#f0f7f2] px-[14px] py-[8px] text-[13px] text-[#2a5443] font-medium flex items-center gap-[6px]">
                <div
                  className={`w-[8px] h-[8px] rounded-full ${wallet ? "bg-green-500" : "bg-orange-400 animate-pulse"}`}
                ></div>
                {shortWallet}
              </div>
              {!wallet && (
                <button
                  className="inline-flex items-center justify-center rounded-[12px] px-[14px] py-[6px] text-[13px] font-semibold transition-all duration-180 hover:bg-[#2a875f] hover:text-white border-[1px] border-[#2a875f] text-[#2a875f]"
                  type="button"
                  onClick={connectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Đang kết nối..." : "Connect MetaMask"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-[24px] flex flex-wrap gap-[10px]">
            <Link
              className="inline-flex items-center gap-[8px] justify-center rounded-[14px] px-[16px] py-[10px] text-[14px] transition-all duration-180 hover:-translate-y-[2px] bg-white text-[#2e5544] border-[1px] border-[#22483a]/15 no-underline"
              to="/"
            >
              Về trang chủ
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="mt-[32px] grid gap-[28px]">
            <div className="grid gap-[18px]">
              <div className="flex items-center gap-[10px]">
                <div className="bg-[#2a875f]/10 p-[10px] rounded-[10px]">
                  <span className="text-[#2a875f] font-bold text-[14px]">
                    01
                  </span>
                </div>
                <h3 className="m-0 text-[18px] font-bold text-[#1a3a2d]">
                  Thông tin nguồn gốc
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] p-[20px] bg-[#f9fbf9]/50 rounded-[20px] border-[1px] border-[#2a875f]/10">
                <label className="grid gap-[6px]">
                  <span className="text-[13px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                    Tên sản phẩm *
                  </span>
                  <input
                    className="border-[1px] border-[#295242]/15 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] transition-all hover:border-[#2a875f]/40"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Gạo ST25 Premium"
                    required
                  />
                </label>

                <label className="grid gap-[6px]">
                  <span className="text-[13px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                    Loại sản phẩm
                  </span>
                  <input
                    className="border-[1px] border-[#295242]/15 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] transition-all hover:border-[#2a875f]/40"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    placeholder="VD: Nông sản sạch"
                  />
                </label>

                <label className="grid gap-[6px]">
                  <span className="text-[13px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                    Giống
                  </span>
                  <input
                    className="border-[1px] border-[#295242]/15 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] transition-all hover:border-[#2a875f]/40"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="VD: ST25 chuẩn thế giới"
                  />
                </label>

                <label className="grid gap-[6px]">
                  <span className="text-[13px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                    Nông trại / HTX
                  </span>
                  <input
                    className="border-[1px] border-[#295242]/15 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] transition-all hover:border-[#2a875f]/40"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="VD: HTX Sóc Trăng 1"
                  />
                </label>

                <label className="grid gap-[6px]">
                  <span className="text-[13px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                    Tọa độ / Địa chỉ
                  </span>
                  <input
                    className="border-[1px] border-[#295242]/15 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] transition-all hover:border-[#2a875f]/40"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="VD: 10.123, 105.456"
                  />
                </label>

                <label className="grid gap-[6px]">
                  <span className="text-[13px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                    Đơn vị sản xuất
                  </span>
                  <input
                    className="border-[1px] border-[#295242]/15 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] transition-all hover:border-[#2a875f]/40"
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                    placeholder="VD: Công ty CP Lương thực Miền Nam"
                  />
                </label>

                <label className="grid gap-[6px]">
                  <span className="text-[13px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                    Nhiệt độ (°C)
                  </span>
                  <input
                    className="border-[1px] border-[#295242]/15 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] transition-all hover:border-[#2a875f]/40"
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="VD: 25.5"
                  />
                </label>

                <label className="grid gap-[6px]">
                  <span className="text-[13px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                    Độ ẩm (%)
                  </span>
                  <input
                    className="border-[1px] border-[#295242]/15 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] transition-all hover:border-[#2a875f]/40"
                    value={humidity}
                    onChange={(e) => setHumidity(e.target.value)}
                    placeholder="VD: 74"
                  />
                </label>

                <label className="grid gap-[6px]">
                  <span className="text-[13px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                    Mã số vùng trồng *
                  </span>
                  <input
                    className="border-[1px] border-[#295242]/15 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] transition-all hover:border-[#2a875f]/40"
                    value={plantAreaId}
                    onChange={(e) => setPlantAreaId(e.target.value)}
                    placeholder="VD: 8648768246584765"
                    required
                  />
                </label>

                <label className="grid gap-[6px] md:col-span-2 lg:col-span-3">
                  <span className="text-[13px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                    Vùng trồng *
                  </span>
                  <input
                    className="border-[1px] border-[#295242]/15 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] transition-all hover:border-[#2a875f]/40"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="VD: Xã Đại Tâm, Huyện Mỹ Xuyên, Sóc Trăng"
                    required
                  />
                </label>
              </div>
            </div>

            {/* Phase 2: Initial Media & Log */}
            <div className="grid gap-[18px]">
              <div className="flex items-center gap-[10px]">
                <div className="bg-[#2a875f]/10 p-[10px] rounded-[10px]">
                  <span className="text-[#2a875f] font-bold text-[14px]">
                    02
                  </span>
                </div>
                <h3 className="m-0 text-[18px] font-bold text-[#1a3a2d]">
                  Nhật ký ban đầu
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                <div className="grid gap-[12px]">
                  <label className="grid gap-[6px]">
                    <span className="text-[13px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                      Mô tả giai đoạn gieo trồng
                    </span>
                    <textarea
                      className="border-[1px] border-[#295242]/15 rounded-[20px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] min-h-[160px] transition-all hover:border-[#2a875f]/40 resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Thông tin về ngày gieo, phân bón ban đầu..."
                    />
                  </label>
                </div>

                <div className="grid gap-[6px]">
                  <span className="text-[13px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                    Hình ảnh thực tế *
                  </span>
                  <label
                    className={`relative flex flex-col items-center justify-center border-[2px] border-dashed rounded-[20px] p-[28px] cursor-pointer transition-all duration-180 
                  ${image ? "border-[#2a875f] bg-[#f2faf5]" : "border-[#295242]/20 bg-white/50 hover:bg-white hover:border-[#2a875f]/50 shadow-sm"}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add(
                        "bg-[#f2faf5]",
                        "border-[#2a875f]",
                      );
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      if (!image)
                        e.currentTarget.classList.remove(
                          "bg-[#f2faf5]",
                          "border-[#2a875f]",
                        );
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) setImage(file);
                    }}
                  >
                    <input
                      className="hidden"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                    />
                    <div className="text-center">
                      {image ? (
                        <div className="flex flex-col items-center gap-[8px]">
                          <div className="w-[48px] h-[48px] rounded-full bg-[#2a875f]/15 flex items-center justify-center">
                            <span className="text-[#2a875f] text-[20px]">
                              ✓
                            </span>
                          </div>
                          <span className="text-[#1f392f] text-[14px] font-semibold break-all max-w-[200px]">
                            {image.name}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="w-[48px] h-[48px] rounded-full bg-[#2a875f]/5 flex items-center justify-center mx-auto mb-[10px]">
                            <svg
                              className="w-6 h-6 text-[#2a875f]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </div>
                          <p className="m-0 text-[14px] text-[#1f392f] font-medium">
                            Tải ảnh lên (JPG, PNG)
                          </p>
                          <p className="mt-[4px] mb-0 text-[12px] text-[#4a6d5d] opacity-60">
                            Kéo thả hoặc nhấp để chọn
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                className="w-full md:w-auto inline-flex items-center gap-[10px] justify-center rounded-xl px-20 py-10 text-[16px] cursor-pointer transition-all duration-180 hover:-translate-y-[2px] active:translate-y-[0] bg-gradient-to-br from-[#2a875f] to-[#1f6648] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  "Khởi tạo sản phẩm"
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
