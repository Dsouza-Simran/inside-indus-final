/**
 * ============================================================================
 * INSIDE INDUS - Master JavaScript Controller (script.js)
 * Tagline: "Built by students for students"
 * Institution: Indus University
 * 
 * Clean, modular, beginner-friendly Vanilla JavaScript.
 * Strictly adheres to all project rules:
 * - No fake information.
 * - Unknown info displays: "Information coming soon".
 * - B201 is NEVER classified as LH, LAB, or Classroom.
 * - EV Charging Station and Sports facilities are not searchable.
 * - All actions persist in localStorage.
 * - Stairs only (no lifts) in indoor navigation.
 * ============================================================================
 */

(function () {
  "use strict";

  // Global State Object
  const State = {
    campusData: null,
    favorites: [],
    recentSearches: [],
    activeView: "home",
    mapZoom: 1,
    selectedBuilding: null,
    currentTheme: "light"
  };

  /* ==========================================================================
     1. INITIALIZATION & LOCALSTORAGE MANAGEMENT
     ========================================================================== */
  function initApp() {
    // 0. Initialize Light / Dark Mode Theme
    initTheme();

    // 0b. Initialize Student Karma Points display (starts at 0)
    updateKarmaDisplay();
    setupKarmaAccessibility();

    // 1. Load or initialize Campus Data
    State.campusData = window.getCampusData();

    // 2. Load Favorites
    try {
      const favRaw = localStorage.getItem(window.STORAGE_KEYS.FAVORITES);
      if (favRaw) {
        State.favorites = JSON.parse(favRaw);
      }
    } catch (e) {
      console.warn("Could not load favorites", e);
    }

    // 3. Load Recent Searches
    try {
      const recRaw = localStorage.getItem(window.STORAGE_KEYS.RECENT_SEARCHES);
      if (recRaw) {
        State.recentSearches = JSON.parse(recRaw);
      }
    } catch (e) {
      console.warn("Could not load recent searches", e);
    }

    // Setup Event Listeners
    setupNavigation();
    setupSearch();
    setupMapControls();

    // Set today's date as default in the free room date input
    try {
      const dateInput = document.getElementById("submit-room-date");
      if (dateInput) {
        dateInput.value = new Date().toISOString().split("T")[0];
      }
    } catch (e) {}

    // Handle initial hash route or default to home
    const hash = window.location.hash.replace("#", "") || "home";
    navigateTo(hash);

    // Initial renders
    renderRecentSearches();
    renderClassrooms();
    renderLabs();
    renderFaculty();
    renderFacilities();
    renderFreeRooms();
  }

  /* ==========================================================================
     THEME MANAGEMENT (LIGHT / DARK MODE)
     ========================================================================== */
  function initTheme() {
    let savedTheme = "light";
    try {
      savedTheme = localStorage.getItem(window.STORAGE_KEYS?.THEME || "inside_indus_theme") || "light";
    } catch (e) {
      console.warn("Could not read theme from localStorage", e);
    }
    applyTheme(savedTheme, false);

    const toggleBtn = document.getElementById("theme-toggle-btn");
    if (toggleBtn) {
      toggleBtn.onclick = function (e) {
        e.preventDefault();
        toggleTheme();
      };
    }
  }

  function applyTheme(theme, save = true) {
    if (theme !== "dark" && theme !== "light") {
      theme = "light";
    }
    State.currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    if (document.body) {
      document.body.setAttribute("data-theme", theme);
    }

    if (save) {
      try {
        localStorage.setItem(window.STORAGE_KEYS?.THEME || "inside_indus_theme", theme);
      } catch (e) {
        console.warn("Could not save theme to localStorage", e);
      }
    }

    updateThemeToggleButton(theme);
  }

  function toggleTheme() {
    const nextTheme = State.currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
  }

  function updateThemeToggleButton(theme) {
    const btn = document.getElementById("theme-toggle-btn");
    const icon = document.getElementById("theme-toggle-icon");
    const text = document.getElementById("theme-toggle-text");

    if (!btn) return;

    if (theme === "dark") {
      if (icon) icon.textContent = "☀️";
      if (text) text.textContent = "Light";
      btn.setAttribute("aria-label", "Switch to light mode");
      btn.setAttribute("title", "Switch to light mode");
    } else {
      if (icon) icon.textContent = "🌙";
      if (text) text.textContent = "Dark";
      btn.setAttribute("aria-label", "Switch to dark mode");
      btn.setAttribute("title", "Switch to dark mode");
    }
  }

  /* ==========================================================================
     STUDENT KARMA POINTS SYSTEM
     - Starts at 0 Karma Points.
     - Persists in localStorage via inside_indus_karma key.
     - Immediate UI update across navbar and profile cards.
     ========================================================================== */
  function getStudentKarma() {
    if (typeof window.getKarmaPoints === "function") {
      return window.getKarmaPoints();
    }
    try {
      const storageKey = window.STORAGE_KEYS?.KARMA || "inside_indus_karma";
      const raw = localStorage.getItem(storageKey);
      if (raw === null || raw === undefined || raw === "") return 0;
      const parsed = parseInt(raw, 10);
      return isNaN(parsed) ? 0 : parsed;
    } catch (e) {
      return 0;
    }
  }

  function updateKarmaDisplay(points) {
    const total = typeof points === "number" ? points : getStudentKarma();
    const formatted = `⭐ ${total} Karma`;

    // 1. Update Navbar Karma Badge
    const navDisplay = document.getElementById("karma-points-display");
    if (navDisplay) {
      navDisplay.textContent = formatted;
    }

    const navBadge = document.getElementById("karma-badge");
    if (navBadge) {
      navBadge.setAttribute("title", `Student Karma Points: ${total} earned`);
      navBadge.setAttribute("aria-label", `Student Karma Points: ${total} points`);
    }

    // 2. Update Student Profile Area Karma Badge
    const profileDisplay = document.getElementById("profile-karma-points-display");
    if (profileDisplay) {
      profileDisplay.textContent = formatted;
    }
  }

  function setupKarmaAccessibility() {
    const navBadge = document.getElementById("karma-badge");
    if (navBadge) {
      navBadge.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigateTo("profile");
        }
      });
    }
  }

  /* ==========================================================================
     2. NAVIGATION & VIEW SWITCHING (SPA ROUTING)
     ========================================================================== */
  function navigateTo(viewId) {
    if (viewId === "admin") {
      window.location.href = "admin.html";
      return;
    }

    const validViews = [
      "home", "free-rooms", "map", "search",
      "classrooms", "labs", "faculty", "facilities",
      "profile"
    ];

    if (!validViews.includes(viewId)) {
      viewId = "home";
    }

    State.activeView = viewId;
    window.location.hash = viewId;

    // Toggle view sections
    document.querySelectorAll(".view-section").forEach(sec => {
      sec.classList.remove("active");
    });
    const targetSection = document.getElementById(`view-${viewId}`);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    // Update Desktop Nav Links
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("data-view") === viewId) {
        link.classList.add("active");
      }
    });

    // Update Mobile Bottom Nav Links
    document.querySelectorAll(".bottom-nav-btn").forEach(btn => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-view") === viewId) {
        btn.classList.add("active");
      }
    });

    // Specific view activations
    if (viewId === "profile") {
      renderProfileView();
    } else if (viewId === "admin") {
      renderAdminDashboard();
    } else if (viewId === "free-rooms") {
      renderFreeRooms();
    }

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setupNavigation() {
    // Top nav clicks
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        const view = link.getAttribute("data-view");
        if (view) navigateTo(view);
      });
    });

    // Mobile bottom bar clicks
    document.querySelectorAll(".bottom-nav-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        const view = btn.getAttribute("data-view");
        if (view) navigateTo(view);
      });
    });

    // Hash change event (back/forward browser buttons)
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "") || "home";
      if (hash !== State.activeView) {
        navigateTo(hash);
      }
    });
  }

  /* ==========================================================================
     3. SEARCH SYSTEM (Vanilla Keyword Matching - NO AI)
     ========================================================================== */
  function getAllSearchableItems() {
    const data = State.campusData;
    const items = [];

    // Classrooms
    data.classrooms.forEach(c => {
      items.push({
        id: c.id,
        name: c.name,
        category: "Classroom / Lecture Hall",
        type: c.type,
        building: c.building,
        floor: c.floor,
        ac: c.airConditioned ? "AC" : "Non-AC",
        direction: c.direction || "Upcoming",
        notes: c.notes,
        rawObj: c
      });
    });

    // Special Unverified Rooms (B201)
    data.specialRooms.forEach(s => {
      items.push({
        id: s.id,
        name: s.name,
        category: "Academic Room",
        type: s.type, // "Information coming soon"
        building: s.building,
        floor: s.floor,
        ac: s.airConditioned === false ? "Non-AC" : "Information coming soon",
        notes: s.notes,
        associatedWith: s.associatedWith,
        rawObj: s
      });
    });

    // Labs
    data.labs.forEach(l => {
      items.push({
        id: l.id,
        name: l.name,
        category: "Laboratory",
        type: l.type,
        building: l.building,
        floor: l.floor,
        ac: l.airConditioned ? "AC" : "Non-AC",
        direction: l.direction || "Upcoming",
        notes: l.notes,
        rawObj: l
      });
    });

    // Faculty
    data.faculty.forEach(f => {
      items.push({
        id: f.id,
        name: f.name,
        category: "Faculty",
        type: "Faculty Member",
        building: f.building,
        floor: f.floor,
        room: f.room,
        office: f.office,
        notes: f.notes,
        rawObj: f
      });
    });

    // Facilities
    data.facilities.forEach(fac => {
      items.push({
        id: fac.id,
        name: fac.name,
        category: fac.category || "Campus Facility",
        type: fac.type,
        building: fac.building,
        floor: fac.floor,
        direction: fac.direction || "Upcoming",
        description: fac.description,
        rawObj: fac
      });
    });

    // Food / Cafe & Landmark
    data.foodCafes.forEach(fc => {
      items.push({
        id: fc.id,
        name: fc.name,
        category: fc.type,
        type: fc.type,
        building: fc.location,
        floor: "Ground Level",
        direction: fc.direction || "Upcoming",
        description: fc.description,
        rawObj: fc
      });
    });

    // NOTICE: EV Charging Station and Sports facilities are deliberately NOT added here.
    return items;
  }

  function executeSearch(query) {
    const trimmed = (query || "").trim().toLowerCase();
    if (!trimmed) return [];

    const allItems = getAllSearchableItems();
    const scored = [];

    // Additional keyword mappings for common searches
    const keywordMap = {
      "library": ["FACILITY-LIB"],
      "canteen": ["FACILITY-CAN"],
      "auditorium": ["FACILITY-AUD"],
      "admin": ["FACILITY-ADM"],
      "administration": ["FACILITY-ADM"],
      "tree sitting": ["LM-TREE"],
      "tree": ["LM-TREE"],
      "main gate": ["LM-GATE"],
      "gate": ["LM-GATE"],
      "parking": ["LM-PARKING"],
      "main building": [],
      "bhanwan building": [],
      "mb": [],
      "bb": []
    };

    for (const item of allItems) {
      const nameLower = item.name.toLowerCase();
      const catLower = (item.category || "").toLowerCase();
      const bldgLower = (item.building || "").toLowerCase();
      const floorLower = (item.floor || "").toLowerCase();
      const typeLower = (item.type || "").toLowerCase();
      const assocLower = (item.associatedWith || "").toLowerCase();
      const roomLower = (item.room || "").toLowerCase();
      const descLower = (item.description || item.notes || "").toLowerCase();

      let score = 0;
      if (nameLower === trimmed) {
        score = 100; // Exact name match
      } else if (nameLower.startsWith(trimmed)) {
        score = 80;
      } else if (nameLower.includes(trimmed)) {
        score = 60;
      } else if (roomLower === trimmed) {
        score = 55;
      } else if (roomLower.includes(trimmed)) {
        score = 45;
      } else if (assocLower.includes(trimmed)) {
        score = 40; // e.g. B201 associated with Ms. Palak Shah
      } else if (typeLower.includes(trimmed) || catLower.includes(trimmed)) {
        score = 30;
      } else if (bldgLower.includes(trimmed) || floorLower.includes(trimmed)) {
        score = 20;
      } else if (descLower.includes(trimmed)) {
        score = 10;
      }

      if (score > 0) {
        scored.push({ item, score });
      }
    }

    // Sort by highest relevance score
    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.item);
  }

  function setupSearch() {
    const heroInput = document.getElementById("hero-search-input");
    const heroBtn = document.getElementById("hero-search-btn");
    const dropdown = document.getElementById("search-results-dropdown");

    const dedicatedInput = document.getElementById("dedicated-search-input");
    const dedicatedBtn = document.getElementById("dedicated-search-btn");

    // Live search on hero input
    if (heroInput && dropdown) {
      heroInput.addEventListener("input", () => {
        const query = heroInput.value.trim();
        if (query.length === 0) {
          dropdown.classList.remove("open");
          dropdown.innerHTML = "";
          return;
        }

        const matches = executeSearch(query);
        renderSearchDropdown(matches, dropdown);
      });

      // Submit search on Hero
      const triggerHeroSearch = () => {
        const query = heroInput.value.trim();
        if (!query) return;
        saveRecentSearch(query);
        dropdown.classList.remove("open");
        openDedicatedSearchView(query);
      };

      heroBtn.addEventListener("click", triggerHeroSearch);
      heroInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          triggerHeroSearch();
        }
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", e => {
        if (!heroInput.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.remove("open");
        }
      });
    }

    // Dedicated search view inputs
    if (dedicatedInput && dedicatedBtn) {
      const triggerDedicatedSearch = () => {
        const query = dedicatedInput.value.trim();
        if (query) {
          saveRecentSearch(query);
          renderDedicatedSearchResults(query);
        }
      };

      dedicatedBtn.addEventListener("click", triggerDedicatedSearch);
      dedicatedInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          triggerDedicatedSearch();
        }
      });
      dedicatedInput.addEventListener("input", () => {
        renderDedicatedSearchResults(dedicatedInput.value.trim());
      });
    }
  }

  function renderSearchDropdown(matches, dropdown) {
    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 1.25rem; text-align: center; color: var(--text-muted);">
          <p style="font-weight: 700; color: var(--navy-secondary); margin-bottom: 0.25rem;">No results found.</p>
          <p style="font-size: 0.85rem;">Try searching for a classroom, lab, faculty member or campus facility.</p>
        </div>
      `;
      dropdown.classList.add("open");
      return;
    }

    const html = matches.slice(0, 6).map(item => `
      <div class="search-result-item" onclick="window.CampusGo.viewDetails('${item.id}', '${escapeAttr(item.category)}')">
        <div class="result-item-main">
          <span class="result-item-title">${escapeHtml(item.name)}</span>
          <span class="result-item-meta">${escapeHtml(item.building || "Indus University")} • ${escapeHtml(item.floor || "")}</span>
        </div>
        <span class="result-type-badge">${escapeHtml(item.category)}</span>
      </div>
    `).join("");

    dropdown.innerHTML = html;
    dropdown.classList.add("open");
  }

  function openDedicatedSearchView(query) {
    navigateTo("search");
    const input = document.getElementById("dedicated-search-input");
    if (input) {
      input.value = query;
    }
    renderDedicatedSearchResults(query);
  }

  function renderDedicatedSearchResults(query) {
    const container = document.getElementById("search-page-results");
    const queryDisplay = document.getElementById("search-query-display");
    if (!container) return;

    if (!query) {
      if (queryDisplay) queryDisplay.textContent = "All Campus Locations";
      const all = getAllSearchableItems();
      renderSearchResultsGrid(all, container);
      return;
    }

    if (queryDisplay) queryDisplay.textContent = `Results for "${query}"`;
    const results = executeSearch(query);
    renderSearchResultsGrid(results, container);
  }

  function renderSearchResultsGrid(results, container) {
    if (results.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-lg);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="font-size: 1.35rem; color: var(--navy-secondary); margin-bottom: 0.5rem;">No results found.</h3>
          <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto 1.5rem;">
            Try searching for a classroom, lab, faculty member or campus facility.
          </p>
          <button class="btn btn-outline" onclick="window.CampusGo.openDedicatedSearchView('')">View All Locations</button>
        </div>
      `;
      return;
    }

    container.innerHTML = results.map(item => `
      <div class="item-card">
        <div class="item-card-header">
          <h4 class="item-card-title">${escapeHtml(item.name)}</h4>
          <span class="item-card-type">${escapeHtml(item.category)}</span>
        </div>

        <div class="item-meta-list">
          <div class="item-meta-row">
            <span class="meta-icon">🏢</span>
            <span>${escapeHtml(item.building || "Indus University")}</span>
          </div>
          <div class="item-meta-row">
            <span class="meta-icon">📍</span>
            <span>Floor: ${escapeHtml(item.floor || "Information coming soon")}</span>
          </div>
          ${item.ac ? `
            <div class="item-meta-row">
              <span class="meta-icon">❄️</span>
              <span>${item.ac === "AC" ? '<span class="badge badge-ac">AC</span>' : (item.ac === "Non-AC" ? '<span class="badge badge-non-ac">Non-AC</span>' : '<span class="badge badge-unknown">AC: Information coming soon</span>')}</span>
            </div>
          ` : ""}
          ${item.associatedWith ? `
            <div class="item-meta-row">
              <span class="meta-icon">👤</span>
              <span>Associated with: <strong>${escapeHtml(item.associatedWith)}</strong></span>
            </div>
          ` : ""}
          ${item.room && item.category === "Faculty" ? `
            <div class="item-meta-row">
              <span class="meta-icon">🚪</span>
              <span>Office Room: <strong>${escapeHtml(item.room)}</strong></span>
            </div>
          ` : ""}
        </div>

        <div class="card-actions">
          <button class="btn btn-primary btn-sm" onclick="window.CampusGo.viewDetails('${item.id}', '${escapeAttr(item.category)}')">
            VIEW DETAILS
          </button>
          <button class="btn btn-outline btn-sm" onclick="window.CampusGo.toggleFavorite('${item.id}', '${escapeAttr(item.name)}', '${escapeAttr(item.category)}')">
            ${isFavorite(item.id) ? "★ Saved" : "☆ Save"}
          </button>
        </div>
      </div>
    `).join("");
  }

  /* ==========================================================================
     4. RECENT SEARCHES (localStorage only, no fake searches)
     ========================================================================== */
  function saveRecentSearch(query) {
    if (!query) return;
    const term = query.trim();
    if (!term) return;

    // Filter out duplicate if already exists
    let list = State.recentSearches.filter(s => s.toLowerCase() !== term.toLowerCase());
    list.unshift(term);
    // Keep top 6
    if (list.length > 6) {
      list = list.slice(0, 6);
    }
    State.recentSearches = list;
    try {
      localStorage.setItem(window.STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(list));
    } catch (e) {
      console.warn("Could not save recent search", e);
    }
    renderRecentSearches();
  }

  function renderRecentSearches() {
    const container = document.getElementById("recent-searches-list");
    if (!container) return;

    if (State.recentSearches.length === 0) {
      container.innerHTML = `<span class="recent-empty-text">No recent searches yet. Try searching "LH-14", "Ms. Palak Shah", or "Library".</span>`;
      return;
    }

    container.innerHTML = State.recentSearches.map(term => `
      <button class="recent-chip" onclick="window.CampusGo.openDedicatedSearchView('${escapeAttr(term)}')">
        🔍 ${escapeHtml(term)}
      </button>
    `).join("");
  }

  function clearRecentSearches() {
    State.recentSearches = [];
    localStorage.removeItem(window.STORAGE_KEYS.RECENT_SEARCHES);
    renderRecentSearches();
    showToast("Recent searches cleared.");
  }

  /* ==========================================================================
     5. EXPLORE CAMPUS: 2D MAP CONTROLLER
     ========================================================================== */
  function setupMapControls() {
    const zoomInBtn = document.getElementById("map-zoom-in");
    const zoomOutBtn = document.getElementById("map-zoom-out");
    const resetBtn = document.getElementById("map-zoom-reset");
    const zoomText = document.getElementById("map-zoom-level");
    const svgMap = document.getElementById("campus-map-svg");

    const updateZoom = (level) => {
      State.mapZoom = Math.min(Math.max(level, 0.75), 2.0);
      if (svgMap) {
        svgMap.style.transform = `scale(${State.mapZoom})`;
      }
      const imgMap = document.querySelector("#map-viewport-container img, .map-viewport img");
      if (imgMap) {
        imgMap.style.transition = "transform 0.25s ease-out";
        imgMap.style.transformOrigin = "center center";
        imgMap.style.transform = `scale(${State.mapZoom})`;
      }
      if (zoomText) {
        zoomText.textContent = `${Math.round(State.mapZoom * 100)}%`;
      }
    };

    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => updateZoom(State.mapZoom + 0.2));
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => updateZoom(State.mapZoom - 0.2));
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        State.mapZoom = 1;
        updateZoom(1);
        closeBuildingCard();
      });
    }
  }

  function selectBuilding(code) {
    const bldg = State.campusData.buildings.find(b => b.code === code);
    if (!bldg) return;

    State.selectedBuilding = bldg;

    // Show In-Map Building Detail Card
    const card = document.getElementById("building-info-card");
    const codeBadge = document.getElementById("bldg-card-code");
    const title = document.getElementById("bldg-card-title");
    const desc = document.getElementById("bldg-card-desc");
    const locationsList = document.getElementById("bldg-card-locations");

    if (card && title && desc && locationsList) {
      if (codeBadge) codeBadge.textContent = bldg.code;
      title.textContent = bldg.name;
      desc.textContent = `${bldg.totalFloors} • ${bldg.description}`;

      locationsList.innerHTML = bldg.knownLocations.map(loc => `
        <li>${escapeHtml(loc)}</li>
      `).join("");

      card.classList.add("open");
    }
  }

  function zoomIntoSelectedBuilding() {
    if (!State.selectedBuilding) return;
    const svgMap = document.getElementById("campus-map-svg");
    const zoomText = document.getElementById("map-zoom-level");

    State.mapZoom = 1.6;
    if (svgMap) {
      const isMB = State.selectedBuilding.code === "MB";
      const originX = isMB ? "30%" : "70%";
      svgMap.style.transformOrigin = `${originX} 35%`;
      svgMap.style.transform = `scale(${State.mapZoom})`;
    }
    const imgMap = document.querySelector("#map-viewport-container img");
    if (imgMap) {
      const isMB = State.selectedBuilding.code === "MB";
      const originX = isMB ? "30%" : "70%";
      imgMap.style.transition = "transform 0.25s ease-out";
      imgMap.style.transformOrigin = `${originX} 35%`;
      imgMap.style.transform = `scale(${State.mapZoom})`;
    }
    if (zoomText) {
      zoomText.textContent = "160%";
    }
    showToast(`Zoomed into ${State.selectedBuilding.name}`);
  }

  function closeBuildingCard() {
    const card = document.getElementById("building-info-card");
    if (card) card.classList.remove("open");
    State.selectedBuilding = null;
  }

  /* ==========================================================================
     6. RENDER CATEGORY VIEWS
     ========================================================================== */
  function renderClassrooms() {
    const container = document.getElementById("classrooms-grid");
    if (!container) return;

    const buildingFilter = document.getElementById("filter-classrooms-building")?.value || "all";
    const acFilter = document.getElementById("filter-classrooms-ac")?.value || "all";
    const floorFilter = document.getElementById("filter-classrooms-floor")?.value || "all";

    // Combine standard classrooms and special unverified room B201 for display clarity
    const all = [
      ...State.campusData.classrooms,
      ...State.campusData.specialRooms
    ];

    const filtered = all.filter(c => {
      // Building filter
      if (buildingFilter !== "all" && c.buildingCode !== buildingFilter) return false;
      // AC filter
      if (acFilter === "ac" && c.airConditioned !== true) return false;
      if (acFilter === "non-ac" && c.airConditioned !== false) return false;
      // Floor filter
      if (floorFilter !== "all" && !c.floor.toLowerCase().includes(floorFilter.toLowerCase())) return false;
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-lg);">
          <div style="font-size: 2rem; margin-bottom: 0.75rem;">🏫</div>
          <p style="color: var(--text-muted);">No classrooms match the selected filters. Try adjusting the filters above.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => `
      <div class="item-card">
        <div class="item-card-header">
          <h4 class="item-card-title">${escapeHtml(item.name)}</h4>
          <span class="item-card-type">${item.id === "B201" ? "Room Type: Coming Soon" : escapeHtml(item.type)}</span>
        </div>

        <div class="item-meta-list">
          <div class="item-meta-row">
            <span class="meta-icon">🏢</span>
            <span>${escapeHtml(item.building)}</span>
          </div>
          <div class="item-meta-row">
            <span class="meta-icon">📍</span>
            <span>Floor: <strong>${escapeHtml(item.floor)}</strong></span>
          </div>
          <div class="item-meta-row">
            <span class="meta-icon">❄️</span>
            <span>
              ${item.airConditioned === true ? '<span class="badge badge-ac">AC</span>' : (item.airConditioned === false ? '<span class="badge badge-non-ac">Non-AC</span>' : '<span class="badge badge-unknown">AC/Non-AC: Information coming soon</span>')}
            </span>
          </div>
          <div class="item-meta-row">
            <span class="meta-icon">🧭</span>
            <span>Direction: <strong>${escapeHtml(item.direction || "Upcoming")}</strong></span>
          </div>
          ${item.associatedWith ? `
            <div class="item-meta-row">
              <span class="meta-icon">👤</span>
              <span>Associated with: <strong>${escapeHtml(item.associatedWith)}</strong></span>
            </div>
          ` : ""}
        </div>

        <div class="card-actions">
          <button class="btn btn-primary btn-sm" onclick="window.CampusGo.viewDetails('${item.id}', 'Classroom')">
            VIEW DETAILS
          </button>
          <button class="btn btn-outline btn-sm" onclick="window.CampusGo.toggleFavorite('${item.id}', '${escapeAttr(item.name)}', 'Classroom')">
            ${isFavorite(item.id) ? "★ Saved" : "☆ Save"}
          </button>
        </div>
      </div>
    `).join("");
  }

  function renderLabs() {
    const container = document.getElementById("labs-grid");
    if (!container) return;

    container.innerHTML = State.campusData.labs.map(lab => `
      <div class="item-card">
        <div class="item-card-header">
          <h4 class="item-card-title">${escapeHtml(lab.name)}</h4>
          <span class="item-card-type">${escapeHtml(lab.type)}</span>
        </div>

        <div class="item-meta-list">
          <div class="item-meta-row">
            <span class="meta-icon">🏢</span>
            <span>${escapeHtml(lab.building)}</span>
          </div>
          <div class="item-meta-row">
            <span class="meta-icon">📍</span>
            <span>Floor: <strong>${escapeHtml(lab.floor)}</strong></span>
          </div>
          <div class="item-meta-row">
            <span class="meta-icon">❄️</span>
            <span><span class="badge badge-ac">AC</span></span>
          </div>
          <div class="item-meta-row">
            <span class="meta-icon">🧭</span>
            <span>Direction: <strong>${escapeHtml(lab.direction || "Upcoming")}</strong></span>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn btn-primary btn-sm" onclick="window.CampusGo.viewDetails('${lab.id}', 'Laboratory')">
            VIEW DETAILS
          </button>
          <button class="btn btn-outline btn-sm" onclick="window.CampusGo.toggleFavorite('${lab.id}', '${escapeAttr(lab.name)}', 'Laboratory')">
            ${isFavorite(lab.id) ? "★ Saved" : "☆ Save"}
          </button>
        </div>
      </div>
    `).join("");
  }

  function renderFaculty() {
    const container = document.getElementById("faculty-grid");
    if (!container) return;

    const searchInput = document.getElementById("faculty-filter-input");
    const query = (searchInput?.value || "").trim().toLowerCase();

    const filtered = State.campusData.faculty.filter(f => {
      if (!query) return true;
      return f.name.toLowerCase().includes(query) || (f.building && f.building.toLowerCase().includes(query));
    });

    container.innerHTML = filtered.map(f => {
      // Get first letter of name for avatar
      const initials = f.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
      const hasOffice = f.office && f.office !== "Information coming soon";

      return `
      <div class="item-card">
        <div style="display: flex; align-items: flex-start; gap: 0.85rem; margin-bottom: 0.75rem;">
          <div class="faculty-avatar">${escapeHtml(initials)}</div>
          <div style="flex: 1;">
            <div class="item-card-header" style="padding: 0; border: none; background: none;">
              <h4 class="item-card-title" style="margin: 0;">${escapeHtml(f.name)}</h4>
              <span class="item-card-type">Faculty</span>
            </div>
            <div style="margin-top: 0.35rem; font-size: 0.825rem; color: var(--text-muted);">Indus University</div>
          </div>
        </div>

        <div class="item-meta-list">
          <div class="item-meta-row">
            <span class="meta-icon">🏢</span>
            <span>Building: <strong>${escapeHtml(f.building)}</strong></span>
          </div>
          <div class="item-meta-row">
            <span class="meta-icon">📍</span>
            <span>Floor: <strong>${escapeHtml(f.floor)}</strong></span>
          </div>
          <div class="item-meta-row">
            <span class="meta-icon">🚪</span>
            <span>Office Room: <strong>${escapeHtml(f.office || f.room)}</strong></span>
          </div>
          ${f.notes ? `
            <div style="margin-top: 0.4rem; font-size: 0.8rem; color: var(--text-muted); font-style: italic;">
              ${escapeHtml(f.notes)}
            </div>
          ` : ""}
        </div>

        <div class="card-actions">
          <button class="btn btn-primary btn-sm" onclick="window.CampusGo.viewDetails('${f.id}', 'Faculty')">
            VIEW DETAILS
          </button>
          <button class="btn btn-appointment btn-sm" onclick="window.CampusGo.openAppointmentModal('${escapeAttr(f.name)}')">
            📅 Appointment
          </button>
          <button class="btn btn-outline btn-sm" onclick="window.CampusGo.toggleFavorite('${f.id}', '${escapeAttr(f.name)}', 'Faculty')">
            ${isFavorite(f.id) ? "★ Saved" : "☆ Save"}
          </button>
        </div>
      </div>
    `}).join("");
  }

  function renderFacilities() {
    const container = document.getElementById("facilities-grid");
    if (!container) return;

    const categoryFilter = document.getElementById("filter-facilities-category")?.value || "all";

    const all = [
      ...State.campusData.facilities,
      ...State.campusData.foodCafes
    ];

    const filtered = all.filter(f => {
      if (categoryFilter === "all") return true;
      if (categoryFilter === "Food" && f.type === "Food & Beverage") return true;
      if (categoryFilter === "Landmark" && f.type === "Campus Landmark") return true;
      return (f.category || f.type || "").toLowerCase().includes(categoryFilter.toLowerCase());
    });

    container.innerHTML = filtered.map(f => `
      <div class="item-card">
        <div class="item-card-header">
          <h4 class="item-card-title">${escapeHtml(f.name)}</h4>
          <span class="item-card-type">${escapeHtml(f.type || f.category)}</span>
        </div>

        <div class="item-meta-list">
          <div class="item-meta-row">
            <span class="meta-icon">🏢</span>
            <span>Location: <strong>${escapeHtml(f.building || f.location)}</strong></span>
          </div>
          ${f.floor ? `
            <div class="item-meta-row">
              <span class="meta-icon">📍</span>
              <span>Floor: <strong>${escapeHtml(f.floor)}</strong></span>
            </div>
          ` : ""}
          <div class="item-meta-row">
            <span class="meta-icon">🧭</span>
            <span>Direction: <strong>${escapeHtml(f.direction || "Upcoming")}</strong></span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">
            ${escapeHtml(f.description)}
          </p>
        </div>

        <div class="card-actions">
          <button class="btn btn-primary btn-sm" onclick="window.CampusGo.viewDetails('${f.id}', '${escapeAttr(f.type || f.category)}')">
            VIEW DETAILS
          </button>
          <button class="btn btn-outline btn-sm" onclick="window.CampusGo.toggleFavorite('${f.id}', '${escapeAttr(f.name)}', 'Facility')">
            ${isFavorite(f.id) ? "★ Saved" : "☆ Save"}
          </button>
        </div>
      </div>
    `).join("");
  }

  /* ==========================================================================
     7. FREE CLASSROOM FEATURE
     "Do not automatically mark rooms as free unless availability has been submitted."
     ========================================================================== */
  function renderFreeRooms() {
    const container = document.getElementById("free-rooms-grid");
    if (!container) return;

    const submissions = State.campusData.freeRoomSubmissions || [];

    if (submissions.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-lg);">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🟢</div>
          <h3 style="font-size: 1.25rem; color: var(--navy-secondary); margin-bottom: 0.5rem;">No Free Rooms Reported Yet</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.95rem;">
            Be the first to report a free classroom and earn +5 Karma Points ⭐
          </p>
          <button class="btn btn-primary" onclick="window.CampusGo.openSubmitFreeRoomModal()">
            + Submit Classroom Availability
          </button>
        </div>
      `;
      return;
    }

    // Helper to find classroom info
    const getRoomInfo = (roomId) => {
      const all = [
        ...State.campusData.classrooms,
        ...State.campusData.specialRooms,
        ...State.campusData.labs
      ];
      return all.find(r => r.id === roomId);
    };

    container.innerHTML = submissions.map(sub => {
      const roomInfo = getRoomInfo(sub.roomId);
      const building = roomInfo ? roomInfo.building : (sub.building || "Bhanwan Building (BB)");
      const floor = roomInfo ? roomInfo.floor : (sub.floor || "Information coming soon");

      // Format time display
      const startFormatted = formatTimeDisplay(sub.startTime);
      const endFormatted = formatTimeDisplay(sub.endTime);

      return `
      <div class="item-card">
        <div class="item-card-header">
          <h4 class="item-card-title">${escapeHtml(sub.roomId)}</h4>
          <span class="badge ${sub.reportedOccupied ? "badge-occupied" : "badge-available"}">
            ${sub.reportedOccupied ? "🔴 Reported Occupied" : "🟢 Available"}
          </span>
        </div>

        <div class="item-meta-list">
          <div class="item-meta-row">
            <span class="meta-icon">🏢</span>
            <span>${escapeHtml(building)}</span>
          </div>
          <div class="item-meta-row">
            <span class="meta-icon">📍</span>
            <span>Floor: <strong>${escapeHtml(floor)}</strong></span>
          </div>
          <div class="item-meta-row">
            <span class="meta-icon">📅</span>
            <span>Date: <strong>${escapeHtml(sub.date)}</strong></span>
          </div>
          <div class="item-meta-row">
            <span class="meta-icon">⏰</span>
            <span>Time: <strong>${escapeHtml(startFormatted)} - ${escapeHtml(endFormatted)}</strong></span>
          </div>
          <div class="item-meta-row" style="font-size: 0.8rem; color: var(--text-light); margin-top: 0.25rem;">
            <span>Submitted by: ${escapeHtml(sub.submittedBy || "Student")}</span>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn btn-outline btn-sm" onclick="window.CampusGo.viewDetails('${sub.roomId}', 'Classroom')">
            VIEW DETAILS
          </button>
          ${!sub.reportedOccupied ? `
            <button class="btn btn-danger btn-sm" onclick="window.CampusGo.reportOccupied('${sub.id}')">
              REPORT OCCUPIED
            </button>
          ` : `
            <span style="font-size: 0.8rem; color: var(--status-occupied); font-weight: 600;">Status: Occupied</span>
          `}
        </div>
      </div>
    `}).join("");
  }

  /**
   * Format time for display — supports both "HH:MM" (from time input) and "HH:MM AM/PM" strings.
   */
  function formatTimeDisplay(timeStr) {
    if (!timeStr) return "";
    // Already has AM/PM
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    // 24h format from time input — convert to 12h
    try {
      const [h, m] = timeStr.split(":");
      const hour = parseInt(h, 10);
      const min = m || "00";
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${min} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  }

  let isSubmittingFreeRoom = false;

  function openSubmitFreeRoomModal() {
    isSubmittingFreeRoom = false;
    const submitBtn = document.getElementById("submit-free-room-btn");
    if (submitBtn) {
      submitBtn.disabled = false;
    }
    // Reset error
    const errEl = document.getElementById("free-room-form-error");
    if (errEl) { errEl.style.display = "none"; errEl.textContent = ""; }
    // Reset building/floor selector
    const buildingSelect = document.getElementById("submit-room-building");
    if (buildingSelect) buildingSelect.value = "";
    const floorGroup = document.getElementById("floor-select-group");
    if (floorGroup) floorGroup.style.display = "none";
    // Set today's date
    const dateInput = document.getElementById("submit-room-date");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
    // Clear search
    const searchInput = document.getElementById("submit-room-search");
    if (searchInput) searchInput.value = "";
    openModal("submit-free-room-modal");
  }

  /**
   * Filter room selector by search input (Option A).
   */
  function filterRoomSelector(searchVal) {
    const select = document.getElementById("submit-room-id");
    if (!select) return;
    const val = (searchVal || "").toLowerCase().trim();
    const options = select.options;
    for (let i = 1; i < options.length; i++) {
      const optText = options[i].text.toLowerCase();
      if (!val || optText.includes(val)) {
        options[i].hidden = false;
      } else {
        options[i].hidden = true;
      }
    }
  }

  /**
   * Update Floor options when a building is selected (Option B).
   */
  function updateFloorOptions() {
    const buildingSelect = document.getElementById("submit-room-building");
    const floorSelect = document.getElementById("submit-room-floor");
    const floorGroup = document.getElementById("floor-select-group");
    const roomSelect = document.getElementById("submit-room-id");

    if (!buildingSelect || !floorSelect || !floorGroup) return;
    const bCode = buildingSelect.value;

    if (!bCode) {
      floorGroup.style.display = "none";
      return;
    }

    // Build floor options from data
    const bldg = State.campusData.buildings.find(b => b.code === bCode);
    if (!bldg) return;

    floorSelect.innerHTML = '<option value="">-- Select Floor --</option>';
    (bldg.knownFloors || []).forEach(f => {
      if (f.locations && f.locations.length > 0 && f.locations[0] !== "Information coming soon") {
        const opt = document.createElement("option");
        opt.value = f.floor;
        opt.textContent = f.floor;
        floorSelect.appendChild(opt);
      }
    });

    floorGroup.style.display = "block";

    // Reset classroom select
    if (roomSelect) roomSelect.value = "";
  }

  /**
   * Update classroom options when a floor is selected (Option B).
   */
  function updateClassroomOptions() {
    const buildingSelect = document.getElementById("submit-room-building");
    const floorSelect = document.getElementById("submit-room-floor");
    const roomSelect = document.getElementById("submit-room-id");

    if (!buildingSelect || !floorSelect || !roomSelect) return;
    const bCode = buildingSelect.value;
    const floorVal = floorSelect.value;

    if (!bCode || !floorVal) return;

    // Find rooms in this building + floor
    const allRooms = [
      ...State.campusData.classrooms,
      ...State.campusData.specialRooms,
      ...State.campusData.labs
    ];

    const matchingRooms = allRooms.filter(r =>
      r.buildingCode === bCode && r.floor === floorVal
    );

    if (matchingRooms.length > 0) {
      // Temporarily select the first matching room for convenience
      const firstMatch = matchingRooms[0];
      const options = roomSelect.options;
      for (let i = 0; i < options.length; i++) {
        if (options[i].value === firstMatch.id) {
          roomSelect.value = firstMatch.id;
          break;
        }
      }
    }
  }

  function handleFreeRoomSubmit(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Guard: Prevent duplicate points from accidental multiple clicks
    if (isSubmittingFreeRoom) {
      return false;
    }

    const roomSelect = document.getElementById("submit-room-id");
    const dateInput = document.getElementById("submit-room-date");
    const startTimeInput = document.getElementById("submit-room-start");
    const endTimeInput = document.getElementById("submit-room-end");
    const errEl = document.getElementById("free-room-form-error");

    const showFormError = (msg) => {
      if (errEl) {
        errEl.textContent = msg;
        errEl.style.display = "block";
      } else {
        showToast(msg);
      }
    };

    if (!roomSelect || !dateInput || !startTimeInput || !endTimeInput) {
      return false;
    }

    const roomId = roomSelect.value ? roomSelect.value.trim() : "";
    const dateVal = dateInput.value ? dateInput.value.trim() : "";
    const startTime = startTimeInput.value ? startTimeInput.value.trim() : "";
    const endTime = endTimeInput.value ? endTimeInput.value.trim() : "";

    // Validate all fields
    if (!roomId) {
      showFormError("Please select a classroom.");
      return false;
    }
    if (!dateVal) {
      showFormError("Please select a date.");
      return false;
    }
    if (!startTime) {
      showFormError("Please select a start time.");
      return false;
    }
    if (!endTime) {
      showFormError("Please select an end time.");
      return false;
    }

    // Validate end time is after start time
    if (startTime >= endTime) {
      showFormError("End time must be later than start time.");
      return false;
    }

    // Hide error
    if (errEl) errEl.style.display = "none";

    // Set lock flag and disable submit button
    isSubmittingFreeRoom = true;
    const submitBtn = document.getElementById("submit-free-room-btn");
    if (submitBtn) {
      submitBtn.disabled = true;
    }

    try {
      // Get room details
      const allRooms = [
        ...State.campusData.classrooms,
        ...State.campusData.specialRooms,
        ...State.campusData.labs
      ];
      const roomInfo = allRooms.find(r => r.id === roomId);

      const newSub = {
        id: "SUB-" + Date.now(),
        roomId: roomId,
        building: roomInfo ? roomInfo.building : "Indus University",
        buildingCode: roomInfo ? roomInfo.buildingCode : "UNK",
        floor: roomInfo ? roomInfo.floor : "Information coming soon",
        date: formatDateDisplay(dateVal),
        startTime: startTime,
        endTime: endTime,
        status: "Available",
        submittedBy: "Student",
        reportedOccupied: false,
        occupiedReportsCount: 0
      };

      if (!State.campusData) {
        State.campusData = window.getCampusData() || {};
      }
      if (!State.campusData.freeRoomSubmissions) {
        State.campusData.freeRoomSubmissions = [];
      }

      State.campusData.freeRoomSubmissions.unshift(newSub);
      window.saveCampusData(State.campusData);

      // Successfully saved! Award +5 Karma Points
      const pointsToAward = window.KARMA_POINTS_CONFIG?.FREE_SUBMISSION || 5;
      const newTotal = (typeof window.awardKarmaPoints === "function")
        ? window.awardKarmaPoints(pointsToAward)
        : 0;

      // Update student's Karma points display immediately
      updateKarmaDisplay(newTotal);

      // Reset form inputs
      roomSelect.value = "";
      startTimeInput.value = "";
      endTimeInput.value = "";
      const searchInput = document.getElementById("submit-room-search");
      if (searchInput) searchInput.value = "";

      // Close modal and refresh the list
      closeModal("submit-free-room-modal");
      renderFreeRooms();

      // Show clear confirmation toast
      showToast("Classroom reported successfully! +5 Karma Points ⭐");
    } catch (err) {
      console.error("Free classroom submission failed:", err);
      showToast("Submission failed. Please try again.");
    } finally {
      setTimeout(() => {
        isSubmittingFreeRoom = false;
        if (submitBtn) {
          submitBtn.disabled = false;
        }
      }, 500);
    }

    return false;
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  }

  function reportOccupied(submissionId) {
    const sub = (State.campusData.freeRoomSubmissions || []).find(s => s.id === submissionId);
    if (!sub) return;

    sub.reportedOccupied = true;
    sub.occupiedReportsCount = (sub.occupiedReportsCount || 0) + 1;
    window.saveCampusData(State.campusData);

    renderFreeRooms();
    showToast(`Room ${sub.roomId} reported as occupied.`);
  }

  /* ==========================================================================
     7b. FACULTY APPOINTMENT SYSTEM
     ========================================================================== */
  let isSubmittingAppointment = false;

  function openAppointmentModal(facultyName) {
    isSubmittingAppointment = false;
    const submitBtn = document.getElementById("appt-submit-btn");
    if (submitBtn) submitBtn.disabled = false;

    // Set faculty name (readonly)
    const facNameInput = document.getElementById("appt-faculty-name");
    if (facNameInput) facNameInput.value = facultyName || "";

    // Clear other fields
    const fields = ["appt-student-name", "appt-student-email", "appt-date", "appt-time", "appt-reason"];
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    // Set today's date as default
    const dateInput = document.getElementById("appt-date");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    // Hide error
    const errEl = document.getElementById("appt-form-error");
    if (errEl) { errEl.style.display = "none"; errEl.textContent = ""; }

    // Update title
    const titleEl = document.getElementById("appointment-modal-title");
    if (titleEl) titleEl.textContent = `Request Appointment — ${facultyName}`;

    openModal("appointment-modal");
  }

  function handleAppointmentSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmittingAppointment) return false;

    const studentName = (document.getElementById("appt-student-name")?.value || "").trim();
    const studentEmail = (document.getElementById("appt-student-email")?.value || "").trim();
    const facultyName = (document.getElementById("appt-faculty-name")?.value || "").trim();
    const apptDate = (document.getElementById("appt-date")?.value || "").trim();
    const apptTime = (document.getElementById("appt-time")?.value || "").trim();
    const reason = (document.getElementById("appt-reason")?.value || "").trim();

    const errEl = document.getElementById("appt-form-error");
    const showFormError = (msg) => {
      if (errEl) {
        errEl.textContent = msg;
        errEl.style.display = "block";
      } else {
        showToast(msg);
      }
    };

    if (!studentName) { showFormError("Please enter your name."); return false; }
    if (!studentEmail) { showFormError("Please enter your email address."); return false; }
    if (!studentEmail.includes("@")) { showFormError("Please enter a valid email address."); return false; }
    if (!facultyName) { showFormError("Faculty name is required."); return false; }
    if (!apptDate) { showFormError("Please select a date."); return false; }
    if (!apptTime) { showFormError("Please select a time."); return false; }
    if (!reason) { showFormError("Please provide a reason or message for the appointment."); return false; }

    if (errEl) errEl.style.display = "none";

    isSubmittingAppointment = true;
    const submitBtn = document.getElementById("appt-submit-btn");
    if (submitBtn) submitBtn.disabled = true;

    try {
      const appointment = {
        id: "APPT-" + Date.now(),
        studentName,
        studentEmail,
        facultyName,
        date: formatDateDisplay(apptDate),
        time: formatTimeDisplay(apptTime),
        reason,
        submittedAt: new Date().toLocaleString("en-IN")
      };

      if (typeof window.saveAppointment === "function") {
        window.saveAppointment(appointment);
      } else {
        // Fallback: save directly
        const existing = JSON.parse(localStorage.getItem(window.STORAGE_KEYS?.APPOINTMENTS || "inside_indus_appointments") || "[]");
        existing.unshift(appointment);
        localStorage.setItem(window.STORAGE_KEYS?.APPOINTMENTS || "inside_indus_appointments", JSON.stringify(existing));
      }

      closeModal("appointment-modal");
      showToast("Appointment request submitted successfully.");
    } catch (err) {
      console.error("Appointment submission failed:", err);
      showToast("Submission failed. Please try again.");
    } finally {
      setTimeout(() => {
        isSubmittingAppointment = false;
        if (submitBtn) submitBtn.disabled = false;
      }, 500);
    }

    return false;
  }

  /* ==========================================================================
     8. ITEM DETAILS MODAL & NAVIGATE PLACEHOLDER
     ========================================================================== */
  function viewDetails(itemId, category) {
    const all = getAllSearchableItems();
    const item = all.find(i => i.id === itemId) || all.find(i => i.name.toLowerCase() === itemId.toLowerCase());

    const titleEl = document.getElementById("details-modal-title");
    const bodyEl = document.getElementById("details-modal-body");
    const favBtn = document.getElementById("details-modal-fav-btn");
    const navBtn = document.getElementById("details-modal-nav-btn");

    if (!item) {
      showToast("Details coming soon.");
      return;
    }

    if (titleEl) titleEl.textContent = item.name;

    const isFacultyItem = item.category === "Faculty";

    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.95rem;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
            <span style="color: var(--text-muted); font-weight: 600;">Category</span>
            <span style="font-weight: 700; color: var(--navy-secondary);">${escapeHtml(item.category)}</span>
          </div>

          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
            <span style="color: var(--text-muted); font-weight: 600;">Campus Building</span>
            <span style="font-weight: 700; color: var(--navy-primary);">${escapeHtml(item.building || "Indus University")}</span>
          </div>

          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
            <span style="color: var(--text-muted); font-weight: 600;">Floor</span>
            <span style="font-weight: 700;">${escapeHtml(item.floor || "Information coming soon")}</span>
          </div>

          ${item.ac ? `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
              <span style="color: var(--text-muted); font-weight: 600;">Air Conditioning</span>
              <span>
                ${item.ac === "AC" ? '<span class="badge badge-ac">AC</span>' : (item.ac === "Non-AC" ? '<span class="badge badge-non-ac">Non-AC</span>' : '<span class="badge badge-unknown">Information coming soon</span>')}
              </span>
            </div>
          ` : ""}

          ${(item.direction || item.rawObj?.direction) ? `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
              <span style="color: var(--text-muted); font-weight: 600;">Direction</span>
              <span style="font-weight: 700; color: var(--navy-secondary);">${escapeHtml(item.direction || item.rawObj?.direction || "Upcoming")}</span>
            </div>
          ` : ""}

          ${item.associatedWith ? `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
              <span style="color: var(--text-muted); font-weight: 600;">Associated Faculty</span>
              <span style="font-weight: 700; color: var(--navy-secondary);">${escapeHtml(item.associatedWith)}</span>
            </div>
          ` : ""}

          ${item.room && isFacultyItem ? `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
              <span style="color: var(--text-muted); font-weight: 600;">Faculty Office</span>
              <span style="font-weight: 700;">${escapeHtml(item.room)}</span>
            </div>
          ` : ""}

          ${item.description || item.notes ? `
            <div style="margin-top: 0.5rem; padding: 0.85rem; background-color: var(--bg-subtle); border-radius: var(--radius-md); font-size: 0.85rem; color: var(--text-secondary);">
              <strong>Notes:</strong> ${escapeHtml(item.description || item.notes)}
            </div>
          ` : ""}

          ${isFacultyItem ? `
            <div style="margin-top: 0.5rem;">
              <button class="btn btn-appointment" style="width: 100%;" onclick="window.CampusGo.closeModal('details-modal'); window.CampusGo.openAppointmentModal('${escapeAttr(item.name)}')">
                📅 Request Appointment with ${escapeHtml(item.name)}
              </button>
            </div>
          ` : ""}
        </div>
      `;
    }

    if (favBtn) {
      favBtn.innerHTML = isFavorite(item.id) ? "★ Saved in Favorites" : "☆ Add to Favorites";
      favBtn.onclick = () => {
        toggleFavorite(item.id, item.name, item.category);
        favBtn.innerHTML = isFavorite(item.id) ? "★ Saved in Favorites" : "☆ Add to Favorites";
      };
    }

    if (navBtn) {
      navBtn.onclick = () => {
        closeModal("details-modal");
        triggerNavigatePlaceholder(item.name);
      };
    }

    openModal("details-modal");
  }

  function triggerNavigatePlaceholder(destinationName) {
    const destEl = document.getElementById("nav-modal-destination-title");
    if (destEl) {
      destEl.textContent = destinationName || "Campus Destination";
    }
    openModal("navigate-placeholder-modal");
  }

  /* ==========================================================================
     9. BUILDING FLOOR EXPLORER MODAL
     ========================================================================== */
  function openFloorExplorer(bldgCode) {
    const bldg = State.campusData.buildings.find(b => b.code === bldgCode);
    if (!bldg) return;

    const titleEl = document.getElementById("floor-explorer-title");
    const tabsRow = document.getElementById("floor-explorer-tabs");
    const contentEl = document.getElementById("floor-explorer-content");

    if (titleEl) titleEl.textContent = `${bldg.name} (${bldg.code}) • Floor Directory`;

    if (tabsRow && contentEl) {
      const floors = bldg.knownFloors || [];
      tabsRow.innerHTML = floors.map((f, idx) => `
        <button class="floor-tab-btn ${idx === 0 ? "active" : ""}" onclick="window.CampusGo.selectFloorTab('${bldgCode}', ${idx})">
          ${escapeHtml(f.floor)}
        </button>
      `).join("");

      renderFloorContent(floors[0]);
    }

    openModal("floor-explorer-modal");
  }

  function selectFloorTab(bldgCode, floorIndex) {
    const bldg = State.campusData.buildings.find(b => b.code === bldgCode);
    if (!bldg || !bldg.knownFloors) return;

    document.querySelectorAll(".floor-tab-btn").forEach((btn, idx) => {
      btn.classList.toggle("active", idx === floorIndex);
    });

    renderFloorContent(bldg.knownFloors[floorIndex]);
  }

  function renderFloorContent(floorObj) {
    const contentEl = document.getElementById("floor-explorer-content");
    if (!contentEl || !floorObj) return;

    if (!floorObj.locations || floorObj.locations.length === 0 || floorObj.locations[0] === "Information coming soon") {
      contentEl.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--text-muted); background-color: var(--bg-subtle); border-radius: var(--radius-md);">
          <p style="font-weight: 700; color: var(--navy-secondary); margin-bottom: 0.25rem;">Information coming soon</p>
          <p style="font-size: 0.85rem;">Detailed room inventory for this floor is currently being verified.</p>
        </div>
      `;
      return;
    }

    contentEl.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem;">
        ${floorObj.locations.map(loc => `
          <div style="padding: 0.85rem 1rem; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 700; color: var(--navy-secondary);">${escapeHtml(loc)}</span>
            <button class="btn btn-outline btn-xs" onclick="window.CampusGo.viewDetails('${escapeAttr(loc)}', 'Location')">View</button>
          </div>
        `).join("")}
      </div>
      <p style="font-size: 0.8rem; color: var(--text-light); margin-top: 1rem; text-align: center;">
        More locations coming soon
      </p>
    `;
  }

  /* ==========================================================================
     10. FAVORITES (⭐ Stored in localStorage)
     ========================================================================== */
  function isFavorite(itemId) {
    return State.favorites.some(f => f.id === itemId);
  }

  function toggleFavorite(itemId, name, category) {
    const idx = State.favorites.findIndex(f => f.id === itemId);
    if (idx >= 0) {
      State.favorites.splice(idx, 1);
      showToast(`Removed ${name} from favorites.`);
    } else {
      State.favorites.push({
        id: itemId,
        name: name,
        category: category,
        savedAt: new Date().toLocaleDateString()
      });
      showToast(`Saved ${name} to favorites! ⭐`);
    }

    try {
      localStorage.setItem(window.STORAGE_KEYS.FAVORITES, JSON.stringify(State.favorites));
    } catch (e) {
      console.warn("Could not save favorites", e);
    }

    // Refresh views if open
    if (State.activeView === "profile") {
      renderProfileFavorites();
    }
  }

  /* ==========================================================================
     11. USER PROFILE
     ========================================================================== */
  function renderProfileView() {
    renderProfileFavorites();
    renderProfileRecentSearches();
  }

  function renderProfileFavorites() {
    const listEl = document.getElementById("profile-favorites-container");
    if (!listEl) return;

    if (State.favorites.length === 0) {
      listEl.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No saved favorites yet. Click the "Save" button on any room or lab.</p>`;
      return;
    }

    listEl.innerHTML = State.favorites.map(fav => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-light);">
        <div>
          <span style="font-weight: 700; color: var(--navy-secondary);">${escapeHtml(fav.name)}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">(${escapeHtml(fav.category)})</span>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-outline btn-xs" onclick="window.CampusGo.viewDetails('${fav.id}', '${escapeAttr(fav.category)}')">View</button>
          <button class="btn btn-outline btn-xs text-danger" onclick="window.CampusGo.toggleFavorite('${fav.id}', '${escapeAttr(fav.name)}', '${escapeAttr(fav.category)}')">Remove</button>
        </div>
      </div>
    `).join("");
  }

  function renderProfileRecentSearches() {
    const container = document.getElementById("profile-recent-searches");
    if (!container) return;

    if (State.recentSearches.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No recent searches recorded.</p>`;
      return;
    }

    container.innerHTML = State.recentSearches.map(term => `
      <button class="recent-chip" onclick="window.CampusGo.openDedicatedSearchView('${escapeAttr(term)}')">
        🔍 ${escapeHtml(term)}
      </button>
    `).join("");
  }

  /* ==========================================================================
     12. ADMIN DASHBOARD & CRUD
     ========================================================================== */
  let currentAdminTab = "classrooms";

  function renderAdminDashboard() {
    const tabsContainer = document.getElementById("admin-tabs-container");
    const contentContainer = document.getElementById("admin-content-container");

    if (!tabsContainer || !contentContainer) return;

    const tabs = [
      { id: "classrooms", label: "🏫 Classrooms" },
      { id: "labs", label: "🧪 Laboratories" },
      { id: "faculty", label: "👨‍🏫 Faculty" },
      { id: "facilities", label: "🏢 Facilities & Cafes" },
      { id: "freeRooms", label: "🟢 Free Room Reports" },
      { id: "appointments", label: "📅 Appointments" }
    ];

    tabsContainer.innerHTML = tabs.map(t => `
      <div class="admin-nav-tab ${t.id === currentAdminTab ? "active" : ""}" onclick="window.CampusGo.switchAdminTab('${t.id}')">
        ${t.label}
      </div>
    `).join("");

    renderAdminTabContent();
  }

  function switchAdminTab(tabId) {
    currentAdminTab = tabId;
    renderAdminDashboard();
  }

  function renderAdminTabContent() {
    const container = document.getElementById("admin-content-container");
    if (!container) return;

    if (currentAdminTab === "classrooms") {
      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.25rem;">Manage Classrooms & Lecture Halls</h3>
          <button class="btn btn-primary btn-sm" onclick="window.CampusGo.openAdminAddModal('classroom')">+ Add Classroom</button>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
              <tr style="background: var(--bg-subtle); text-align: left; border-bottom: 1px solid var(--border-light);">
                <th style="padding: 0.75rem 1rem;">Room ID</th>
                <th style="padding: 0.75rem 1rem;">Building</th>
                <th style="padding: 0.75rem 1rem;">Floor</th>
                <th style="padding: 0.75rem 1rem;">Type</th>
                <th style="padding: 0.75rem 1rem;">AC Status</th>
                <th style="padding: 0.75rem 1rem;">Direction</th>
                <th style="padding: 0.75rem 1rem; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${State.campusData.classrooms.map(c => `
                <tr style="border-bottom: 1px solid var(--border-light);">
                  <td style="padding: 0.75rem 1rem; font-weight: 700;">${escapeHtml(c.name)}</td>
                  <td style="padding: 0.75rem 1rem;">${escapeHtml(c.building)}</td>
                  <td style="padding: 0.75rem 1rem;">${escapeHtml(c.floor)}</td>
                  <td style="padding: 0.75rem 1rem;">${escapeHtml(c.type)}</td>
                  <td style="padding: 0.75rem 1rem;">${c.airConditioned ? "AC" : "Non-AC"}</td>
                  <td style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-secondary);">${escapeHtml(c.direction || "Upcoming")}</td>
                  <td style="padding: 0.75rem 1rem; text-align: right;">
                    <button class="btn btn-outline btn-xs" onclick="window.CampusGo.openAdminEditModal('classroom', '${c.id}')">Edit</button>
                    <button class="btn btn-danger btn-xs" onclick="window.CampusGo.adminDelete('classroom', '${c.id}')">Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    } else if (currentAdminTab === "labs") {
      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.25rem;">Manage Laboratories</h3>
          <button class="btn btn-primary btn-sm" onclick="window.CampusGo.openAdminAddModal('lab')">+ Add Laboratory</button>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
              <tr style="background: var(--bg-subtle); text-align: left; border-bottom: 1px solid var(--border-light);">
                <th style="padding: 0.75rem 1rem;">Lab ID</th>
                <th style="padding: 0.75rem 1rem;">Building</th>
                <th style="padding: 0.75rem 1rem;">Floor</th>
                <th style="padding: 0.75rem 1rem;">AC Status</th>
                <th style="padding: 0.75rem 1rem;">Direction</th>
                <th style="padding: 0.75rem 1rem; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${State.campusData.labs.map(l => `
                <tr style="border-bottom: 1px solid var(--border-light);">
                  <td style="padding: 0.75rem 1rem; font-weight: 700;">${escapeHtml(l.name)}</td>
                  <td style="padding: 0.75rem 1rem;">${escapeHtml(l.building)}</td>
                  <td style="padding: 0.75rem 1rem;">${escapeHtml(l.floor)}</td>
                  <td style="padding: 0.75rem 1rem;">${l.airConditioned ? "AC" : "Non-AC"}</td>
                  <td style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-secondary);">${escapeHtml(l.direction || "Upcoming")}</td>
                  <td style="padding: 0.75rem 1rem; text-align: right;">
                    <button class="btn btn-outline btn-xs" onclick="window.CampusGo.openAdminEditModal('lab', '${l.id}')">Edit</button>
                    <button class="btn btn-danger btn-xs" onclick="window.CampusGo.adminDelete('lab', '${l.id}')">Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    } else if (currentAdminTab === "faculty") {
      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.25rem;">Manage Faculty Directory</h3>
          <button class="btn btn-primary btn-sm" onclick="window.CampusGo.openAdminAddModal('faculty')">+ Add Faculty Member</button>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
              <tr style="background: var(--bg-subtle); text-align: left; border-bottom: 1px solid var(--border-light);">
                <th style="padding: 0.75rem 1rem;">Name</th>
                <th style="padding: 0.75rem 1rem;">Building</th>
                <th style="padding: 0.75rem 1rem;">Floor</th>
                <th style="padding: 0.75rem 1rem;">Office</th>
                <th style="padding: 0.75rem 1rem; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${State.campusData.faculty.map(f => `
                <tr style="border-bottom: 1px solid var(--border-light);">
                  <td style="padding: 0.75rem 1rem; font-weight: 700;">${escapeHtml(f.name)}</td>
                  <td style="padding: 0.75rem 1rem;">${escapeHtml(f.building)}</td>
                  <td style="padding: 0.75rem 1rem;">${escapeHtml(f.floor)}</td>
                  <td style="padding: 0.75rem 1rem;">${escapeHtml(f.office || f.room)}</td>
                  <td style="padding: 0.75rem 1rem; text-align: right;">
                    <button class="btn btn-outline btn-xs" onclick="window.CampusGo.openAdminEditModal('faculty', '${f.id}')">Edit</button>
                    <button class="btn btn-danger btn-xs" onclick="window.CampusGo.adminDelete('faculty', '${f.id}')">Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    } else if (currentAdminTab === "facilities") {
      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.25rem;">Manage Facilities & Food Outlets</h3>
          <button class="btn btn-primary btn-sm" onclick="window.CampusGo.openAdminAddModal('facility')">+ Add Facility</button>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
              <tr style="background: var(--bg-subtle); text-align: left; border-bottom: 1px solid var(--border-light);">
                <th style="padding: 0.75rem 1rem;">Name</th>
                <th style="padding: 0.75rem 1rem;">Type</th>
                <th style="padding: 0.75rem 1rem;">Location</th>
                <th style="padding: 0.75rem 1rem;">Direction</th>
                <th style="padding: 0.75rem 1rem; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${State.campusData.facilities.map(fac => `
                <tr style="border-bottom: 1px solid var(--border-light);">
                  <td style="padding: 0.75rem 1rem; font-weight: 700;">${escapeHtml(fac.name)}</td>
                  <td style="padding: 0.75rem 1rem;">${escapeHtml(fac.type)}</td>
                  <td style="padding: 0.75rem 1rem;">${escapeHtml(fac.building)}</td>
                  <td style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-secondary);">${escapeHtml(fac.direction || "Upcoming")}</td>
                  <td style="padding: 0.75rem 1rem; text-align: right;">
                    <button class="btn btn-outline btn-xs" onclick="window.CampusGo.openAdminEditModal('facility', '${fac.id}')">Edit</button>
                    <button class="btn btn-danger btn-xs" onclick="window.CampusGo.adminDelete('facility', '${fac.id}')">Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    } else if (currentAdminTab === "freeRooms") {
      const subs = State.campusData.freeRoomSubmissions || [];
      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.25rem;">Student Availability & Occupancy Reports</h3>
          <button class="btn btn-outline btn-sm" onclick="window.CampusGo.adminClearOccupiedReports()">Clear Occupied Flags</button>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
              <tr style="background: var(--bg-subtle); text-align: left; border-bottom: 1px solid var(--border-light);">
                <th style="padding: 0.75rem 1rem;">Room</th>
                <th style="padding: 0.75rem 1rem;">Date & Time</th>
                <th style="padding: 0.75rem 1rem;">Submitted By</th>
                <th style="padding: 0.75rem 1rem;">Occupied</th>
                <th style="padding: 0.75rem 1rem; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${subs.map(s => `
                <tr style="border-bottom: 1px solid var(--border-light);">
                  <td style="padding: 0.75rem 1rem; font-weight: 700;">${escapeHtml(s.roomId)}</td>
                  <td style="padding: 0.75rem 1rem;">${escapeHtml(s.date)} • ${escapeHtml(formatTimeDisplay(s.startTime))} - ${escapeHtml(formatTimeDisplay(s.endTime))}</td>
                  <td style="padding: 0.75rem 1rem;">${escapeHtml(s.submittedBy)}</td>
                  <td style="padding: 0.75rem 1rem;">
                    ${s.reportedOccupied ? '<span class="badge badge-occupied">YES</span>' : '<span class="badge badge-available">NO</span>'}
                  </td>
                  <td style="padding: 0.75rem 1rem; text-align: right;">
                    <button class="btn btn-danger btn-xs" onclick="window.CampusGo.adminDeleteFreeRoom('${s.id}')">Remove</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    } else if (currentAdminTab === "appointments") {
      const appts = (typeof window.getAppointments === "function") ? window.getAppointments() : [];
      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.25rem;">Faculty Appointment Requests (${appts.length})</h3>
          <button class="btn btn-outline btn-sm" onclick="window.CampusGo.adminClearAppointments()">Clear All</button>
        </div>
        ${appts.length === 0 ? `
          <div style="text-align: center; padding: 2rem; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-md);">
            <p style="color: var(--text-muted);">No appointment requests yet.</p>
          </div>
        ` : `
          <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
              <thead>
                <tr style="background: var(--bg-subtle); text-align: left; border-bottom: 1px solid var(--border-light);">
                  <th style="padding: 0.75rem 1rem;">Student</th>
                  <th style="padding: 0.75rem 1rem;">Faculty</th>
                  <th style="padding: 0.75rem 1rem;">Date & Time</th>
                  <th style="padding: 0.75rem 1rem;">Reason</th>
                </tr>
              </thead>
              <tbody>
                ${appts.map(a => `
                  <tr style="border-bottom: 1px solid var(--border-light);">
                    <td style="padding: 0.75rem 1rem;">
                      <strong>${escapeHtml(a.studentName)}</strong><br>
                      <span style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(a.studentEmail)}</span>
                    </td>
                    <td style="padding: 0.75rem 1rem; font-weight: 700;">${escapeHtml(a.facultyName)}</td>
                    <td style="padding: 0.75rem 1rem;">${escapeHtml(a.date)} • ${escapeHtml(a.time)}</td>
                    <td style="padding: 0.75rem 1rem; font-size: 0.85rem;">${escapeHtml(a.reason)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `}
      `;
    }
  }

  function openAdminAddModal(type) {
    const titleEl = document.getElementById("admin-form-modal-title");
    const bodyEl = document.getElementById("admin-form-modal-body");

    if (type === "classroom") {
      if (titleEl) titleEl.textContent = "Add New Classroom";
      if (bodyEl) {
        bodyEl.innerHTML = `
          <form onsubmit="return window.CampusGo.saveAdminItem(event, 'classroom', null)">
            <div class="form-group">
              <label class="form-label">Room Identifier / Name (e.g. LH-15)</label>
              <input type="text" id="admin-field-name" required class="form-input form-input-full" placeholder="e.g. LH-15">
            </div>
            <div class="form-group">
              <label class="form-label">Building</label>
              <select id="admin-field-building-code" class="form-select form-input-full">
                <option value="MB">Main Building (MB)</option>
                <option value="BB" selected>Bhanwan Building (BB)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Floor</label>
              <input type="text" id="admin-field-floor" required placeholder="e.g. 2nd Floor" class="form-input form-input-full">
            </div>
            <div class="form-group">
              <label class="form-label">Air Conditioned</label>
              <select id="admin-field-ac" class="form-select form-input-full">
                <option value="true">Yes (AC)</option>
                <option value="false">No (Non-AC)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Direction</label>
              <input type="text" id="admin-field-direction" class="form-input form-input-full" value="Upcoming" placeholder="e.g. Upcoming">
            </div>
            <div class="modal-footer" style="padding: 1rem 0 0; margin-top: 1rem;">
              <button type="button" class="btn btn-outline" onclick="window.CampusGo.closeModal('admin-form-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Classroom</button>
            </div>
          </form>
        `;
      }
    } else if (type === "lab") {
      if (titleEl) titleEl.textContent = "Add New Laboratory";
      if (bodyEl) {
        bodyEl.innerHTML = `
          <form onsubmit="return window.CampusGo.saveAdminItem(event, 'lab', null)">
            <div class="form-group">
              <label class="form-label">Laboratory Name</label>
              <input type="text" id="admin-field-name" required class="form-input form-input-full" placeholder="e.g. LAB-105">
            </div>
            <div class="form-group">
              <label class="form-label">Building</label>
              <select id="admin-field-building-code" class="form-select form-input-full">
                <option value="BB" selected>Bhanwan Building (BB)</option>
                <option value="MB">Main Building (MB)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Floor</label>
              <input type="text" id="admin-field-floor" required placeholder="e.g. 3rd Floor" class="form-input form-input-full">
            </div>
            <div class="form-group">
              <label class="form-label">Air Conditioned</label>
              <select id="admin-field-ac" class="form-select form-input-full">
                <option value="true" selected>Yes (AC)</option>
                <option value="false">No (Non-AC)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Direction</label>
              <input type="text" id="admin-field-direction" class="form-input form-input-full" value="Upcoming" placeholder="e.g. Upcoming">
            </div>
            <div class="modal-footer" style="padding: 1rem 0 0; margin-top: 1rem;">
              <button type="button" class="btn btn-outline" onclick="window.CampusGo.closeModal('admin-form-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Laboratory</button>
            </div>
          </form>
        `;
      }
    } else if (type === "faculty") {
      if (titleEl) titleEl.textContent = "Add New Faculty Member";
      if (bodyEl) {
        bodyEl.innerHTML = `
          <form onsubmit="return window.CampusGo.saveAdminItem(event, 'faculty', null)">
            <div class="form-group">
              <label class="form-label">Faculty Full Name</label>
              <input type="text" id="admin-field-name" required class="form-input form-input-full" placeholder="e.g. Prof. Nilesh Patel">
            </div>
            <div class="form-group">
              <label class="form-label">Building</label>
              <input type="text" id="admin-field-building" class="form-input form-input-full" value="Information coming soon">
            </div>
            <div class="form-group">
              <label class="form-label">Floor</label>
              <input type="text" id="admin-field-floor" class="form-input form-input-full" value="Information coming soon">
            </div>
            <div class="form-group">
              <label class="form-label">Office Room</label>
              <input type="text" id="admin-field-office" class="form-input form-input-full" value="Information coming soon">
            </div>
            <div class="modal-footer" style="padding: 1rem 0 0; margin-top: 1rem;">
              <button type="button" class="btn btn-outline" onclick="window.CampusGo.closeModal('admin-form-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Faculty</button>
            </div>
          </form>
        `;
      }
    } else if (type === "facility") {
      if (titleEl) titleEl.textContent = "Add Campus Facility / Cafe";
      if (bodyEl) {
        bodyEl.innerHTML = `
          <form onsubmit="return window.CampusGo.saveAdminItem(event, 'facility', null)">
            <div class="form-group">
              <label class="form-label">Facility Name</label>
              <input type="text" id="admin-field-name" required class="form-input form-input-full" placeholder="e.g. Student Helpdesk">
            </div>
            <div class="form-group">
              <label class="form-label">Location / Building</label>
              <input type="text" id="admin-field-building" required class="form-input form-input-full" placeholder="e.g. Main Building (MB)">
            </div>
            <div class="form-group">
              <label class="form-label">Floor</label>
              <input type="text" id="admin-field-floor" class="form-input form-input-full" placeholder="e.g. 1st Floor">
            </div>
            <div class="form-group">
              <label class="form-label">Direction</label>
              <input type="text" id="admin-field-direction" class="form-input form-input-full" value="Upcoming" placeholder="e.g. Upcoming">
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="admin-field-desc" class="form-input form-input-full" rows="2" placeholder="Brief description"></textarea>
            </div>
            <div class="modal-footer" style="padding: 1rem 0 0; margin-top: 1rem;">
              <button type="button" class="btn btn-outline" onclick="window.CampusGo.closeModal('admin-form-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Facility</button>
            </div>
          </form>
        `;
      }
    }

    openModal("admin-form-modal");
  }

  function openAdminEditModal(type, itemId) {
    const titleEl = document.getElementById("admin-form-modal-title");
    const bodyEl = document.getElementById("admin-form-modal-body");

    if (type === "classroom") {
      const c = State.campusData.classrooms.find(item => item.id === itemId);
      if (!c) return;
      if (titleEl) titleEl.textContent = `Edit Classroom: ${c.name}`;
      if (bodyEl) {
        bodyEl.innerHTML = `
          <form onsubmit="return window.CampusGo.saveAdminItem(event, 'classroom', '${c.id}')">
            <div class="form-group">
              <label class="form-label">Room Identifier / Name</label>
              <input type="text" id="admin-field-name" required value="${escapeAttr(c.name)}" class="form-input form-input-full">
            </div>
            <div class="form-group">
              <label class="form-label">Building (full name)</label>
              <input type="text" id="admin-field-building" required value="${escapeAttr(c.building)}" class="form-input form-input-full">
            </div>
            <div class="form-group">
              <label class="form-label">Floor</label>
              <input type="text" id="admin-field-floor" required value="${escapeAttr(c.floor)}" class="form-input form-input-full">
            </div>
            <div class="form-group">
              <label class="form-label">Air Conditioned</label>
              <select id="admin-field-ac" class="form-select form-input-full">
                <option value="true" ${c.airConditioned ? "selected" : ""}>Yes (AC)</option>
                <option value="false" ${!c.airConditioned ? "selected" : ""}>No (Non-AC)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Direction</label>
              <input type="text" id="admin-field-direction" class="form-input form-input-full" value="${escapeAttr(c.direction || 'Upcoming')}" placeholder="e.g. Upcoming">
            </div>
            <div class="modal-footer" style="padding: 1rem 0 0; margin-top: 1rem;">
              <button type="button" class="btn btn-outline" onclick="window.CampusGo.closeModal('admin-form-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Update Classroom</button>
            </div>
          </form>
        `;
      }
    } else if (type === "lab") {
      const l = State.campusData.labs.find(item => item.id === itemId);
      if (!l) return;
      if (titleEl) titleEl.textContent = `Edit Laboratory: ${l.name}`;
      if (bodyEl) {
        bodyEl.innerHTML = `
          <form onsubmit="return window.CampusGo.saveAdminItem(event, 'lab', '${l.id}')">
            <div class="form-group">
              <label class="form-label">Laboratory Name</label>
              <input type="text" id="admin-field-name" required value="${escapeAttr(l.name)}" class="form-input form-input-full">
            </div>
            <div class="form-group">
              <label class="form-label">Building</label>
              <input type="text" id="admin-field-building" required value="${escapeAttr(l.building)}" class="form-input form-input-full">
            </div>
            <div class="form-group">
              <label class="form-label">Floor</label>
              <input type="text" id="admin-field-floor" required value="${escapeAttr(l.floor)}" class="form-input form-input-full">
            </div>
            <div class="form-group">
              <label class="form-label">Air Conditioned</label>
              <select id="admin-field-ac" class="form-select form-input-full">
                <option value="true" ${l.airConditioned ? "selected" : ""}>Yes (AC)</option>
                <option value="false" ${!l.airConditioned ? "selected" : ""}>No (Non-AC)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Direction</label>
              <input type="text" id="admin-field-direction" class="form-input form-input-full" value="${escapeAttr(l.direction || 'Upcoming')}" placeholder="e.g. Upcoming">
            </div>
            <div class="modal-footer" style="padding: 1rem 0 0; margin-top: 1rem;">
              <button type="button" class="btn btn-outline" onclick="window.CampusGo.closeModal('admin-form-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Update Laboratory</button>
            </div>
          </form>
        `;
      }
    } else if (type === "faculty") {
      const f = State.campusData.faculty.find(item => item.id === itemId);
      if (!f) return;
      if (titleEl) titleEl.textContent = `Edit Faculty: ${f.name}`;
      if (bodyEl) {
        bodyEl.innerHTML = `
          <form onsubmit="return window.CampusGo.saveAdminItem(event, 'faculty', '${f.id}')">
            <div class="form-group">
              <label class="form-label">Faculty Full Name</label>
              <input type="text" id="admin-field-name" required value="${escapeAttr(f.name)}" class="form-input form-input-full">
            </div>
            <div class="form-group">
              <label class="form-label">Building</label>
              <input type="text" id="admin-field-building" value="${escapeAttr(f.building)}" class="form-input form-input-full">
            </div>
            <div class="form-group">
              <label class="form-label">Floor</label>
              <input type="text" id="admin-field-floor" value="${escapeAttr(f.floor)}" class="form-input form-input-full">
            </div>
            <div class="form-group">
              <label class="form-label">Office Room</label>
              <input type="text" id="admin-field-office" value="${escapeAttr(f.office || f.room)}" class="form-input form-input-full">
            </div>
            <div class="modal-footer" style="padding: 1rem 0 0; margin-top: 1rem;">
              <button type="button" class="btn btn-outline" onclick="window.CampusGo.closeModal('admin-form-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Update Faculty</button>
            </div>
          </form>
        `;
      }
    } else if (type === "facility") {
      const fac = State.campusData.facilities.find(item => item.id === itemId);
      if (!fac) return;
      if (titleEl) titleEl.textContent = `Edit Facility: ${fac.name}`;
      if (bodyEl) {
        bodyEl.innerHTML = `
          <form onsubmit="return window.CampusGo.saveAdminItem(event, 'facility', '${fac.id}')">
            <div class="form-group">
              <label class="form-label">Facility Name</label>
              <input type="text" id="admin-field-name" required value="${escapeAttr(fac.name)}" class="form-input form-input-full">
            </div>
            <div class="form-group">
              <label class="form-label">Location / Building</label>
              <input type="text" id="admin-field-building" required value="${escapeAttr(fac.building)}" class="form-input form-input-full">
            </div>
            <div class="form-group">
              <label class="form-label">Floor</label>
              <input type="text" id="admin-field-floor" value="${escapeAttr(fac.floor || "")}" class="form-input form-input-full">
            </div>
            <div class="form-group">
              <label class="form-label">Direction</label>
              <input type="text" id="admin-field-direction" class="form-input form-input-full" value="${escapeAttr(fac.direction || 'Upcoming')}" placeholder="e.g. Upcoming">
            </div>
            <div class="modal-footer" style="padding: 1rem 0 0; margin-top: 1rem;">
              <button type="button" class="btn btn-outline" onclick="window.CampusGo.closeModal('admin-form-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Update Facility</button>
            </div>
          </form>
        `;
      }
    }

    openModal("admin-form-modal");
  }

  function saveAdminItem(e, type, existingId) {
    e.preventDefault();
    const name = document.getElementById("admin-field-name")?.value.trim();
    const building = document.getElementById("admin-field-building")?.value.trim();
    const floor = document.getElementById("admin-field-floor")?.value.trim();
    const directionVal = (document.getElementById("admin-field-direction")?.value || "").trim() || "Upcoming";

    if (!name) return false;

    if (type === "classroom") {
      const acVal = document.getElementById("admin-field-ac")?.value === "true";
      // Determine building from select if available
      const bCode = document.getElementById("admin-field-building-code")?.value || "BB";
      const bName = bCode === "MB" ? "Main Building (MB)" : "Bhanwan Building (BB)";

      if (existingId) {
        const item = State.campusData.classrooms.find(c => c.id === existingId);
        if (item) {
          item.name = name;
          item.building = building || item.building;
          item.floor = floor;
          item.airConditioned = acVal;
          item.direction = directionVal;
        }
      } else {
        State.campusData.classrooms.push({
          id: name,
          name: name,
          building: building || bName,
          buildingCode: bCode,
          floor: floor || "Ground Floor",
          type: "Lecture Hall",
          airConditioned: acVal,
          direction: directionVal,
          notes: "Classroom added via Admin panel."
        });
      }
    } else if (type === "lab") {
      const acVal = document.getElementById("admin-field-ac")?.value !== "false";
      const bCode = document.getElementById("admin-field-building-code")?.value || "BB";
      const bName = bCode === "MB" ? "Main Building (MB)" : "Bhanwan Building (BB)";

      if (existingId) {
        const item = State.campusData.labs.find(l => l.id === existingId);
        if (item) {
          item.name = name;
          item.building = building || item.building;
          item.buildingCode = item.building?.includes("Main") ? "MB" : "BB";
          item.floor = floor;
          item.airConditioned = acVal;
          item.direction = directionVal;
        }
      } else {
        State.campusData.labs.push({
          id: name,
          name: name,
          building: building || bName,
          buildingCode: bCode,
          floor: floor || "1st Floor",
          type: "Laboratory",
          airConditioned: acVal,
          direction: directionVal,
          notes: "Laboratory added via Admin panel."
        });
      }
    } else if (type === "faculty") {
      const office = document.getElementById("admin-field-office")?.value.trim() || "Information coming soon";
      if (existingId) {
        const item = State.campusData.faculty.find(f => f.id === existingId);
        if (item) {
          item.name = name;
          item.building = building;
          item.floor = floor;
          item.office = office;
          item.room = office;
        }
      } else {
        State.campusData.faculty.push({
          id: "FAC-" + Date.now(),
          name: name,
          building: building || "Information coming soon",
          floor: floor || "Information coming soon",
          office: office,
          room: office,
          notes: "Faculty profile added via Admin panel."
        });
      }
    } else if (type === "facility") {
      const desc = document.getElementById("admin-field-desc")?.value.trim() || "Campus facility";
      if (existingId) {
        const item = State.campusData.facilities.find(fac => fac.id === existingId);
        if (item) {
          item.name = name;
          item.building = building;
          item.floor = floor;
          item.direction = directionVal;
        }
      } else {
        State.campusData.facilities.push({
          id: "FACILITY-" + Date.now(),
          name: name,
          building: building || "Main Building (MB)",
          floor: floor || "Information coming soon",
          type: "Campus Facility",
          category: "Offices",
          direction: directionVal,
          description: desc
        });
      }
    }

    window.saveCampusData(State.campusData);
    closeModal("admin-form-modal");
    renderAdminTabContent();
    renderClassrooms();
    renderLabs();
    renderFaculty();
    renderFacilities();
    showToast(`${name} saved successfully.`);
    return false;
  }

  function adminDelete(type, itemId) {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    if (type === "classroom") {
      State.campusData.classrooms = State.campusData.classrooms.filter(c => c.id !== itemId);
    } else if (type === "lab") {
      State.campusData.labs = State.campusData.labs.filter(l => l.id !== itemId);
    } else if (type === "faculty") {
      State.campusData.faculty = State.campusData.faculty.filter(f => f.id !== itemId);
    } else if (type === "facility") {
      State.campusData.facilities = State.campusData.facilities.filter(fac => fac.id !== itemId);
    }

    window.saveCampusData(State.campusData);
    renderAdminTabContent();
    renderClassrooms();
    renderLabs();
    renderFaculty();
    renderFacilities();
    showToast(`Deleted ${itemId}.`);
  }

  function adminDeleteFreeRoom(subId) {
    State.campusData.freeRoomSubmissions = (State.campusData.freeRoomSubmissions || []).filter(s => s.id !== subId);
    window.saveCampusData(State.campusData);
    renderAdminTabContent();
    renderFreeRooms();
    showToast("Removed free room listing.");
  }

  function adminClearOccupiedReports() {
    (State.campusData.freeRoomSubmissions || []).forEach(s => {
      s.reportedOccupied = false;
      s.occupiedReportsCount = 0;
    });
    window.saveCampusData(State.campusData);
    renderAdminTabContent();
    renderFreeRooms();
    showToast("Cleared all occupied reports.");
  }

  function adminClearAppointments() {
    if (!confirm("Clear all appointment requests? This cannot be undone.")) return;
    try {
      localStorage.removeItem(window.STORAGE_KEYS?.APPOINTMENTS || "inside_indus_appointments");
    } catch (e) {}
    renderAdminTabContent();
    showToast("All appointment requests cleared.");
  }

  function resetAllData() {
    if (!confirm("Reset all campus data to Indus University official defaults? All manual test additions will be reverted.")) {
      return;
    }
    State.campusData = window.resetCampusDataToDefaults();
    renderAdminTabContent();
    renderClassrooms();
    renderLabs();
    renderFaculty();
    renderFacilities();
    renderFreeRooms();
    showToast("Reset all campus data to official defaults!");
  }

  /* ==========================================================================
     13. MODAL UTILITIES & TOASTS
     ========================================================================== */
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("open");
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("open");
    }
  }

  function showToast(message) {
    const toast = document.getElementById("global-toast");
    if (!toast) return;

    toast.textContent = message;
    toast.style.display = "block";

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.display = "none";
    }, 3200);
  }

  // HTML escaping helpers
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[m]);
  }

  function escapeAttr(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/["']/g, "");
  }

  /* ==========================================================================
     14. EXPOSE PUBLIC INTERFACE TO WINDOW
     ========================================================================== */
  window.CampusGo = {
    navigateTo,
    openDedicatedSearchView,
    executeSearch,
    saveRecentSearch,
    clearRecentSearches,
    selectBuilding,
    zoomIntoSelectedBuilding,
    closeBuildingCard,
    viewDetails,
    triggerNavigatePlaceholder,
    openFloorExplorer,
    selectFloorTab,
    toggleFavorite,
    openSubmitFreeRoomModal,
    handleFreeRoomSubmit,
    filterRoomSelector,
    updateFloorOptions,
    updateClassroomOptions,
    reportOccupied,
    openAppointmentModal,
    handleAppointmentSubmit,
    openModal,
    closeModal,
    showToast,
    renderClassrooms,
    renderLabs,
    renderFaculty,
    renderFacilities,
    renderFreeRooms,
    switchAdminTab,
    openAdminAddModal,
    openAdminEditModal,
    saveAdminItem,
    adminDelete,
    adminDeleteFreeRoom,
    adminClearOccupiedReports,
    adminClearAppointments,
    resetAllData,
    initTheme,
    applyTheme,
    toggleTheme,
    getTheme: () => State.currentTheme,
    getKarmaPoints: getStudentKarma,
    updateKarmaDisplay
  };

  // Launch application on DOM load
  document.addEventListener("DOMContentLoaded", initApp);
})();
