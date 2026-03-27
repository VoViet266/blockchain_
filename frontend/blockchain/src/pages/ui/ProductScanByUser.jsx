import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { getProductDetail } from "../../services/api.service";
import { STATUS_OPTIONS, STATUS_OPTIONS_MAP } from "../../enum/status_option";

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
    iframeDoc.write(
      `<html><head><title>Print QR</title><style>body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;}img{max-width:300px;}</style></head><body><img src="${qrImageUrl}" onload="window.print();" /></body></html>`,
    );
    iframeDoc.close();
    iframe.contentWindow.onafterprint = () => document.body.removeChild(iframe);
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
          <h1 className="m-0 text-[34px]! md:text-[4vw] lg:text-[48px] leading-[1.08] font-bold">
            Thông tin sản phẩm
          </h1>
          <div className="flex items-center gap-[10px] flex-wrap">
            <span className="rounded-[999px] px-[12px] py-[8px] border-[1px] border-[#1f4436]/28 bg-white/72 text-[13px] text-[#2f5647]">
              Mã sản phẩm: #{id}
            </span>
            <Link
              className="rounded-full px-[14px] py-8 text-[13px] no-underline border-[1px] border-[#1f4336]/35 bg-[#f8f0e3] text-[#274c3d] transition-transform duration-180 hover:-translate-y-[2px]"
              to="/"
            >
              Về trang chủ
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to={`/update/${id}`}
                className="rounded-full px-[14px] py-8 text-[13px] no-underline border-[1px] border-[#1f4336]/35 bg-[#f8f0e3] text-[#274c3d] transition-transform duration-180 hover:-translate-y-[2px]"
              >
                Cập nhật sản phẩm
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-1200 mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 mt-20">
        {/* Main Content: The Story */}
        <main className="space-y-8">
          {loading && (
            <div className="text-center py-20 opacity-50">
              Đang tải hành trình sản phẩm...
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
              {error}
            </div>
          )}

          {!loading && !error && data && (
            <>
              <div className="bg-white p-20 rounded-[22px] overflow-hidden border border-[#274c3d]/10  ">
                {/* <span className="text-[#163629] text-2xl font-semibold block">
                  Thông tin chi tiết
                </span> */}
                <div className="grid md:grid-cols-[200px_1fr] gap-8">
                  <div className="relative group">
                    <img
                      src={toImageUrl(latestVersion?.image)}
                      className="w-full aspect-square object-cover rounded-2xl group-hover:scale-[1.02] transition-transform duration-500"
                      alt={data.name}
                    />
                  </div>

                  <div className="flex flex-col h-full bg-white/40">
                    {/* Header: Tên sản phẩm */}
                    <div className="relative flex justify-between pb-6 border-[#2a875f]/10">
                      <h2 className="text-xl md:text-[32px] font-semibold leading-tight">
                        {data.name}
                      </h2>
                      <div className="border-[#2a875f]/10 cursor-default">
                        <div className="inline-flex items-center gap-3 bg-[#2a875f] text-white px-10 py-4 rounded-full">
                          <div className="flex flex-col">
                            <span className="text-[14px]">
                              {STATUS_OPTIONS_MAP[latestVersion?.status] ||
                                "Đang cập nhật"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 rounded-xl md:grid-cols-2 gap-y-8 gap-x-12 py-8">
                      {/* Loại & Giống */}
                      <div className="space-y-6">
                        <div className="flex flex-col">
                          <p className="text-[14px] font-medium text-[#4a6d5d]/70 mb-1">
                            Loại sản phẩm
                          </p>
                          <p className="text-lg">
                            {data.product_type || "Nông sản"}
                          </p>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[14px] font-medium text-[#4a6d5d]/70 mb-1">
                            Giống cây trồng
                          </p>
                          <p className="text-lg">
                            {data.variety || "Bản địa"}
                          </p>
                        </div>
                      </div>

                      {/* Nông trại & Vùng trồng */}
                      <div className="space-y-6">
                        <div className="flex flex-col">
                          <p className="text-[14px] font-medium text-[#4a6d5d]/70 mb-1">
                            Đơn vị sản xuất
                          </p>
                          <p className="text-lg">
                            {data.farm_name || "Nông trại địa phương"}
                          </p>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[14px] font-medium text-[#4a6d5d]/70 mb-1">
                            Vùng canh tác
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-lg">
                              {data.origin}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>


                  </div>
                </div>
              </div>

              <div className="p-20 relative bg-white rounded-[22px] overflow-hidden border border-[#274c3d]/10">
                <h3 className="text-[32px] font-black text-[#163629] mb-12 ">
                  Các giai đoạn
                </h3>
                <div className="space-y-16">
                  {data.versions?.map((version, idx) => (
                    <>
                      {" "}
                      <div>
                        <div className="flex-1 bg-white rounded-[20px]  p-6 md:p-8">
                          <div className="grid md:grid-cols-[200px_1fr] gap-8">
                            {version.image && (
                              <img
                                src={toImageUrl(version.image)}
                                className="w-full aspect-4/3 object-cover rounded-xl"
                                alt="Stage evidence"
                              />
                            )}
                            <div className="flex flex-col justify-start">
                              <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-6">
                                {/* header card */}
                                <div>
                                  <div className="flex items-center gap-10 mb-5">
                                    <span className="px-10 py-6 rounded-2xl bg-[#2a875f]/10 text-[#2a875f] text-[12px]">
                                      {STATUS_OPTIONS_MAP[version.status]}
                                    </span>
                                    <span className="text-[12px] text-[#4a6d5d] font-medium">
                                      {new Date(
                                        version.created_at,
                                      ).toLocaleDateString("vi-VN", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-[14px] text-[#4a6d5d] pl-4 py-1 min-h-100">
                                {version.description || "Không có mô tả"}
                              </p>
                              {renderAdditionalInfo(version.additional_info)}
                              <div className="mt-6 flex flex-1 items-end gap-2">
                                <span className="text-[14px] text-[#4a6d5d]">
                                  Mã băm nội dung:
                                </span>
                                <span className="text-[12px] break-all text-[#4a6d5d]">
                                  {version.hash}
                                </span>
                              </div>
                              <div className="mt-6 flex flex-1 items-end gap-2">
                                <span className="text-[14px] text-[#4a6d5d]">
                                  Mã giao dịch:
                                </span>
                                <a
                                  href={`https://coston2-explorer.flare.network/tx/${version.tx_hash}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[12px] text-[#4a6d5d] hover:text-[#2a875f] flex items-center gap-1"
                                >
                                  {version.tx_hash?.slice(0, 22)}...
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
