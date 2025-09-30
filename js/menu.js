async function loadSidebar() {
  const res = await fetch("../data/menu.json");
  const menuData = await res.json();

  const sidebar = document.getElementById("sidebar");
  let html = `<div class="sidebar">`;

  // 頂部：漢堡、Logo、主題切換
  html += `
    <div class="menu-header">
      <button id="toggle-btn">☰</button>
      <span class="menu-logo">選單</span>
      <button id="theme-toggle">🌙</button>
    </div>
    <div class="menu-search">
      <input type="text" id="search-box" placeholder="搜尋功能...">
    </div>
  `;

  menuData.forEach((section, index) => {
    html += `
      <div class="menu-section">
        <div class="menu-title" data-index="${index}">${section.title}</div>
        <ul class="submenu">
    `;
    section.children.forEach(item => {
      html += `<li><a href="${item.url}">${item.name}</a></li>`;
    });
    html += `</ul></div>`;
  });

  html += `</div>`;
  sidebar.innerHTML = html;

// 選單 logo 點擊回首頁
const menuLogo = sidebar.querySelector(".menu-logo");
menuLogo.addEventListener("click", () => {
  window.location.href = "/index.html";
});

  // ====== 功能 ======

  // 1. 高亮當前頁面
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".submenu li a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
      link.closest(".submenu").classList.add("open");
    }
  });

  // 2. 手風琴 + 展開記憶
  const titles = document.querySelectorAll(".menu-title");
  const savedIndex = localStorage.getItem("menu-open");
  if (savedIndex) {
    titles[savedIndex].nextElementSibling.classList.add("open");
  }
  titles.forEach((title, idx) => {
    title.addEventListener("click", () => {
      document.querySelectorAll(".submenu").forEach(ul => ul.classList.remove("open"));
      const submenu = title.nextElementSibling;
      if (!submenu.classList.contains("open")) {
        submenu.classList.add("open");
        localStorage.setItem("menu-open", idx);
      } else {
        localStorage.removeItem("menu-open");
      }
    });
  });

  // 3. 側邊欄收合功能
  const toggleBtn = document.getElementById("toggle-btn");
  // 判斷是否為首頁
  const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
  // 首頁展開，子功能頁收合
  if (!isHome) {
    document.body.classList.add("sidebar-collapsed"); // 非首頁預設收合
  } else {
    document.body.classList.remove("sidebar-collapsed"); // 首頁展開
  }
  // 點擊按鈕切換收合
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-collapsed");
  });

  // 4. 搜尋功能
  const searchBox = document.getElementById("search-box");
  searchBox.addEventListener("input", e => {
    const keyword = e.target.value.toLowerCase();
    document.querySelectorAll(".submenu li").forEach(li => {
      const text = li.textContent.toLowerCase();
      li.style.display = text.includes(keyword) ? "block" : "none";
    });
  });

  // 5. 深淺色主題切換
  const themeToggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.setAttribute("data-theme", savedTheme);
  themeToggle.textContent = savedTheme === "light" ? "🌙" : "☀️";
  themeToggle.addEventListener("click", () => {
    const current = document.body.getAttribute("data-theme");
    const newTheme = current === "light" ? "dark" : "light";
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    themeToggle.textContent = newTheme === "light" ? "🌙" : "☀️";
  });

  // 6. 浮動收合鍵
  const floatBtn = document.createElement("button");
  floatBtn.id = "float-toggle";
  floatBtn.textContent = "⇔";
  document.body.appendChild(floatBtn);
  floatBtn.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-collapsed");
  });
}

document.addEventListener("DOMContentLoaded", loadSidebar);

