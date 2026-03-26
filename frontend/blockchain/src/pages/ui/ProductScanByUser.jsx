import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductDetail } from "../../services/api.service";
import { STATUS_OPTIONS_MAP } from "../../enum/status_option";

export default function ProductScanByUser() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const latestVersion = useMemo(() => {
    if (!data?.versions?.length) return null;
    return data.versions[data.versions.length - 1];
  }, [data]);

  const traceUrl = useMemo(() => {
    if (!id) return "";
    if (typeof window === "undefined") return `/product/${id}`;
    return `${window.location.origin}/product-scan-by-user/${id}`;
  }, [id]);

  const qrImageUrl = useMemo(() => {
    if (!traceUrl) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(traceUrl)}`;
  }, [traceUrl]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getProductDetail(id);
        setData(response);
      } catch (fetchError) {
        setError(
          fetchError?.response?.data?.detail ||
            "Không thể tải thông tin sản phẩm.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const toImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  };

  const renderAdditionalInfo = (info) => {
    if (!info) return null;
    let items = [];
    try {
      const parsed = typeof info === "string" ? JSON.parse(info) : info;
      items = Object.entries(parsed);
    } catch {
      return null;
    }

    if (items.length === 0) return null;

    const labelMap = {
      fertilizer: "Phân bón",
      pesticide: "Thuốc BVTV",
      yield: "Sản lượng",
      quality: "Chất lượng",
      inspector: "Đơn vị kiểm định",
      certificate: "Chứng chỉ",
      batch_id: "Mã lô",
      expiry_date: "Hạn sử dụng",
      temperature: "Nhiệt độ",
      carrier: "Vận chuyển",
    };

    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 pt-3 border-t border-[#2a875f]/10">
        {items.map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-[#4a6d5d] tracking-wider">
              {labelMap[key] || key}
            </span>
            <span className="text-[13px] text-[#1f3d32] font-medium">
              {value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-[24px] font-sf-pro text-[#20342b] overflow-x-hidden bg-[radial-gradient(circle_at_12%_14%,rgba(255,184,91,0.2),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(46,143,106,0.22),transparent_35%),linear-gradient(155deg,#f7f3e9_0%,#eef5e2_53%,#e0efe5_100%)]">
      <div className="max-w-1200 mx-auto grid gap-10 animate-[fade-up_600ms_ease-out]">
        <div className="flex items-center justify-between gap-[12px] flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#163629] flex items-center justify-center text-[#4ade80] shadow-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="m-0 text-[24px] md:text-[32px] font-bold text-[#163629]">Xác thực nguồn gốc</h1>
              <p className="m-0 text-[13px] text-[#4a6d5d] font-medium opacity-80">Thông tin được bảo mật trên Blockchain Flare Network</p>
            </div>
          </div>
          <div className="flex items-center gap-[10px] flex-wrap">
            <span className="rounded-[999px] px-[12px] py-[8px] border-[1px] border-[#1f4436]/28 bg-white/72 text-[13px] text-[#2f5647] font-mono">
              #{id?.slice(0, 12)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-1200 mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        <main className="space-y-8">
          {loading && (
            <div className="text-center py-20 opacity-50">
              Đang xác thực dữ liệu blockchain...
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 italic">
              {error}
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Product Info Card */}
              <div className="bg-white rounded-[32px] overflow-hidden border border-[#274c3d]/10 shadow-2xl shadow-[#163629]/05">
                <div className="p-8 grid md:grid-cols-[320px_1fr] gap-10">
                  <div className="relative group overflow-hidden rounded-[24px]">
                    <img
                      src={toImageUrl(latestVersion?.image)}
                      className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      alt={data.name}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 rounded-full bg-[#163629]/80 backdrop-blur-md text-[#4ade80] text-[10px] font-black uppercase tracking-widest border border-white/20">
                        {STATUS_OPTIONS_MAP[latestVersion?.status] || "Đang cập nhật"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="mb-6">
                      <span className="text-[#2a875f] font-black text-[11px] uppercase tracking-[0.3em] mb-2 block">
                        Chứng nhận chính ngạch
                      </span>
                      <h2 className="text-[32px] md:text-[40px] font-black text-[#163629] leading-tight mb-2">
                        {data.name}
                      </h2>
                      <div className="w-16 h-1 bg-[#2a875f]/20 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                        <p className="text-[10px] font-bold text-[#4a6d5d]/60 uppercase tracking-widest mb-1">Xuất xứ</p>
                        <p className="text-[17px] text-[#163629] font-bold">{data.origin}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#4a6d5d]/60 uppercase tracking-widest mb-1">Cơ sở sản xuất</p>
                        <p className="text-[17px] text-[#163629] font-bold italic">{data.producer || "HTX Địa phương"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#4a6d5d]/60 uppercase tracking-widest mb-1">Loại sản phẩm</p>
                        <p className="text-[17px] text-[#163629] font-semibold">{data.product_type || "Nông sản"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#4a6d5d]/60 uppercase tracking-widest mb-1">Giống/Variety</p>
                        <p className="text-[17px] text-[#163629] font-semibold">{data.variety || "Bản địa"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="py-10 bg-white rounded-[32px] overflow-hidden border border-[#274c3d]/10 p-10">
                <h3 className="text-[28px] font-black text-[#163629] mb-12 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2a875f]/10 flex items-center justify-center text-[#2a875f]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Hành trình minh bạch
                </h3>
                
                <div className="space-y-12">
                  {data.versions?.map((version, idx) => (
                    <div key={version.version} className="relative group">
                      {idx !== data.versions.length - 1 && (
                        <div className="absolute left-6 top-16 bottom-[-48px] w-0.5 bg-gradient-to-b from-[#2a875f]/30 to-transparent"></div>
                      )}
                      
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="shrink-0">
                          <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#2a875f] flex items-center justify-center text-[#2a875f] font-black shadow-lg relative z-10 transition-transform group-hover:scale-110">
                            {version.version}
                          </div>
                        </div>
                        
                        <div className="flex-1 bg-white rounded-[24px] border border-gray-100 p-8 shadow-sm group-hover:shadow-md transition-all border-l-4 border-l-[#2a875f]">
                          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="px-2.5 py-0.5 rounded-lg bg-[#2a875f]/10 text-[#2a875f] text-[10px] font-black uppercase tracking-wider">
                                  {STATUS_OPTIONS_MAP[version.status]}
                                </span>
                                <span className="text-[12px] text-[#4a6d5d] font-medium italic opacity-60">
                                  {new Date(version.created_at).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <h4 className="text-[19px] font-bold text-[#163629]">
                                {version.description || `Cập nhật tại ${data.origin}`}
                              </h4>
                            </div>
                            
                            <a
                              href={`https://coston2-explorer.flare.network/tx/${version.tx_hash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 px-3 py-1.5 rounded-lg bg-[#f0f7f2] text-[#2a875f] text-[10px] font-bold hover:bg-[#2a875f] hover:text-white transition-colors flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                              Hash Verified
                            </a>
                          </div>

                          <div className="grid md:grid-cols-[180px_1fr] gap-8">
                            {version.image && (
                              <img
                                src={toImageUrl(version.image)}
                                className="w-full aspect-square object-cover rounded-xl shadow-inner border border-gray-50"
                                alt="Verification Proof"
                              />
                            )}
                            <div className="flex flex-col justify-between">
                              <div className="space-y-4">
                                {renderAdditionalInfo(version.additional_info)}
                              </div>
                              <div className="mt-6 pt-4 border-t border-gray-50 flex flex-col gap-1">
                                <span className="text-[9px] font-bold text-[#4a6d5d] uppercase tracking-widest opacity-40">Blockchain Evidence:</span>
                                <span className="text-[9px] font-mono break-all text-[#4a6d5d]/70 bg-gray-50 p-1.5 rounded-md">
                                  {version.hash}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>

        <aside className="space-y-6">
          <div className="bg-white rounded-[32px] p-8 border border-[#274c3d]/10 shadow-xl sticky top-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#4ade80]/10 flex items-center justify-center text-[#163629] mb-4">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
              <h4 className="text-[20px] font-black text-[#163629] mb-2 uppercase tracking-tight">Chứng nhận FLR</h4>
              <p className="text-[13px] text-[#4a6d5d] leading-relaxed mb-6">
                Sản phẩm đã được xác thực qua hệ thống truy xuất nguồn gốc sử dụng Smart Contract trên mạng Flare.
              </p>
              
              <div className="w-full aspect-square bg-[#f6fbf7] p-6 rounded-[24px] border-2 border-dashed border-[#2a875f]/20 mb-8 flex items-center justify-center group">
                {qrImageUrl ? (
                  <img
                    className="w-full h-full opacity-90 group-hover:scale-105 transition-transform"
                    src={qrImageUrl}
                    alt="Product QR"
                  />
                ) : (
                  <div className="animate-pulse bg-[#2a875f]/10 w-full h-full rounded-xl"></div>
                )}
              </div>

              <div className="w-full space-y-3">
                <button 
                  onClick={() => window.print()}
                  className="w-full py-4 bg-[#163629] text-white rounded-[18px] font-bold text-[14px] hover:bg-[#2a875f] shadow-lg shadow-[#163629]/20 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Lưu bằng chứng
                </button>
                <Link
                  to="/"
                  className="w-full py-4 bg-white text-[#163629] border border-[#163629]/10 rounded-[18px] font-bold text-[14px] hover:bg-gray-50 transition-all flex items-center justify-center gap-2 no-underline"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-[#163629] rounded-[32px] p-8 text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/05 rounded-full blur-2xl"></div>
            <h5 className="text-[15px] font-bold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4ade80]"></span>
              Lưu ý người dùng
            </h5>
            <p className="text-[12px] text-white/70 leading-relaxed font-medium">
              Dữ liệu được lưu trữ phân tán, đảm bảo không thể giả mạo. Hãy luôn kiểm tra mã Hash trên Flare Explorer để chắc chắn về độ xác thực.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
