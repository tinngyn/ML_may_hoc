import React from 'react';

// import './Header.css'; // Giả sử bạn có tệp CSS riêng

function Header({ onAdminClick, isAdmin }) {
  return (
    <header className="app-header d-flex justify-content-between align-items-center">
      <div className="logo">
        HỆ THỐNG NHÀ HÀNG  <span>AI</span>
      </div>
      <button className="btn-login-trigger" onClick={onAdminClick}>
        {isAdmin ? "Quay lại menu" : "Admin"}
      </button>
    </header>
  );
}

export default Header;   
