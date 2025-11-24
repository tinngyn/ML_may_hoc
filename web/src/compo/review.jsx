import { useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

function Review({ dish, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    note: "",
    score: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiBase = useMemo(() => API_BASE.replace(/\/$/, ""), []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch(`${apiBase}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          score: Number(formData.score),
          comment: formData.note,
          dishId: dish?._id || dish?.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Gửi đánh giá thất bại");
      }

      setSuccess("Đã gửi đánh giá, cảm ơn bạn!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-overlay">
      <div className="review-card">
        <div className="review-header">
          <div>
            <p className="review-kicker">Đánh giá món</p>
            <h3>{dish.name}</h3>
          </div>
          <button className="review-close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        <form className="review-form" onSubmit={handleSubmit}>
          <label className="review-field">
            <span>Họ và tên</span>
            <input
              name="name"
              type="text"
              placeholder="Nhập tên của bạn"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="review-field">
            <span>Số điện thoại</span>
            <input
              name="phone"
              type="tel"
              placeholder="09xx xxx xxx"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </label>

          <label className="review-field">
            <span>Điểm đánh giá (1 - 5)</span>
            <select
              name="score"
              value={formData.score}
              onChange={handleChange}
              required
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label className="review-field">
            <span>Góp ý món</span>
            <textarea
              name="note"
              rows="4"
              placeholder="Món ngon, khẩu vị vừa miệng..."
              value={formData.note}
              onChange={handleChange}
              required
            />
          </label>

          {error && <div className="menu-alert">{error}</div>}
          {success && <div className="menu-alert success">{success}</div>}

          <button type="submit" className="review-submit" disabled={submitting}>
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Review;
