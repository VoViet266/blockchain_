import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { updateProductContract } from "../../services/wallet.service";
import { updateProduct } from "../../services/api.service";
import { STATUS_OPTIONS } from "../../enum/status_option";

export default function Update() {
  const { id } = useParams();
  const navigate = useNavigate();

  const productId = id;
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [image, setImage] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState({});
  const [message, setMessage] = useState(
    "Nhập thông tin cập nhật và tải ảnh mới cho phiên bản tiếp theo.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderStatusSpecificFields = () => {
    switch (status) {
      case "PLANTED":
      case "GROWING":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] p-[16px] bg-[#f0f7f2]/40 rounded-[16px] border-[1px] border-[#2a875f]/10">
            <label className="grid gap-[6px]">
              <span className="text-[12px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                Loại phân bón
              </span>
              <input
                className="border-[1px] border-[#295242]/15 rounded-[10px] p-[10px] bg-white text-[#1f392f] text-[14px] outline-none focus:border-[#2a875f]"
                placeholder="VD: Phân hữu cơ vi sinh"
                onChange={(e) =>
                  setAdditionalInfo({
                    ...additionalInfo,
                    fertilizer: e.target.value,
                  })
                }
              />
            </label>
            <label className="grid gap-[6px]">
              <span className="text-[12px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                Thuốc BVTV
              </span>
              <input
                className="border-[1px] border-[#295242]/15 rounded-[10px] p-[10px] bg-white text-[#1f392f] text-[14px] outline-none focus:border-[#2a875f]"
                placeholder="VD: Không sử dụng"
                onChange={(e) =>
                  setAdditionalInfo({
                    ...additionalInfo,
                    pesticide: e.target.value,
                  })
                }
              />
            </label>
          </div>
        );
      case "HARVESTED":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] p-[16px] bg-[#fcf9f0]/40 rounded-[16px] border-[1px] border-[#d4a017]/10">
            <label className="grid gap-[6px]">
              <span className="text-[12px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                Sản lượng (kg)
              </span>
              <input
                type="number"
                className="border-[1px] border-[#295242]/15 rounded-[10px] p-[10px] bg-white text-[#1f392f] text-[14px] outline-none focus:border-[#2a875f]"
                placeholder="VD: 5000"
                onChange={(e) =>
                  setAdditionalInfo({
                    ...additionalInfo,
                    yield: e.target.value,
                  })
                }
              />
            </label>
            <label className="grid gap-[6px]">
              <span className="text-[12px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                Độ chín / Chất lượng
              </span>
              <input
                className="border-[1px] border-[#295242]/15 rounded-[10px] p-[10px] bg-white text-[#1f392f] text-[14px] outline-none focus:border-[#2a875f]"
                placeholder="VD: Chín vàng, đồng đều"
                onChange={(e) =>
                  setAdditionalInfo({
                    ...additionalInfo,
                    quality: e.target.value,
                  })
                }
              />
            </label>
          </div>
        );
      case "INSPECTED":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] p-[16px] bg-[#f0f4f7]/40 rounded-[16px] border-[1px] border-[#2a6887]/10">
            <label className="grid gap-[6px]">
              <span className="text-[12px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                Đơn vị kiểm định
              </span>
              <input
                className="border-[1px] border-[#295242]/15 rounded-[10px] p-[10px] bg-white text-[#1f392f] text-[14px] outline-none focus:border-[#2a875f]"
                placeholder="VD: Quatest 3"
                onChange={(e) =>
                  setAdditionalInfo({
                    ...additionalInfo,
                    inspector: e.target.value,
                  })
                }
              />
            </label>
            <label className="grid gap-[6px]">
              <span className="text-[12px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                Chứng chỉ
              </span>
              <input
                className="border-[1px] border-[#295242]/15 rounded-[10px] p-[10px] bg-white text-[#1f392f] text-[14px] outline-none focus:border-[#2a875f]"
                placeholder="VD: VietGAP-2024-01"
                onChange={(e) =>
                  setAdditionalInfo({
                    ...additionalInfo,
                    certificate: e.target.value,
                  })
                }
              />
            </label>
          </div>
        );
      case "PACKAGED":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] p-[16px] bg-[#fdf2f2]/40 rounded-[16px] border-[1px] border-[#d9534f]/10">
            <label className="grid gap-[6px]">
              <span className="text-[12px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                Mã lô (Batch ID)
              </span>
              <input
                className="border-[1px] border-[#295242]/15 rounded-[10px] p-[10px] bg-white text-[#1f392f] text-[14px] outline-none focus:border-[#2a875f]"
                placeholder="VD: BATCH-001-2024"
                onChange={(e) =>
                  setAdditionalInfo({
                    ...additionalInfo,
                    batch_id: e.target.value,
                  })
                }
              />
            </label>
            <label className="grid gap-[6px]">
              <span className="text-[12px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                Hạn sử dụng
              </span>
              <input
                type="date"
                className="border-[1px] border-[#295242]/15 rounded-[10px] p-[10px] bg-white text-[#1f392f] text-[14px] outline-none focus:border-[#2a875f]"
                onChange={(e) =>
                  setAdditionalInfo({
                    ...additionalInfo,
                    expiry_date: e.target.value,
                  })
                }
              />
            </label>
          </div>
        );
      case "SHIPPED":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] p-[16px] bg-[#f9f0fd]/40 rounded-[16px] border-[1px] border-[#8e44ad]/10">
            <label className="grid gap-[6px]">
              <span className="text-[12px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                Nhiệt độ bảo quản (°C)
              </span>
              <input
                type="number"
                className="border-[1px] border-[#295242]/15 rounded-[10px] p-[10px] bg-white text-[#1f392f] text-[14px] outline-none focus:border-[#2a875f]"
                placeholder="VD: 5"
                onChange={(e) =>
                  setAdditionalInfo({
                    ...additionalInfo,
                    temperature: e.target.value,
                  })
                }
              />
            </label>
            <label className="grid gap-[6px]">
              <span className="text-[12px] text-[#4a6d5d] font-bold uppercase tracking-wider">
                Đơn vị vận chuyển
              </span>
              <input
                className="border-[1px] border-[#295242]/15 rounded-[10px] p-[10px] bg-white text-[#1f392f] text-[14px] outline-none focus:border-[#2a875f]"
                placeholder="VD: Giao Hàng Tiết Kiệm"
                onChange={(e) =>
                  setAdditionalInfo({
                    ...additionalInfo,
                    carrier: e.target.value,
                  })
                }
              />
            </label>
          </div>
        );
      default:
        return null;
    }
  };

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
    formData.append("description", description);
    formData.append("location", location);
    if (temperature) formData.append("temperature", temperature);
    if (humidity) formData.append("humidity", humidity);
    formData.append("additional_info", JSON.stringify(additionalInfo));
    formData.append("image", image);

    try {
      setIsSubmitting(true);
      setMessage("Đang cập nhật sản phẩm lên hệ thống...");

      const response = await updateProduct(formData);
      const { uuid, hash } = response;

      setMessage("Đang yêu cầu ký giao dịch...");
      const txHash = await updateProductContract(uuid, hash);
      setMessage(
        `Cập nhật sản phẩm thành công! TxHash: ${txHash.slice(0, 10)}...`,
      );
      setImage(null);
      navigate(`/product/${productId.trim()}`);
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
        <section className="bg-white/82 border-[1px] border-[#274c3d]/18 backdrop-blur-md rounded-[28px] p-[32px] shadow-[0_22px_45px_rgba(39,74,59,0.07)]">
          <div className="flex items-center justify-between gap-[10px] flex-wrap">
            <div>
              <h1 className="m-0 text-[32px] md:text-[40px] text-[#17382b] font-bold tracking-tight">
                Cập nhật nhật ký
              </h1>
              <p className="m-0 mt-[6px] text-[#4a6d5d] leading-[1.6]">
                Ghi lại hành trình tiếp theo của sản phẩm trên chuỗi khối.
              </p>
            </div>
            <span className="rounded-[999px] border-[1px] border-[#244b3c]/20 bg-[#f0f6f2] px-[14px] py-[8px] text-[13px] text-[#2f5b4b] font-medium">
              ID: #{productId}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-[28px] grid gap-[24px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <label className="grid gap-[6px]">
                <span className="text-[13px] text-[#365748] font-bold uppercase tracking-wider">
                  Trạng thái mới *
                </span>
                <div className="relative">
                  <select
                    className="w-full border-[1px] border-[#285242]/20 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] appearance-none cursor-pointer transition-all hover:border-[#2a875f]/40"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="grid gap-[6px]">
                <span className="text-[13px] text-[#365748] font-bold uppercase tracking-wider">
                  Tọa độ cập nhật
                </span>
                <input
                  className="border-[1px] border-[#285242]/20 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] transition-all hover:border-[#2a875f]/40"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Để trống nếu không đổi"
                />
              </label>

              <label className="grid gap-[6px]">
                <span className="text-[13px] text-[#365748] font-bold uppercase tracking-wider">
                  Nhiệt độ
                </span>
                <input
                  className="border-[1px] border-[#285242]/20 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] transition-all hover:border-[#2a875f]/40"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="Để trống nếu không đổi"
                />
              </label>

              <label className="grid gap-[6px]">
                <span className="text-[13px] text-[#365748] font-bold uppercase tracking-wider">
                  Độ ẩm
                </span>
                <input
                  className="border-[1px] border-[#285242]/20 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] transition-all hover:border-[#2a875f]/40"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  placeholder="Để trống nếu không đổi"
                />
              </label>

              <div className="md:col-span-2">
                <label className="grid gap-[6px]">
                  <span className="text-[13px] text-[#365748] font-bold uppercase tracking-wider">
                    Thông tin chi tiết
                  </span>
                  <textarea
                    className="border-[1px] border-[#285242]/20 rounded-[12px] p-[12px] bg-white text-[#1f392f] font-inherit outline-none focus:border-[#2a875f] min-h-[100px] resize-none transition-all hover:border-[#2a875f]/40"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả công việc thực hiện trong giai đoạn này..."
                  />
                </label>
              </div>

              <div className="md:col-span-2 space-y-[12px]">
                <span className="text-[13px] text-[#365748] font-bold uppercase tracking-wider block">
                  Thông tin kỹ thuật bổ sung
                </span>
                {renderStatusSpecificFields()}
              </div>

              <div className="grid gap-[6px] md:col-span-2">
                <span className="text-[13px] text-[#365748] font-bold uppercase tracking-wider">
                  Ảnh minh chứng *
                </span>
                <label
                  className={`relative flex flex-col items-center justify-center border-[2px] border-dashed rounded-[20px] p-[32px] cursor-pointer transition-all duration-180 
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
                    onChange={(event) =>
                      setImage(event.target.files?.[0] || null)
                    }
                  />
                  <div className="text-center">
                    {image ? (
                      <div className="flex flex-col items-center gap-[8px]">
                        <div className="w-[54px] h-[54px] rounded-full bg-[#2a875f]/15 flex items-center justify-center">
                          <span className="text-[#2a875f] text-[24px]">✓</span>
                        </div>
                        <span className="text-[#1f392f] font-semibold text-[15px] break-all">
                          {image.name}
                        </span>
                        <span className="text-[#4a6d5d] text-[12px] opacity-70">
                          (Nhấp để thay đổi ảnh)
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="m-0 text-[15px] text-[#1f392f] font-bold">
                          Tải ảnh lên minh chứng
                        </p>
                        <p className="mt-[4px] mb-0 text-[13px] text-[#4a6d5d] opacity-70">
                          JPG, PNG, WEBP hỗ trợ
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-[12px] mt-[8px] flex-wrap">
              <Link
                className="w-full md:w-auto inline-flex items-center justify-center rounded-[14px] px-[20px] py-[13px] text-[14px] font-medium transition-all duration-180 hover:-translate-y-[2px] bg-white text-[#2d5644] border-[1px] border-[#22483a]/15 shadow-sm no-underline"
                to="/"
              >
                Hủy cập nhật
              </Link>
              <button
                className="w-full md:w-auto inline-flex items-center gap-[10px] cursor-pointer justify-center rounded-[14px] px-[28px] py-[13px] text-[15px] font-bold transition-all duration-180 hover:-translate-y-[2px] bg-gradient-to-br from-[#2a875f] to-[#1f6648] text-white shadow-[0_12px_24px_rgba(31,102,72,0.22)] disabled:opacity-50"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Đang ký giao dịch...</>
                ) : (
                  "Gửi lên Blockchain"
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
