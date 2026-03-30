import { useState } from "react";

const API_URL = "https://justoroaming-fakenews-backend.hf.space";

export default function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Không thể kết nối đến server. Hãy kiểm tra backend.");
    } finally {
      setLoading(false);
    }
  };

  const modelOrder = ["phobert", "cnn", "gru", "lstm"];
  const modelNames = {
    phobert: "PhoBERT",
    cnn: "CNN",
    gru: "GRU",
    lstm: "LSTM",
  };

  const majorityIsFake = result?.summary?.majority_label === "FAKE";

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <main className="app-card">
        <div className="title-wrap">
          <span className="title-pill">Medical News Detector</span>
          <h1 className="app-title">So sánh nhiều mô hình phát hiện tin giả y tế</h1>
          <p className="app-subtitle">
            Một lần phân tích, so sánh dự đoán giữa PhoBERT, CNN, GRU và LSTM.
          </p>
        </div>

        <div className="input-panel">
          <label className="input-label">Nội dung bài báo</label>
          <textarea
            className="news-input"
            placeholder="Dán tiêu đề hoặc nội dung bài báo vào đây..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
          />
          <div className="char-count">{text.length} ký tự</div>
        </div>

        <button className="analyze-btn" onClick={analyze} disabled={loading || !text.trim()}>
          {loading ? "⏳ Đang phân tích..." : "🔍 Phân tích"}
        </button>

        {error && <div className="error-box">{error}</div>}

        {result && (
          <>
            <div
              className="summary-box"
              style={{
                borderColor: majorityIsFake ? "#f87171" : "#4ade80",
                background: majorityIsFake
                  ? "linear-gradient(135deg, #fff1f2, #ffe4e6)"
                  : "linear-gradient(135deg, #ecfdf5, #dcfce7)",
              }}
            >
              <div className="summary-title">Kết quả tổng hợp</div>
              <div className="summary-main">
                {majorityIsFake ? "🔴" : "🟢"} {result.summary.majority_label_vn}
              </div>
              <div className="summary-meta">
                {result.summary.fake_votes}/{result.summary.total_models} model dự đoán Tin Giả
              </div>
            </div>

            <div className="compare-grid">
              {modelOrder.map((modelKey) => {
                const item = result?.results?.[modelKey];
                if (!item) return null;

                const isFake = item.label === "FAKE";
                return (
                  <div
                    key={modelKey}
                    className="result-card"
                    style={{
                      borderColor: isFake ? "#ef4444" : "#22c55e",
                      background: isFake
                        ? "linear-gradient(135deg, #fff6f6, #ffecec)"
                        : "linear-gradient(135deg, #f4fff8, #e8fff1)",
                    }}
                  >
                    <div className="model-head">
                      <span className="model-name">{modelNames[modelKey]}</span>
                      <span className="model-dot">{isFake ? "🔴" : "🟢"}</span>
                    </div>

                    <div className="result-text" style={{ color: isFake ? "#dc2626" : "#15803d" }}>
                      {item.label_vn}
                    </div>

                    <div className="bar-label">
                      <span>Độ chắc chắn</span>
                      <span style={{ fontWeight: 600 }}>
                        {(item.confidence * 100).toFixed(4)}%
                      </span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${item.confidence * 100}%`,
                          background: isFake ? "#ef4444" : "#22c55e",
                        }}
                      />
                    </div>

                    <p className="hint">
                      {isFake
                        ? "⚠️ Mô hình này nghiêng về tin giả."
                        : "✅ Mô hình này nghiêng về tin thật."}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
