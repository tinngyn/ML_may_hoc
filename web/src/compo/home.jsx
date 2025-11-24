import { useEffect, useMemo, useState } from "react";
import Review from "./review";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";

function Home() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDish, setSelectedDish] = useState(null);

  const apiBase = useMemo(() => API_BASE.replace(/\/$/, ""), []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${apiBase}/categories`);
        if (!res.ok) throw new Error("Không lấy được danh sách danh mục");
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories([]);
          setError("Dữ liệu danh mục không hợp lệ từ server");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCategories();
  }, [apiBase]);

  useEffect(() => {
    const fetchDishes = async () => {
      setLoading(true);
      setError("");
      try {
        const url =
          selectedCategory === "all"
            ? `${apiBase}/dishes`
            : `${apiBase}/dishes/category/${selectedCategory}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Không lấy được danh sách món ăn");
        const data = await res.json();
        if (Array.isArray(data)) {
          setDishes(data);
        } else {
          setDishes([]);
          setError("Dữ liệu món ăn không hợp lệ từ server");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [selectedCategory, apiBase]);

  return (
    <section className="menu-section">
      <div className="menu-heading">
        <p className="menu-kicker">Thực đơn hôm nay</p>
        <h2>Mời bạn chọn món</h2>
        <p className="menu-subtitle">
          Dữ liệu lấy trực tiếp từ server. Lọc theo danh mục để xem món phù hợp
          nhất.
        </p>
      </div>

      <div className="menu-filters">
        <button
          className={`menu-filter ${selectedCategory === "all" ? "is-active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          Tất cả món
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`menu-filter ${selectedCategory === cat._id ? "is-active" : ""}`}
            onClick={() => setSelectedCategory(cat._id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {error && <div className="menu-alert">{error}</div>}

      {loading ? (
        <div className="menu-loading">Đang tải món ăn...</div>
      ) : (
        <div className="menu-grid">
          {dishes.map((dish) => (
            <article key={dish._id} className="menu-card">
              <div className="menu-card__image">
                <img src={dish.image || FALLBACK_IMAGE} alt={dish.name} />
                <span className="menu-card__price">
                  {dish.price ? dish.price.toLocaleString("vi-VN") : "0"} đ
                </span>
              </div>
              <div className="menu-card__body">
                <div className="menu-card__title-row">
                  <h3>{dish.name}</h3>
                  <span className="menu-card__pill">
                    {dish.id_category?.name || "Danh mục"}
                  </span>
                </div>
                <p className="menu-card__description">
                  {dish.description || "Không có mô tả."}
                </p>
                <button
                  className="menu-card__cta"
                  onClick={() => setSelectedDish(dish)}
                >
                  Đánh giá món
                </button>
              </div>
            </article>
          ))}
          {!dishes.length && !loading && (
            <div className="menu-empty">Chưa có món nào trong danh mục này.</div>
          )}
        </div>
      )}

      {selectedDish && (
        <Review dish={selectedDish} onClose={() => setSelectedDish(null)} />
      )}
    </section>
  );
}

export default Home;
