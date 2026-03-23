import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../services/api.service";

const STATUS_OPTIONS = ["PLANTED", "HARVESTED", "PACKAGED", "SHIPPED", "DELIVERED", "SOLD"];

export default function Update() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();

  const [productId, setProductId] = useState(routeId || "");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
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

      await API.post("/update/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Cập nhật sản phẩm thành công.");
      setImage(null);
      navigate(`/product/${productId.trim()}`);
    } catch (error) {
      if (!error?.response) {
        setMessage("Không kết nối được backend. Hãy kiểm tra Django server.");
      } else {
        setMessage(error?.response?.data?.detail || "Cập nhật thất bại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="update-page">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');

          .update-page {
            min-height: 100vh;
            padding: 24px;
            background:
              radial-gradient(circle at 10% 16%, rgba(255, 186, 95, 0.2), transparent 36%),
              radial-gradient(circle at 90% 10%, rgba(36, 143, 104, 0.22), transparent 34%),
              linear-gradient(155deg, #f8f4ea 0%, #edf5e0 56%, #dcede5 100%);
            color: #22362d;
            font-family: "Space Grotesk", sans-serif;
          }

          .update-shell {
            max-width: 900px;
            margin: 0 auto;
            display: grid;
            gap: 14px;
            animation: fade-up 540ms ease-out;
          }

          .update-card {
            background: rgba(255, 255, 255, 0.82);
            border: 1px solid rgba(39, 76, 61, 0.18);
            border-radius: 24px;
            padding: 24px;
            box-shadow: 0 22px 38px rgba(39, 74, 59, 0.08);
          }

          .header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
          }

          .title {
            margin: 0;
            font-family: "Fraunces", serif;
            font-size: clamp(30px, 4vw, 44px);
            color: #17382b;
          }

          .id-pill {
            border-radius: 999px;
            border: 1px solid rgba(36, 75, 60, 0.25);
            background: #f6fbf7;
            padding: 8px 12px;
            font-size: 13px;
            color: #2f5b4b;
          }

          .sub {
            margin: 10px 0 0;
            color: #3c5d4f;
            line-height: 1.6;
          }

          .row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 18px;
          }

          .field {
            display: grid;
            gap: 6px;
          }

          .label {
            font-size: 13px;
            color: #365748;
            font-weight: 600;
          }

          .input,
          .select,
          .file {
            border: 1px solid rgba(40, 82, 66, 0.24);
            border-radius: 12px;
            background: #fff;
            color: #1f392f;
            font: inherit;
          }

          .input,
          .select {
            padding: 12px;
          }

          .file {
            padding: 9px;
          }

          .full {
            grid-column: 1 / -1;
          }

          .message {
            margin-top: 14px;
            border-radius: 12px;
            border: 1px solid #d6e8de;
            background: #f6fbf8;
            color: #335b4b;
            padding: 12px;
            font-size: 14px;
          }

          .actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 16px;
            flex-wrap: wrap;
          }

          .btn {
            border: none;
            border-radius: 14px;
            padding: 11px 16px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: transform 0.18s ease;
          }

          .btn:hover {
            transform: translateY(-2px);
          }

          .btn-primary {
            background: linear-gradient(135deg, #2a875f, #1f6648);
            color: #effff6;
          }

          .btn-ghost {
            background: #f7efe0;
            color: #2d5644;
            border: 1px solid rgba(34, 72, 58, 0.35);
          }

          @keyframes fade-up {
            from {
              opacity: 0;
              transform: translateY(14px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 700px) {
            .update-page {
              padding: 16px;
            }

            .update-card {
              border-radius: 18px;
              padding: 18px;
            }

            .row {
              grid-template-columns: 1fr;
            }

            .actions .btn {
              width: 100%;
              text-align: center;
            }
          }
        `}
      </style>

      <div className="update-shell">
        <section className="update-card">
          <div className="header-row">
            <h1 className="title">Update Product</h1>
            <span className="id-pill">Product ID: #{titleId}</span>
          </div>

          <p className="sub">Thêm phiên bản mới với trạng thái mới và ảnh minh chứng để tiếp tục hành trình truy xuất.</p>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <label className="field">
                <span className="label">Product ID</span>
                <input
                  className="input"
                  value={productId}
                  onChange={(event) => setProductId(event.target.value)}
                  placeholder="VD: 1"
                />
              </label>

              <label className="field">
                <span className="label">Status</span>
                <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
                  {STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field full">
                <span className="label">Version Image</span>
                <input
                  className="file"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImage(event.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="message">{message}</div>

            <div className="actions">
              <Link className="btn btn-ghost" to="/">
                Về trang chủ
              </Link>
              {productId && (
                <Link className="btn btn-ghost" to={`/product/${productId}`}>
                  Xem chi tiết sản phẩm
                </Link>
              )}
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang cập nhật..." : "Update Product"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
