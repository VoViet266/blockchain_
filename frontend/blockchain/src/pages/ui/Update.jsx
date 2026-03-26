import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { updateProductContract } from "../../services/wallet.service";
import { updateProduct } from "../../services/api.service";

const STATUS_OPTIONS = [
  { value: "PLANTED", label: "Đã trồng" },
  { value: "HARVESTED", label: "Đã thu hoạch" },
  { value: "PACKAGED", label: "Đã đóng gói" },
  { value: "SHIPPED", label: "Đã vận chuyển" },
  { value: "DELIVERED", label: "Đã giao hàng" },
  { value: "SOLD", label: "Đã bán" }
];

export default function Update() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();

  const [productId, setProductId] = useState(routeId || "");
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("Nhập thông tin cập nhật và tải ảnh mới cho phiên bản tiếp theo.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleId = useMemo(() => {
    if (!productId) return "N/A";
    return productId;
  }, [productId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!productId.trim()) {
      setMessage("Vui lòng nhập Product ID.");
      return;
    }

    if (!image) {
      setMessage("Vui lòng chọn ảnh phiên bản mới.");
      return;
    }

    const formData = new FormData();
    formData.append("id", productId.trim());
    formData.append("status", status);
    formData.append("image", image);

    try {
      setIsSubmitting(true);
      setMessage("Đang cập nhật sản phẩm lên hệ thống...");

      const response = await updateProduct(formData);
      const { uuid, hash } = response;

      setMessage("Đang yêu cầu ký giao dịch...");
      const txHash = await updateProductContract(uuid, hash);
      setMessage(`Cập nhật sản phẩm thành công! TxHash: ${txHash.slice(0, 10)}...`);
      setImage(null);
      setTimeout(() => {
        navigate(`/product/${productId.trim()}`);
      }, 2000);
    } catch (error) {
      if (!error?.response) {
        setMessage("Không kết nối được backend.");
      } else {
        setMessage(error?.response?.data?.detail || "Cập nhật thất bại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100vh] p-[24px] font-sf-pro text-[#22362d] bg-[radial-gradient(circle_at_10%_16%,rgba(255,186,95,0.2),transparent_36%),radial-gradient(circle_at_90%_10%,rgba(36,143,104,0.22),transparent_34%),linear-gradient(155deg,#f8f4ea_0%,#edf5e0_56%,#dcede5_100%)]">
      <div className="max-w-[900px] mx-auto grid gap-[14px] animate-[fade-up_540ms_ease-out]">
        <section className="bg-white/82 border-[1px] border-[#274c3d]/18 rounded-[24px] p-[24px] shadow-[0_22px_38px_rgba(39,74,59,0.08)]">

          <div className="flex items-center justify-between gap-[10px] flex-wrap">
            <h1 className="m-0 text-[30px] md:text-[4vw] lg:text-[44px] text-[#17382b] font-bold">
              Cập nhật sản phẩm
            </h1>
            <span className="rounded-[999px] border-[1px] border-[#244b3c]/25 bg-[#f6fbf7] px-[12px] py-[8px] text-[13px] text-[#2f5b4b]">
              Mã sản phẩm: #{titleId}
            </span>
          </div>

          <p className="m-0 mt-[10px] text-[#3c5d4f] leading-[1.6]">
            Thêm phiên bản mới với trạng thái mới và ảnh minh chứng để tiếp tục hành trình truy xuất.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] mt-[18px]">
              <label className="grid gap-[6px]">
                <span className="text-[13px] text-[#365748] font-semibold">Mã sản phẩm</span>
                <input
                  className="border-[1px] border-[#285242]/24 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f]"
                  value={productId}
                  readOnly
                  onChange={(event) => setProductId(event.target.value)}
                  placeholder="VD: 1"
                />
              </label>

              <label className="grid gap-[6px]">
                <span className="text-[13px] text-[#365748] font-semibold">Trạng thái</span>
                <select
                  className="border-[1px] border-[#285242]/24 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] appearance-none"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  {STATUS_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-[6px] md:col-span-2">
                <span className="text-[13px] text-[#365748] font-semibold">Hình ảnh phiên bản</span>
                <label
                  className={`relative flex flex-col items-center justify-center border-[2px] border-dashed rounded-[18px] p-[28px] cursor-pointer transition-all duration-180 
                ${image ? 'border-[#2a875f] bg-[#f0f9f4]' : 'border-[#295242]/30 bg-white/50 hover:bg-white/80 hover:border-[#2a875f]/50'}`}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-[#f0f9f4]', 'border-[#2a875f]'); }}
                  onDragLeave={(e) => { e.preventDefault(); if (!image) e.currentTarget.classList.remove('bg-[#f0f9f4]', 'border-[#2a875f]'); }}
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
                    onChange={(event) => setImage(event.target.files?.[0] || null)}
                  />
                  <div className="text-center">
                    {image ? (
                      <div className="flex flex-col items-center gap-[4px]">
                        <span className="text-[#2a875f] font-bold text-[15px]">✓ Đã chọn file thành công</span>
                        <span className="text-[#1f392f] text-[14px] break-all">{image.name}</span>
                      </div>
                    ) : (
                      <>
                        <p className="m-0 text-[14px] text-[#1f392f] font-medium">Kéo thả ảnh minh chứng hoặc nhấp để chọn</p>
                        <p className="mt-[4px] mb-0 text-[12px] text-[#3a5b4d] opacity-70">Hỗ trợ: JPG, PNG, WEBP</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-[14px] rounded-[12px] border-[1px] border-[#d6e8de] bg-[#f6fbf8] text-[#335b4b] p-[12px] text-[14px]">
              {message}
            </div>

            <div className="flex justify-end gap-[10px] mt-[16px] flex-wrap">
              <Link className="w-full md:w-auto inline-flex items-center justify-center rounded-[14px] px-[16px] py-[11px] text-[14px] transition-transform duration-180 hover:-translate-y-[2px] bg-[#f7efe0] text-[#2d5644] border-[1px] border-[#22483a]/35 no-underline" to="/">
                Về trang chủ
              </Link>
              {productId && (
                <Link className="w-full md:w-auto inline-flex items-center justify-center rounded-[14px] px-[16px] py-[11px] text-[14px] transition-transform duration-180 hover:-translate-y-[2px] bg-[#f7efe0] text-[#2d5644] border-[1px] border-[#22483a]/35 no-underline" to={`/product/${productId}`}>
                  Xem chi tiết sản phẩm
                </Link>
              )}
              <button
                className="w-full md:w-auto inline-flex items-center cursor-pointer justify-center rounded-[14px] px-[16px] py-[11px] text-[14px] transition-transform duration-180 hover:-translate-y-[2px] bg-gradient-to-br from-[#2a875f] to-[#1f6648] text-[#effff6] shadow-[0_12px_20px_rgba(31,102,72,0.23)] disabled:opacity-70"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
