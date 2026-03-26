import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductDetail } from "../../services/api.service";

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
   "PLANTED": "Đã trồng",
   "HARVESTED": "Đã thu hoạch",
   "PROCESSED": "Đã chế biến",
   "PACKAGED": "Đã đóng gói",
   "SHIPPED": "Đã vận chuyển",
   "DELIVERED": "Đã giao hàng",
   "RETURNED": "Đã trả lại",
   "EXPIRED": "Đã hết hạn",
   "DAMAGED": "Đã hư hỏng",
   "SOLD": "Đã bán"
  }
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
        setError(fetchError?.response?.data?.detail || "Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);



  const toImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  };



  return (
    <div className="min-h-[100vh] p-[24px] font-sf-pro text-[#20342b] overflow-x-hidden bg-[radial-gradient(circle_at_12%_14%,rgba(255,184,91,0.2),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(46,143,106,0.22),transparent_35%),linear-gradient(155deg,#f7f3e9_0%,#eef5e2_53%,#e0efe5_100%)]">
      <div className="max-w-[1080px] mx-auto grid gap-[16px] animate-[fade-up_600ms_ease-out]">

        {/* Top Row */}
        <div className="flex items-center justify-between gap-[12px] flex-wrap">
          <h1 className="m-0 text-[30px] md:text-[4vw] lg:text-[48px] leading-[1.08] font-bold">
            Thông tin sản phẩm
          </h1>
          <div className="flex items-center gap-[10px] flex-wrap">
            <span className="rounded-[999px] px-[12px] py-[8px] border-[1px] border-[#1f4436]/28 bg-white/72 text-[13px] text-[#2f5647]">
              Mã sản phẩm: #{id}
            </span>
          </div>
        </div>

        {loading && <div className="rounded-[16px] p-[12px] border-[1px] border-[#d6e8de] bg-[#f6fbf7] text-[#355f4f]">Đang tải thông tin sản phẩm...</div>}
        {error && !loading && <div className="rounded-[16px] p-[12px] border-[1px] border-[#ebc8c8] bg-[#fff5f5] text-[#7a3737]">{error}</div>}

        {!loading && !error && data && (
          <section className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-[14px]">

            {/* Left Column: General Info & QR */}
            <article className="bg-white/80 border-[1px] border-[#26493a]/16 rounded-[22px] h-fit p-[20px] shadow-[0_20px_38px_rgba(39,73,58,0.08)]">
              <h2 className="mt-0 text-[24px] font-bold mb-[16px]">Thông tin chung</h2>
              <div className="grid gap-[10px]">
                <div className="rounded-[12px] bg-[#f6fbf7] border-[1px] border-[#d6e8de] px-[12px] py-[10px]">
                  <p className="m-0 text-[12px] uppercase tracking-[0.08em] text-[#5a7d6d]">Tên sản phẩm</p>
                  <p className="m-[4px_0_0] text-[18px] font-semibold text-[#1f3d32] break-all">{data.name || "N/A"}</p>
                </div>
                <div className="rounded-[12px] bg-[#f6fbf7] border-[1px] border-[#d6e8de] px-[12px] py-[10px]">
                  <p className="m-0 text-[12px] uppercase tracking-[0.08em] text-[#5a7d6d]">Nguồn gốc</p>
                  <p className="m-[4px_0_0] text-[18px] font-semibold text-[#1f3d32] break-all">{data.origin || "N/A"}</p>
                </div>
                <div className="rounded-[12px] bg-[#f6fbf7] border-[1px] border-[#d6e8de] px-[12px] py-[10px]">
                  <p className="m-0 text-[12px] uppercase tracking-[0.08em] text-[#5a7d6d]">Trạng thái cuối cùng</p>
                  <p className="m-[4px_0_0] text-[18px] font-semibold text-[#1f3d32] break-all">{status[latestVersion?.status] || "N/A"}</p>
                </div>
              </div>
            </article>

            {/* Right Column: Version History */}
            <article className="bg-white/80 border-[1px] border-[#26493a]/16 rounded-[22px] p-[20px] shadow-[0_20px_38px_rgba(39,73,58,0.08)]">
              <h2 className="mt-0 text-[24px] font-bold mb-[16px]">Các giai đoạn</h2>
              {!data.versions?.length ? (
                <div className="rounded-[16px] p-[12px] border-[1px] border-[#d6e8de] bg-[#f6fbf7] text-[#355f4f]">Chưa có phiên bản nào.</div>
              ) : (
                <div className="grid gap-[10px]">
                  {data.versions.map((version) => (
                    <div className="rounded-[14px] border-[1px] border-[#274a3b]/16 bg-white p-[12px] animate-[pop-in_460ms_ease-out]" key={version.version}>
                      <div className="flex items-center justify-between gap-[10px] flex-wrap">
                        <strong className="text-[16px]">Giai đoạn {version.version}</strong>
                        <span className="rounded-[999px] px-[10px] py-[5px] bg-[#ecf8f1] text-[#246144] border-[1px] border-[#cae8d7] text-[12px] font-bold tracking-[0.04em]">
                          {status[version.status]}
                        </span>
                      </div>

                      <div className="mt-[10px] grid gap-[8px]">
                        {version.image && (
                          <img
                            className="w-full max-h-[320px] object-cover rounded-[10px] border-[1px] border-[#dbeadf]"
                            src={toImageUrl(version.image)}
                            alt={`Product version ${version.version}`}
                          />
                        )}
                        <p className="m-0 font-mono text-[12px] leading-[1.5] break-all text-[#305848]">Hash: {version.hash}</p>
                        <p className="m-0 font-mono text-[12px] leading-[1.5] break-all text-[#305848]">TxHash: {version.tx_hash}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        )}
      </div>
    </div>
  );
}