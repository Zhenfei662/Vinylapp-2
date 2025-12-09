/* ====================
   SEARCH JUMP
==================== */


/* ====================
   FETCH DISCOSGS DATA
==================== */

async function loadDiscogsData(query = "vinyl") {
    const url = `http://localhost:5000/api/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const json = await res.json();

    console.log("Discogs API:", json);

    if (!json.results) return [];

    // 拿前 10 条
    return json.results.slice(0, 15).map(item => {
        const [artistName, albumName] =
            item.title?.includes(" - ") ? item.title.split(" - ") : ["Unknown Artist", item.title];

        return {
            cover: item.cover_image || "picture/default.jpg",
            title: albumName || "Unknown Title",
            artist: artistName || "Unknown Artist",
            year: item.year || "----",
            format: item.format ? item.format[0] : ""
        };
    });
}


/* ====================
   BUILD CARD DOM
==================== */

function createCard(item) {
    return `
        <div class="carousel-item vinyl-card">
            <img src="${item.cover}" class="vinyl-cover">

            <div class="vinyl-body">
                <div class="vinyl-title">${item.title}</div>
                <div class="vinyl-artist">${item.artist}</div>
                <div class="vinyl-meta">${item.year} · ${item.format}</div>
            </div>

            <div class="vinyl-footer">
                <button class="card-btn card-btn-primary">ADD</button>
                <button class="card-btn">MORE</button>
            </div>
        </div>
    `;
}


/* ================================
   POPULATE 3 ROWS WITH DIFFERENT QUERIES
================================ */

async function populateCarousels() {

    const queries = {
        "carousel-track-1": "best selling vinyl",
        "carousel-track-2": "expensive vinyl",
        "carousel-track-3": "popular vinyl"
    };

    for (const trackId in queries) {
        const track = document.getElementById(trackId);
        const items = await loadDiscogsData(queries[trackId]);

        track.innerHTML = ""; // 清空原来的假数据
        items.forEach(i => track.innerHTML += createCard(i));
    }

    // 启动无限滚动
    initInfiniteCarousel("carousel-track-1", "carousel-dots-1", -1);
    initInfiniteCarousel("carousel-track-2", "carousel-dots-2", -1);
    initInfiniteCarousel("carousel-track-3", "carousel-dots-3", -1);
}

populateCarousels();


/* ================================
   INFINITE SCROLL CAROUSEL
================================ */

function initInfiniteCarousel(trackId, dotsId, direction = -1) {
    const track = document.getElementById(trackId);
    const dots = document.getElementById(dotsId);

    const items = Array.from(track.children);
    items.forEach(i => track.appendChild(i.cloneNode(true)));

    const total = items.length;
    const cardWidth = 260;
    let pos = 0;
    let paused = false;

    function animate() {
        if (!paused) {
            pos += 0.4 * direction;

            if (direction === -1 && pos <= -total * cardWidth) pos = 0;
            if (direction === 1 && pos >= total * cardWidth) pos = 0;

            track.style.transform = `translateX(${pos}px)`;
        }
        requestAnimationFrame(animate);
    }

    animate();

    // pause on hover
    track.addEventListener("mouseenter", () => paused = true);
    track.addEventListener("mouseleave", () => paused = false);

    // create dots
    dots.innerHTML = "";
    for (let i = 0; i < total / 4.5; i++) {
        dots.innerHTML += `<div></div>`;
    }
    dots.children[0].classList.add("active");
}

document.getElementById("hero-search-btn").addEventListener("click", () => {
    const q = document.getElementById("hero-search").value.trim();
    if (q) window.location.href = `search.html?query=${q}`;
});
