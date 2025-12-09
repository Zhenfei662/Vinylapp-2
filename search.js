/* ===============================
   1. 获取 URL query
================================*/
const params = new URLSearchParams(window.location.search);
const query = params.get("query") || "";

/* ===============================
   2. 顶部搜索按钮
================================*/
document.getElementById("nav-search-btn").addEventListener("click", () => {
    const q = document.getElementById("nav-search").value.trim();
    if (q) window.location.href = `search.html?query=${q}`;
});

/* ===============================
   3. 调用后端 Discogs API
================================*/
async function searchDiscogs(q) {
    if (!q) return [];

    try {
        const res = await fetch(`http://localhost:5000/api/search?q=${q}`);
        const data = await res.json();

        return data.results ? data.results.slice(0, 20) : [];

    } catch (err) {
        console.error("Discogs Search Error:", err);
        return [];
    }
}

/* ======================================================
   ADD TO COLLECTION → 存入 MongoDB
====================================================== */
async function addToCollection(item) {
    const payload = {
        title: item.title || "Unknown Title",
        artist: item.artist || item.title?.split(" - ")[0] || "Unknown Artist",
        year: item.year || "",
        genre: item.style ? item.style[0] : "Unknown",
        coverImage: item.cover_image || ""
    };

    try {
        const res = await fetch("http://localhost:5000/vinyls", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Add failed.");

        alert(`✔ Added to My Collection: ${payload.title}`);

    } catch (err) {
        console.error("Add error:", err);
        alert("Failed to add item.");
    }
}

/* ===============================
   4. MORE → 打开 modal（已修复关闭问题）
================================*/
function openModal(item) {
    document.getElementById("modal-cover").src = item.cover_image || "picture/default.jpg";
    document.getElementById("modal-title").innerText = item.title || "Unknown Title";
    document.getElementById("modal-artist").innerText = "Artist: " + (item.artist || "Unknown");
    document.getElementById("modal-year").innerText = "Year: " + (item.year || "----");
    document.getElementById("modal-genre").innerText = "Genre: " + (item.style ? item.style[0] : "Unknown");
    document.getElementById("modal-format").innerText = "Format: " + (item.format ? item.format[0] : "Unknown");

    const modal = document.getElementById("detail-modal");
    modal.style.display = "flex";

    // 点击 × 关闭
    document.querySelector(".modal-close").onclick = () => {
        modal.style.display = "none";
    };

    // 点击背景关闭
    modal.onclick = (e) => {
        if (e.target.id === "detail-modal") {
            modal.style.display = "none";
        }
    };
}


/* ===============================
   5. 渲染结果（使用你的卡片样式）
================================*/
function renderResults(list) {
    const container = document.getElementById("results-grid");
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = `<p style="color:white;">No results found.</p>`;
        return;
    }

    list.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("carousel-item", "vinyl-card"); // 和 home page 一样

        const cover = item.cover_image || "picture/default.jpg";
        const artist = item.artist || item.title?.split(" - ")[0] || "Unknown Artist";

        card.innerHTML = `
            <img src="${cover}" class="vinyl-cover" />

            <div class="vinyl-body">
                <div class="vinyl-title">${item.title}</div>
                <div class="vinyl-artist">${artist}</div>
                <div class="vinyl-meta">${item.year || "----"}</div>
            </div>

            <div class="vinyl-footer">
                <button class="card-btn card-btn-primary">ADD</button>
                <button class="card-btn more-btn">MORE</button>
            </div>
        `;

        // ADD
        card.querySelector(".card-btn-primary").addEventListener("click", () => addToCollection(item));

        // MORE → 打开弹窗
        card.querySelector(".more-btn").addEventListener("click", () => openModal(item));

        container.appendChild(card);
    });
}

/* ===============================
   6. 初始化：自动搜索
================================*/
(async function () {
    document.getElementById("nav-search").value = query;

    const results = await searchDiscogs(query);
    renderResults(results);
})();
