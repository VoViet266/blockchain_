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
  const status = {
    PLANTED: "Đã trồng",
    HARVESTED: "Đã thu hoạch",
    PROCESSED: "Đã chế biến",
    PACKAGED: "Đã đóng gói",
    SHIPPED: "Đã vận chuyển",
    DELIVERED: "Đã giao hàng",
    RETURNED: "Đã trả lại",
    EXPIRED: "Đã hết hạn",
    DAMAGED: "Đã hư hỏng",
    SOLD: "Đã bán",
  };
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
            <span className="text-[14px] text-[#1f3d32] font-semibold">
              {value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-[100vh] pb-[60px] font-sf-pro text-[#20342b] bg-[#f8fbf9]">
      {/* Header */}
      <div className="bg-[#163629] text-white py-6 px-6 shadow-lg">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#4ade80]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h1 className="m-0 text-[18px] font-bold tracking-tight">
                Xác thực nguồn gốc
              </h1>
              <p className="m-0 text-[12px] text-white/60">
                Sản phẩm đã được kiểm chứng bởi Blockchain
              </p>
            </div>
          </div>
          <span className="text-[12px] font-mono bg-white/10 px-3 py-1 rounded-full border border-white/10">
            #{id?.slice(0, 8)}
          </span>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-8">
        {loading && (
          <div className="text-center py-20 opacity-40">
            Đang truy vấn dữ liệu...
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center border border-red-100">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-10">
            {/* Consumer Product Profile */}
            <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl shadow-[#20342b]/05 border border-[#20342b]/05">
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={toImageUrl(latestVersion?.image)}
                  className="w-full h-full object-cover"
                  alt={data.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full bg-[#4ade80] text-[#163629] text-[11px] font-black uppercase tracking-wider">
                        {status[latestVersion?.status] || latestVersion?.status}
                      </span>
                    </div>
                    <h2 className="text-[32px] font-black text-white leading-tight">
                      {data.name}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-[11px] font-bold text-[#4a6d5d] uppercase mb-1 tracking-widest">
                      Nguồn gốc
                    </p>
                    <p className="text-[16px] text-[#163629] font-bold">
                      {data.origin}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#4a6d5d] uppercase mb-1 tracking-widest">
                      Cơ sở sản xuất
                    </p>
                    <p className="text-[16px] text-[#163629] font-bold">
                      {data.producer || "HTX Địa phương"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                  <div className="bg-[#f0f9f1] px-4 py-2 rounded-xl flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#2a875f]">
                      {data.product_type || "Nông sản sạch"}
                    </span>
                  </div>
                  <div className="bg-[#fcf8ed] px-4 py-2 rounded-xl flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#b45309]">
                      {data.variety || "Chuẩn ST25"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consumer Timeline */}
            <div className="space-y-6 relative">
              <div className="absolute left-[24px] top-6 bottom-6 w-[2px] bg-gray-100"></div>

              <h3 className="text-[20px] font-black text-[#163629] flex items-center gap-3 ml-2">
                <div className="w-10 h-10 rounded-full bg-[#2a875f] flex items-center justify-center text-white relative z-10">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                Lịch trình sản phẩm
              </h3>

              {data.versions?.map((version, idx) => (
                <div
                  key={version.version}
                  className="relative pl-16 animate-[fade-up_500ms_ease-out]"
                >
                  <div className="absolute left-[24px] -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#2a875f] z-10"></div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[11px] font-bold text-[#2a875f] uppercase tracking-widest">
                          {status[version.status] || version.status}
                        </span>
                        <h4 className="text-[17px] font-bold text-[#163629] mt-1">
                          {version.description ||
                            `Hành trình tại ${data.origin}`}
                        </h4>
                        <p className="text-[12px] text-[#4a6d5d] mt-1 italic">
                          {new Date(version.created_at).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <div
                        className="bg-[#f0f7f2] p-2 rounded-lg border border-[#2a875f]/10"
                        title="Verified on Blockchain"
                      >
                        <svg
                          className="w-5 h-5 text-[#2a875f]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>

                    {version.image && (
                      <img
                        src={toImageUrl(version.image)}
                        className="w-full h-[200px] object-cover rounded-xl mb-4 border border-gray-50"
                        alt="Evidence"
                      />
                    )}

                    {renderAdditionalInfo(version.additional_info)}

                    <div className="mt-4 flex flex-col gap-1 opacity-40 hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-mono break-all capitalize">
                        Data Hash: {version.hash}
                      </span>
                      <a
                        href={`https://coston2-explorer.flare.network/tx/${version.tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] font-mono text-blue-600 underline"
                      >
                        Giao dịch: {version.tx_hash?.slice(0, 20)}...
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#f0f7f2] p-6 rounded-[24px] border border-[#2a875f]/20 text-center">
              <h4 className="text-[16px] font-bold text-[#163629] mb-2">
                Thông điệp từ nhà sản xuất
              </h4>
              <p className="text-[13px] text-[#4a6d5d] leading-relaxed">
                Chúng tôi cam kết minh bạch 100% dữ liệu. Mỗi bước trong hành
                trình này đều được ký số bởi đơn vị có thẩm quyền và không thể
                sửa đổi sau khi đã lên Blockchain.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
