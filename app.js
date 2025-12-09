// app.js — Connected to MongoDB via Render API

const API_URL = "https://vinylapp.onrender.com/vinyls";

document.addEventListener("DOMContentLoaded", () => {
  setupCollectionPage();
});

let vinyls = [];

function setupCollectionPage() {
  const grid = document.getElementById("vinylGrid");
  const messageEl = document.getElementById("message");

  const modalOverlay = document.getElementById("vinylModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const vinylForm = document.getElementById("vinylForm");
  const vinylIdInput = document.getElementById("vinylId");

  const modalTitle = document.getElementById("modalTitle");
  const modalSubtitle = document.getElementById("modalSubtitle");

  // Delete Modal
  const deleteModal = document.getElementById("deleteModal");
  const closeDeleteModalBtn = document.getElementById("closeDeleteModal");
  const cancelDeleteBtn = document.getElementById("cancelDelete");
  const confirmDeleteBtn = document.getElementById("confirmDelete");

  let deleteTargetId = null;

  /* ------------------------------------------
     FETCH DATA FROM API (MongoDB)
  -------------------------------------------*/
  async function loadVinyls() {
    try {
      const res = await fetch(API_URL);
      vinyls = await res.json();
      renderVinyls();
    } catch (err) {
      console.error("Error loading vinyls:", err);
    }
  }

  /* ------------------------------------------
     OPEN / CLOSE MODAL
  -------------------------------------------*/
  function openModal(mode = "add", vinyl = null) {
    if (mode === "add") {
      modalTitle.textContent = "Add Vinyl";
      modalSubtitle.textContent = "Add a new record to your collection";
      vinylIdInput.value = "";
      vinylForm.reset();
    } else if (mode === "edit") {
      modalTitle.textContent = "Edit Vinyl";
      modalSubtitle.textContent = "Update the details of this record";

      vinylIdInput.value = vinyl._id;
      document.getElementById("title").value = vinyl.title;
      document.getElementById("artist").value = vinyl.artist;
      document.getElementById("year").value = vinyl.year || "";
      document.getElementById("genre").value = vinyl.genre || "";
      document.getElementById("coverImageUrl").value = vinyl.coverImage || "";
    }
    modalOverlay.classList.remove("hidden");
  }

  function closeModal() {
    modalOverlay.classList.add("hidden");
  }

  modalCloseBtn.addEventListener("click", closeModal);

  /* ------------------------------------------
     DELETE MODAL
  -------------------------------------------*/
  function openDeleteModal(id) {
    deleteTargetId = id;
    deleteModal.classList.remove("hidden");
  }

  function closeDeleteModal() {
    deleteTargetId = null;
    deleteModal.classList.add("hidden");
  }

  closeDeleteModalBtn.addEventListener("click", closeDeleteModal);
  cancelDeleteBtn.addEventListener("click", closeDeleteModal);

  confirmDeleteBtn.addEventListener("click", async () => {
    if (!deleteTargetId) return;

    await fetch(`${API_URL}/${deleteTargetId}`, {
      method: "DELETE",
    });

    await loadVinyls();
    closeDeleteModal();
    showMessage("Vinyl deleted.");
  });

  /* ------------------------------------------
     RENDER CARDS + ADD VINYL PLACEHOLDER
  -------------------------------------------*/
  function renderVinyls() {
    grid.innerHTML = "";

    // ---------------------------
    // 1️⃣ Add Vinyl 虚拟卡片（新增）
    // ---------------------------
    const addCard = document.createElement("article");
    addCard.className = "vinyl-card add-card";

    addCard.innerHTML = `
      <div class="add-card-content">
        <div class="add-card-icon">＋</div>
        <div class="add-card-text">Add Vinyl</div>
      </div>
    `;

    addCard.addEventListener("click", () => openModal("add"));
    grid.appendChild(addCard);

    // ---------------------------
    // 2️⃣ 你的原本收藏卡片
    // ---------------------------
    vinyls.forEach((v) => {
      const card = document.createElement("article");
      card.className = "vinyl-card";

      const img = document.createElement("img");
      img.className = "vinyl-cover";
      img.src = v.coverImage || "https://via.placeholder.com/400";
      img.alt = v.title;

      const body = document.createElement("div");
      body.className = "vinyl-body";

      const titleEl = document.createElement("div");
      titleEl.className = "vinyl-title";
      titleEl.textContent = v.title;

      const artistEl = document.createElement("div");
      artistEl.className = "vinyl-artist";
      artistEl.textContent = v.artist;

      const metaEl = document.createElement("div");
      metaEl.className = "vinyl-meta";
      metaEl.textContent = [v.year, v.genre].filter(Boolean).join(" • ");

      body.appendChild(titleEl);
      body.appendChild(artistEl);
      body.appendChild(metaEl);

      const footer = document.createElement("div");
      footer.className = "vinyl-footer";

      const editBtn = document.createElement("button");
      editBtn.className = "card-btn card-btn-primary";
      editBtn.textContent = "Edit";
      editBtn.onclick = () => openModal("edit", v);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "card-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => openDeleteModal(v._id);

      footer.appendChild(editBtn);
      footer.appendChild(deleteBtn);

      card.appendChild(img);
      card.appendChild(body);
      card.appendChild(footer);

      grid.appendChild(card);
    });
  }

  /* ------------------------------------------
     HANDLE FORM SUBMIT (ADD / EDIT)
  -------------------------------------------*/
  vinylForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = vinylIdInput.value;

    const payload = {
      title: document.getElementById("title").value,
      artist: document.getElementById("artist").value,
      year: document.getElementById("year").value,
      genre: document.getElementById("genre").value,
      coverImage: document.getElementById("coverImageUrl").value,
    };

    if (id) {
      // UPDATE
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      showMessage("Vinyl updated.");
    } else {
      // CREATE
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      showMessage("Vinyl added.");
    }

    closeModal();
    await loadVinyls();
  });

  /* ------------------------------------------
     LOAD DATA FIRST TIME
  -------------------------------------------*/
  loadVinyls();

  function showMessage(text) {
    messageEl.textContent = text;
    messageEl.classList.add("success");
    setTimeout(() => {
      messageEl.textContent = "";
    }, 2000);
  }
}
