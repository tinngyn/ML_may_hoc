import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

function AdminDashboard({ onClose }) {
  const apiBase = useMemo(() => API_BASE.replace(/\/$/, ""), []);
  const [token, setToken] = useState(
    () => localStorage.getItem("adminToken") || ""
  );
  const [username, setUsername] = useState(
    () => localStorage.getItem("adminUser") || ""
  );
  const [loginForm, setLoginForm] = useState({
    username: "admin",
    password: "123456",
  });
  const [catName, setCatName] = useState("");
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [dishForm, setDishForm] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    image: "",
    id_category: "",
  });
  const [reviews, setReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState("");
  const [starFilter, setStarFilter] = useState("all");          // ⭐ lọc theo sao
  const [sentimentFilter, setSentimentFilter] = useState("all"); // 🤖 lọc theo AI
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("categories");

  const authedFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        "x-admin-token": token || "",
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Request failed");
    }
    return res.json();
  };

  const loadData = async () => {
    try {
      const [catRes, dishRes, reviewRes] = await Promise.all([
        fetch(`${apiBase}/categories`).then((r) => r.json()),
        fetch(`${apiBase}/dishes`).then((r) => r.json()),
        token
          ? authedFetch(`${apiBase}/reviews`).catch(() => [])
          : Promise.resolve([]),
      ]);
      setCategories(Array.isArray(catRes) ? catRes : []);
      setDishes(Array.isArray(dishRes) ? dishRes : []);
      setReviews(Array.isArray(reviewRes) ? reviewRes : []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${apiBase}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Đăng nhập thất bại");
      }
      const data = await res.json();
      setToken(data.token);
      setUsername(data.username);
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", data.username);
      setMessage("Đăng nhập thành công");
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    setToken("");
    setUsername("");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  };

  const createCategory = async () => {
    setError("");
    setMessage("");
    try {
      await authedFetch(`${apiBase}/categories`, {
        method: "POST",
        body: JSON.stringify({ name: catName }),
      });
      setCatName("");
      setMessage("Đã thêm danh mục");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateCategory = async (id) => {
    setError("");
    setMessage("");
    const name = prompt("Tên danh mục mới:");
    if (!name) return;
    try {
      await authedFetch(`${apiBase}/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      setMessage("Đã cập nhật danh mục");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Xóa danh mục này?")) return;
    setError("");
    setMessage("");
    try {
      await authedFetch(`${apiBase}/categories/${id}`, { method: "DELETE" });
      setMessage("Đã xóa danh mục");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const saveDish = async () => {
    setError("");
    setMessage("");
    const payload = {
      name: dishForm.name,
      price: Number(dishForm.price),
      description: dishForm.description,
      image: dishForm.image,
      id_category: dishForm.id_category,
    };
    try {
      if (dishForm.id) {
        await authedFetch(`${apiBase}/dishes/${dishForm.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("Đã cập nhật món");
      } else {
        await authedFetch(`${apiBase}/dishes`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Đã thêm món");
      }
      setDishForm({
        id: "",
        name: "",
        price: "",
        description: "",
        image: "",
        id_category: "",
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const editDish = (dishId) => {
    const d = dishes.find((x) => x._id === dishId);
    if (!d) return;
    setDishForm({
      id: d._id,
      name: d.name,
      price: d.price,
      description: d.description,
      image: d.image || "",
      id_category: d.id_category?._id || d.id_category || "",
    });
  };

  const deleteDish = async (id) => {
    if (!window.confirm("Xóa món này?")) return;
    setError("");
    setMessage("");
    try {
      await authedFetch(`${apiBase}/dishes/${id}`, { method: "DELETE" });
      setMessage("Đã xóa món");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // 🔍 Lọc danh sách đánh giá theo: món, sao, cảm xúc AI
  let filteredReviews = reviews;

  // Lọc theo món
  if (reviewFilter) {
    filteredReviews = filteredReviews.filter(
      (r) => r.dish?._id === reviewFilter || r.dish === reviewFilter
    );
  }

  // Lọc theo số sao
  if (starFilter !== "all") {
    filteredReviews = filteredReviews.filter(
      (r) => Number(r.score) === Number(starFilter)
    );
  }

  // Lọc theo cảm xúc AI
  if (sentimentFilter !== "all") {
    filteredReviews = filteredReviews.filter(
      (r) => (r.ai_sentiment || "").trim() === sentimentFilter
    );
  }

  const getCategoryName = (dish) => {
    if (dish.id_category?.name) return dish.id_category.name;
    const found = categories.find((c) => c._id === dish.id_category);
    return found?.name || "N/A";
  };

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-brand">
          <h3>Admin</h3>
          <p>Quản lý quán</p>
        </div>
        {token ? (
          <>
            <div className="admin-user">
              <span>{username}</span>
              <button onClick={logout}>Đăng xuất</button>
            </div>
            <nav className="admin-nav">
              <button
                className={activeTab === "categories" ? "is-active" : ""}
                onClick={() => setActiveTab("categories")}
              >
                Danh mục
              </button>
              <button
                className={activeTab === "dishes" ? "is-active" : ""}
                onClick={() => setActiveTab("dishes")}
              >
                Món ăn
              </button>
              <button
                className={activeTab === "reviews" ? "is-active" : ""}
                onClick={() => setActiveTab("reviews")}
              >
                Đánh giá
              </button>
            </nav>
            <button className="admin-back" onClick={onClose}>
              ← Quay lại menu khách
            </button>
          </>
        ) : (
          <form className="admin-login" onSubmit={handleLogin}>
            <h4>Đăng nhập</h4>
            <input
              placeholder="Tài khoản"
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm((p) => ({ ...p, username: e.target.value }))
              }
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((p) => ({ ...p, password: e.target.value }))
              }
              required
            />
            <button type="submit">Login</button>
          </form>
        )}
      </div>

      <div className="admin-content">
        {error && <div className="menu-alert">{error}</div>}
        {message && <div className="menu-alert success">{message}</div>}

        {!token ? (
          <div className="admin-hero">
            <h2>Đăng nhập để quản lý</h2>
            <p>Tài khoản mặc định: admin / 123456</p>
          </div>
        ) : (
          <>
            {activeTab === "categories" && (
              <section className="admin-section">
                <header>
                  <div>
                    <p className="menu-kicker">Danh mục</p>
                    <h3>Quản lý danh mục</h3>
                  </div>
                  <div className="admin-inline">
                    <input
                      placeholder="Tên danh mục mới"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                    />
                    <button onClick={createCategory}>Thêm mới</button>
                  </div>
                </header>
                <div className="admin-table">
                  <div className="admin-table__head">
                    <span>Tên</span>
                    <span>Hành động</span>
                  </div>
                  {categories.map((c) => (
                    <div key={c._id} className="admin-table__row">
                      <span>{c.name}</span>
                      <div className="admin-actions">
                        <button onClick={() => updateCategory(c._id)}>Sửa</button>
                        <button onClick={() => deleteCategory(c._id)}>Xóa</button>
                      </div>
                    </div>
                  ))}
                  {!categories.length && (
                    <div className="admin-empty">Chưa có danh mục</div>
                  )}
                </div>
              </section>
            )}

            {activeTab === "dishes" && (
              <section className="admin-section">
                <header>
                  <div>
                    <p className="menu-kicker">Món ăn</p>
                    <h3>Thêm / Sửa món</h3>
                  </div>
                </header>
                <div className="admin-flex">
                  <div className="admin-form">
                    <select
                      value={dishForm.id}
                      onChange={(e) => editDish(e.target.value)}
                    >
                      <option value="">-- Chọn món để sửa --</option>
                      {dishes.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <input
                      placeholder="Tên món"
                      value={dishForm.name}
                      onChange={(e) =>
                        setDishForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                    <input
                      type="number"
                      placeholder="Giá"
                      value={dishForm.price}
                      onChange={(e) =>
                        setDishForm((p) => ({ ...p, price: e.target.value }))
                      }
                    />
                    <input
                      placeholder="Ảnh (URL)"
                      value={dishForm.image}
                      onChange={(e) =>
                        setDishForm((p) => ({ ...p, image: e.target.value }))
                      }
                    />
                    <textarea
                      placeholder="Mô tả"
                      value={dishForm.description}
                      onChange={(e) =>
                        setDishForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                    <select
                      value={dishForm.id_category}
                      onChange={(e) =>
                        setDishForm((p) => ({
                          ...p,
                          id_category: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="admin-inline">
                      <button onClick={saveDish}>
                        {dishForm.id ? "Cập nhật" : "Thêm mới"}
                      </button>
                      {dishForm.id && (
                        <button onClick={() => deleteDish(dishForm.id)}>
                          Xóa món
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="admin-table admin-table--scroll">
                    <div className="admin-table__head">
                      <span>Tên món</span>
                      <span>Danh mục</span>
                      <span>Giá</span>
                      <span>Hành động</span>
                    </div>
                    {dishes.map((d) => (
                      <div key={d._id} className="admin-table__row">
                        <span>{d.name}</span>
                        <span>{getCategoryName(d)}</span>
                        <span>{d.price?.toLocaleString("vi-VN")}</span>
                        <div className="admin-actions">
                          <button onClick={() => editDish(d._id)}>Sửa</button>
                          <button onClick={() => deleteDish(d._id)}>Xóa</button>
                        </div>
                      </div>
                    ))}
                    {!dishes.length && (
                      <div className="admin-empty">Chưa có món ăn</div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {activeTab === "reviews" && (
              <section className="admin-section">
                <header>
                  <div>
                    <p className="menu-kicker">Đánh giá</p>
                    <h3>Danh sách đánh giá</h3>
                  </div>

                  <div className="admin-inline" style={{ gap: "8px" }}>
                    {/* Lọc theo món */}
                    <select
                      value={reviewFilter}
                      onChange={(e) => setReviewFilter(e.target.value)}
                    >
                      <option value="">Tất cả món</option>
                      {dishes.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>

                    {/* Lọc theo số sao */}
                    <select
                      value={starFilter}
                      onChange={(e) => setStarFilter(e.target.value)}
                    >
                      <option value="all">Tất cả sao</option>
                      <option value="5">5 sao</option>
                      <option value="4">4 sao</option>
                      <option value="3">3 sao</option>
                      <option value="2">2 sao</option>
                      <option value="1">1 sao</option>
                    </select>

                    {/* Lọc theo cảm xúc AI */}
                    <select
                      value={sentimentFilter}
                      onChange={(e) => setSentimentFilter(e.target.value)}
                    >
                      <option value="all">Tất cả cảm xúc</option>
                      <option value="Tích (tích cực mạnh)">
                        Tích cực mạnh
                      </option>
                      <option value="Không tiêu (không xấu)">
                        Không tiêu
                      </option>
                      <option value="Không tích (không tốt)">
                        Không tích
                      </option>
                      <option value="Tiêu (tiêu cực mạnh)">
                        Tiêu cực mạnh
                      </option>
                      <option value="AI lỗi">AI lỗi</option>
                    </select>
                  </div>
                </header>

                <div className="admin-review-list">
                  {filteredReviews.map((r) => (
                    <div key={r._id} className="admin-review-item">
                      <div className="admin-review-head">
                        <div>
                          <strong>{r.name}</strong> ({r.phone}){" "}
                          <span> - ⭐ {r.score}</span>
                          <div>
                            🤖{" "}
                            <em>{r.ai_sentiment || "Chưa có kết quả AI"}</em>
                          </div>
                        </div>
                        <span className="admin-pill">
                          {r.dish?.name || "Món"}
                        </span>
                      </div>
                      <p>{r.comment}</p>
                      <small>
                        {new Date(r.createdAt).toLocaleString("vi-VN")}
                      </small>
                    </div>
                  ))}
                  {!filteredReviews.length && (
                    <div className="admin-empty">Chưa có đánh giá</div>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
