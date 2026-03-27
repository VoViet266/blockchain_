import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
        {/* Header */}
        <div className="flex items-center justify-between gap-[12px] flex-wrap">
          <h1 className="m-0 text-[30px] md:text-[4vw] lg:text-[48px] leading-[1.08] font-bold">
            Thông tin sản phẩm
          </h1>
          <div className="flex items-center gap-[10px] flex-wrap">
            <span className="rounded-[999px] px-[12px] py-[8px] border-[1px] border-[#1f4436]/28 bg-white/72 text-[13px] text-[#2f5647] font-mono">
              #{id}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-1200 mx-auto px-6 mt-8 space-y-8">
        {loading && (
          <div className="text-center py-20 opacity-50 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#2a875f]/20 border-t-[#2a875f] rounded-full animate-spin"></div>
            <p className="font-bold text-[#2a875f]">
              Đang truy xuất dữ liệu nông sản...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Main Product Info Card */}
            <div className="bg-white rounded-[22px] overflow-hidden border border-[#274c3d]/10">
              <div className="p-8 grid md:grid-cols-[280px_1fr] gap-8">
                <div className="relative group">
                  <img
                    src={toImageUrl(latestVersion?.image)}
                    className="w-full aspect-square object-cover rounded-2xl group-hover:scale-[1.02] transition-transform duration-500"
                    alt={data.name}
                  />
                </div>

                <div className="flex flex-col h-full">
                  <div className="relative pb-6 border-b border-[#2a875f]/10">
                    <span className="text-[#2a875f] font-extrabold text-[12px] uppercase tracking-[0.2em] mb-2 block">
                      Thông tin sản phẩm
                    </span>
                    <h2 className="text-[28px] md:text-[32px] font-black text-[#163629] leading-tight">
                      {data.name}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 py-8">
                    <div className="space-y-6">
                      <div className="flex flex-col">
                        <p className="text-[11px] font-bold text-[#4a6d5d]/70 uppercase tracking-widest mb-1">
                          Loại sản phẩm
                        </p>
                        <p className="text-[17px] text-[#163629] font-semibold">
                          {data.product_type || "Nông sản"}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[11px] font-bold text-[#4a6d5d]/70 uppercase tracking-widest mb-1">
                          Giống cây trồng
                        </p>
                        <p className="text-[17px] text-[#163629] font-semibold">
                          {data.variety || "Bản địa"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex flex-col">
                        <p className="text-[11px] font-bold text-[#4a6d5d]/70 uppercase tracking-widest mb-1">
                          Đơn vị sản xuất
                        </p>
                        <p className="text-[17px] text-[#163629] font-semibold italic">
                          {data.farm_name ||
                            data.producer ||
                            "Nông trại địa phương"}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[11px] font-bold text-[#4a6d5d]/70 uppercase tracking-widest mb-1">
                          Vùng canh tác
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[16px] text-[#163629] font-bold">
                            {data.origin}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-[#2a875f]/10">
                    <div className="inline-flex items-center gap-3 bg-[#2a875f] text-white px-6 py-3 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase opacity-80 leading-none mb-1">
                          Trạng thái hiện tại
                        </span>
                        <span className="text-[14px] font-black uppercase tracking-wider">
                          {STATUS_OPTIONS_MAP[latestVersion?.status] ||
                            "Đang cập nhật"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[22px] overflow-hidden border border-[#274c3d]/10 p-8">
              <h3 className="text-[32px] font-black text-[#163629] mb-12">
                Quá Trình Sản Xuất
              </h3>

              <div className="space-y-16">
                {data.versions
                  ?.slice()
                  .reverse()
                  .map((version, idx) => (
                    <div key={version.version}>
                      <div className="bg-white rounded-[20px] p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-6 min-h-80">
                          <div>
                            <div className="flex items-center gap-10 mb-5">
                              <span className="px-3 py-1 rounded-2xl bg-[#2a875f]/10 text-[#2a875f] text-[11px] font-bold uppercase tracking-wider">
                                {STATUS_OPTIONS_MAP[version.status] ||
                                  version.status}
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
                            <h4 className="text-[20px] font-bold text-[#163629]">
                              {version.description ||
                                `Giai đoạn ${STATUS_OPTIONS_MAP[version.status]?.toLowerCase()}`}
                            </h4>
                          </div>

                          <div className="flex flex-col gap-2 items-end shrink-0">
                            <a
                              href={`https://coston2-explorer.flare.network/tx/${version.tx_hash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-mono text-[#4a6d5d] hover:text-[#2a875f] flex items-center gap-1"
                            >
                              Tx: {version.tx_hash?.slice(0, 22)}...
                            </a>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-[200px_1fr] gap-8">
                          {version.image && (
                            <img
                              src={toImageUrl(version.image)}
                              className="w-full aspect-4/3 object-cover rounded-xl"
                              alt="Stage evidence"
                            />
                          )}
                          <div className="flex flex-col justify-start">
                            {renderAdditionalInfo(version.additional_info)}
                            <div className="mt-6 flex flex-1 items-end gap-2">
                              <span className="text-[10px] font-bold text-[#4a6d5d] uppercase tracking-widest opacity-50">
                                Content Hash:
                              </span>
                              <span className="text-[10px] font-mono break-all text-[#4a6d5d]">
                                {version.hash}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {idx < (data.versions?.length ?? 0) - 1 && (
                        <div className="border-b border-[#274c3d]/7 mt-16"></div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="h-20"></div>
    </div>
  );
}
