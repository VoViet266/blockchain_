import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { getProductDetail } from "../../services/api.service";

export default function Product() {
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

  const downloadQr = () => {
    if (!id || !qrImageUrl) return;
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `product-${id}-qr.png`;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.click();
  };
const printQr = () => {
  if (!id || !qrImageUrl) return;

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);
  const iframeDoc = iframe.contentWindow.document;

  iframeDoc.open();
  iframeDoc.write(`
    <html>
      <head>
        <title>Print QR</title>
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          img {
            max-width: 300px;
          }
        </style>
      </head>
      <body>
        <img src="${qrImageUrl}" onload="window.print();" />
      </body>
    </html>
  `);
  iframeDoc.close();

    iframe.contentWindow.onafterprint = () => {
    document.body.removeChild(iframe);
  };
};
  return (
    <div className="min-h-[100vh] p-[24px] font-sf-pro text-[#20342b] overflow-x-hidden bg-[radial-gradient(circle_at_12%_14%,rgba(255,184,91,0.2),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(46,143,106,0.22),transparent_35%),linear-gradient(155deg,#f7f3e9_0%,#eef5e2_53%,#e0efe5_100%)]">
      <div className="max-w-[1080px] mx-auto grid gap-[16px] animate-[fade-up_600ms_ease-out]">

     
        <div className="flex items-center justify-between gap-[12px] flex-wrap">
          <h1 className="m-0 text-[30px] md:text-[4vw] lg:text-[48px] leading-[1.08] font-bold">
            Thông tin sản phẩm
          </h1>
          <div className="flex items-center gap-[10px] flex-wrap">
            <span className="rounded-[999px] px-[12px] py-[8px] border-[1px] border-[#1f4436]/28 bg-white/72 text-[13px] text-[#2f5647]">
              Mã sản phẩm: #{id}
            </span>
            <Link className="rounded-full px-[14px] py-8 text-[13px] no-underline border-[1px] border-[#1f4336]/35 bg-[#f8f0e3] text-[#274c3d] transition-transform duration-180 hover:-translate-y-[2px]" to="/">
              Về trang chủ
            </Link>
            <Link className="rounded-full px-[14px] py-8 text-[13px] no-underline border-[1px] border-[#1f4336]/35 bg-[#f8f0e3] text-[#274c3d] transition-transform duration-180 hover:-translate-y-[2px]" to={`/update/${id}`}>
              Cập nhật sản phẩm
            </Link>
            
          </div>
        </div>

        {loading && <div className="rounded-[16px] p-[12px] border-[1px] border-[#d6e8de] bg-[#f6fbf7] text-[#355f4f]">Đang tải thông tin sản phẩm...</div>}
        {error && !loading && <div className="rounded-[16px] p-[12px] border-[1px] border-[#ebc8c8] bg-[#fff5f5] text-[#7a3737]">{error}</div>}

        {!loading && !error && data && (
          <section className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-[14px]">

            {/* Left Column: General Info & QR */}
            <article className="bg-white/80 border-[1px] border-[#26493a]/16 rounded-[22px] p-[20px] shadow-[0_20px_38px_rgba(39,73,58,0.08)]">
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

              {/* QR Section */}
              <section className="mt-[14px] border-[1px] border-dashed border-[#274a3b]/32 rounded-[16px] p-[14px] bg-[#fbfffc] grid gap-[10px]">
                <h3 className="m-0 text-[16px] text-[#204031] font-bold">QR Truy Xuất Nguồn Gốc</h3>
                <p className="m-0 text-[13px] text-[#456859]">In mã này và dán lên sản phẩm. Người dùng quét sẽ mở trang thông tin chi tiết.</p>

                <div className="grid grid-cols-1 sm:grid-cols-[minmax(96px,120px)_minmax(0,1fr)] gap-[12px] items-start">
                  <div className="bg-white border-[1px] border-[#d4e7dc] rounded-[12px] p-[10px] w-full max-w-[120px] aspect-square flex items-center justify-center">
                    {qrImageUrl && <img className="w-full h-full object-contain block" src={qrImageUrl} alt={`QR truy xuất sản phẩm ${id}`} />}
                  </div>

                  <div className="min-w-0">
                    <Link className="m-0 font-mono text-[12px] text-[#2d5646] break-all" to={traceUrl}>{traceUrl}</Link>
                    <div className="grid grid-cols-2 gap-[8px] mt-[8px]">
                      <button className="border-[1px] border-[#1f4336]/35 bg-[#f8f0e3] text-[#274c3d] rounded-[10px] px-[12px] py-[8px] text-[13px] cursor-pointer text-center" type="button" onClick={downloadQr}>
                        Tải QR
                      </button>
                      <button className="border-[1px] border-[#1f4336]/35 bg-[#f8f0e3] text-[#274c3d] rounded-[10px] px-[12px] py-[8px] text-[13px] cursor-pointer text-center" type="button" onClick={printQr}>
                        In QR
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </article>

            <article className="bg-white/80 border-[1px] border-[#26493a]/16 rounded-[22px] p-[20px] shadow-[0_20px_38px_rgba(39,73,58,0.08)]">
              <h2 className="mt-0 text-[24px] font-bold mb-[16px]">Lịch sử phiên bản</h2>
              {!data.versions?.length ? (
                <div className="rounded-[16px] p-[12px] border-[1px] border-[#d6e8de] bg-[#f6fbf7] text-[#355f4f]">Chưa có phiên bản nào.</div>
              ) : (
                <div className="grid gap-[10px]">
                  {data.versions.map((version) => (
                    <div className="rounded-[14px] border-[1px] border-[#274a3b]/16 bg-white p-[12px] animate-[pop-in_460ms_ease-out]" key={version.version}>
                      <div className="flex items-center justify-between gap-[10px] flex-wrap">
                        <strong className="text-[16px]">Version {version.version}</strong>
                        <span className="rounded-[999px] px-[10px] py-[5px] bg-[#ecf8f1] text-[#246144] border-[1px] border-[#cae8d7] text-[12px] font-bold tracking-[0.04em]">
                          {version.status}
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