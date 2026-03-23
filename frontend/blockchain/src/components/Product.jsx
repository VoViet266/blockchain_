import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api.service";

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
    return `${window.location.origin}/product/${id}`;
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

        const response = await API.get(`/product/${id}/`);
        setData(response.data);
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

  return (
    <div className="product-page">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');

          .product-page {
            min-height: 100vh;
            padding: 24px;
            background:
              radial-gradient(circle at 12% 14%, rgba(255, 184, 91, 0.2), transparent 34%),
              radial-gradient(circle at 88% 10%, rgba(46, 143, 106, 0.22), transparent 35%),
              linear-gradient(155deg, #f7f3e9 0%, #eef5e2 53%, #e0efe5 100%);
            color: #20342b;
            font-family: "Space Grotesk", sans-serif;
          }

          .product-shell {
            max-width: 1080px;
            margin: 0 auto;
            display: grid;
            gap: 16px;
            animation: fade-up 600ms ease-out;
          }

          .top-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
          }

          .title {
            margin: 0;
            font-size: clamp(30px, 4vw, 48px);
            line-height: 1.08;
            font-family: "Fraunces", serif;
          }

          .id-tag {
            border-radius: 999px;
            padding: 8px 12px;
            border: 1px solid rgba(31, 68, 54, 0.28);
            background: rgba(255, 255, 255, 0.72);
            font-size: 13px;
            color: #2f5647;
          }

          .btn-link {
            border-radius: 12px;
            padding: 10px 14px;
            text-decoration: none;
            border: 1px solid rgba(31, 67, 54, 0.35);
            background: #f8f0e3;
            color: #274c3d;
            font-weight: 600;
            transition: transform 0.18s ease;
          }

          .btn-link:hover {
            transform: translateY(-2px);
          }

          .grid {
            display: grid;
            gap: 14px;
            grid-template-columns: 0.95fr 1.05fr;
          }

          .card {
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(38, 73, 58, 0.16);
            border-radius: 22px;
            padding: 20px;
            box-shadow: 0 20px 38px rgba(39, 73, 58, 0.08);
          }

          .kv {
            display: grid;
            gap: 10px;
          }

          .kv-item {
            border-radius: 12px;
            background: #f6fbf7;
            border: 1px solid #d6e8de;
            padding: 10px 12px;
          }

          .kv-label {
            margin: 0;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #5a7d6d;
          }

          .kv-value {
            margin: 4px 0 0;
            font-size: 18px;
            font-weight: 600;
            color: #1f3d32;
            word-break: break-all;
          }

          .loading,
          .error,
          .empty {
            border-radius: 16px;
            padding: 12px;
            border: 1px solid #d6e8de;
            background: #f6fbf7;
            color: #355f4f;
          }

          .error {
            border-color: #ebc8c8;
            background: #fff5f5;
            color: #7a3737;
          }

          .timeline {
            display: grid;
            gap: 10px;
          }

          .timeline-item {
            border-radius: 14px;
            border: 1px solid rgba(39, 74, 59, 0.16);
            background: #ffffff;
            padding: 12px;
            animation: pop-in 460ms ease-out;
          }

          .timeline-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
          }

          .status-pill {
            border-radius: 999px;
            padding: 5px 10px;
            background: #ecf8f1;
            color: #246144;
            border: 1px solid #cae8d7;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.04em;
          }

          .timeline-body {
            margin-top: 10px;
            display: grid;
            gap: 8px;
          }

          .preview {
            width: 100%;
            max-height: 220px;
            object-fit: cover;
            border-radius: 10px;
            border: 1px solid #dbeadf;
          }

          .mono {
            margin: 0;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
            font-size: 12px;
            line-height: 1.5;
            word-break: break-all;
            color: #305848;
          }

          .qr-card {
            margin-top: 14px;
            border: 1px dashed rgba(39, 74, 59, 0.32);
            border-radius: 16px;
            padding: 14px;
            background: #fbfffc;
            display: grid;
            gap: 10px;
          }

          .qr-head {
            margin: 0;
            font-size: 16px;
            color: #204031;
          }

          .qr-sub {
            margin: 0;
            font-size: 13px;
            color: #456859;
          }

          .qr-layout {
            display: grid;
            grid-template-columns: minmax(96px, 120px) minmax(0, 1fr);
            gap: 12px;
            align-items: start;
          }

          .qr-box {
            background: #ffffff;
            border: 1px solid #d4e7dc;
            border-radius: 12px;
            padding: 10px;
            width: 100%;
            max-width: 120px;
            aspect-ratio: 1 / 1;
            box-sizing: border-box;
            display: grid;
            place-items: center;
          }

          .qr-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
          }

          .qr-url {
            margin: 0;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
            font-size: 12px;
            color: #2d5646;
            word-break: break-all;
          }

          .qr-details {
            min-width: 0;
          }

          .qr-actions {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            margin-top: 8px;
          }

          .qr-btn {
            border: 1px solid rgba(31, 67, 54, 0.35);
            background: #f8f0e3;
            color: #274c3d;
            border-radius: 10px;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            white-space: normal;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
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

          @keyframes pop-in {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 920px) {
            .grid {
              grid-template-columns: 1fr;
            }

            .qr-layout {
              grid-template-columns: 1fr;
            }

            .qr-box {
              max-width: 140px;
            }
          }

          @media (max-width: 740px) {
            .qr-actions {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 560px) {
            .product-page {
              padding: 16px;
            }

            .card {
              border-radius: 18px;
              padding: 16px;
            }
          }
        `}
      </style>

      <div className="product-shell">
        <div className="top-row">
          <h1 className="title">Product Trace</h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span className="id-tag">Product ID: #{id}</span>
            <Link className="btn-link" to="/">
              Về trang chủ
            </Link>
            <Link className="btn-link" to={`/update/${id}`}>
              Cập nhật sản phẩm
            </Link>
            <Link className="btn-link" to="/create">
              Tạo sản phẩm mới
            </Link>
          </div>
        </div>

        {loading && <div className="loading">Đang tải thông tin sản phẩm...</div>}
        {error && !loading && <div className="error">{error}</div>}

        {!loading && !error && data && (
          <section className="grid">
            <article className="card">
              <h2 style={{ marginTop: 0 }}>Thông tin chung</h2>
              <div className="kv">
                <div className="kv-item">
                  <p className="kv-label">Name</p>
                  <p className="kv-value">{data.product?.name || "N/A"}</p>
                </div>
                <div className="kv-item">
                  <p className="kv-label">Origin</p>
                  <p className="kv-value">{data.product?.origin || "N/A"}</p>
                </div>
                <div className="kv-item">
                  <p className="kv-label">Latest Status</p>
                  <p className="kv-value">{latestVersion?.status || "N/A"}</p>
                </div>
              </div>

              <section className="qr-card">
                <h3 className="qr-head">QR Truy Xuất Nguồn Gốc</h3>
                <p className="qr-sub">In mã này và dán lên sản phẩm. Người dùng quét sẽ mở trang thông tin chi tiết.</p>

                <div className="qr-layout">
                  <div className="qr-box">
                    {qrImageUrl && <img className="qr-image" src={qrImageUrl} alt={`QR truy xuất sản phẩm ${id}`} />}
                  </div>

                  <div className="qr-details">
                    <p className="qr-url">{traceUrl}</p>
                    <div className="qr-actions">
                      <button className="qr-btn" type="button" onClick={downloadQr}>
                        Tải QR
                      </button>
                      <a className="qr-btn" href={traceUrl} target="_blank" rel="noreferrer">
                        Mở Link Truy Xuất
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            </article>

            <article className="card">
              <h2 style={{ marginTop: 0 }}>Lịch sử phiên bản</h2>

              {!data.versions?.length ? (
                <div className="empty">Chưa có phiên bản nào cho sản phẩm này.</div>
              ) : (
                <div className="timeline">
                  {data.versions.map((version) => (
                    <div className="timeline-item" key={version.version}>
                      <div className="timeline-head">
                        <strong>Version {version.version}</strong>
                        <span className="status-pill">{version.status}</span>
                      </div>

                      <div className="timeline-body">
                        {version.image && (
                          <img
                            className="preview"
                            src={toImageUrl(version.image)}
                            alt={`Product version ${version.version}`}
                          />
                        )}
                        <p className="mono">Hash: {version.hash}</p>
                        <p className="mono">Tx: {version.tx_hash}</p>
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