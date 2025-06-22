/*
================================================================================
  For Baby Chix :: main.js
  Final Implementation: The Brain (Definitive & Debugged)
  CTO: Final, production-ready script. All bugs addressed, all features implemented.
  Creative Director: The choreography for our entire interactive experience.
  Senior Engineer: Robust, efficient, and meticulously commented application logic.
================================================================================
*/

// --- Wait for the entire page to be ready before running our script ---
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Element Selectors: Getting references to all our HTML pieces ---
  const mainHeader = document.querySelector(".main-header"); // ADDED: Selector for the main header
  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll(".nav-link");
  const themeToggleButton = document.getElementById("theme-toggle");
  const musicToggleButton = document.getElementById("music-toggle");
  const backgroundAudio = document.getElementById("background-audio");

  const cinematicOverlay = document.getElementById("cinematic-overlay");
  const reminderModal = document.getElementById("reminder-modal");
  const reminderModalContent = document.getElementById(
    "reminder-modal-content",
  );

  const todaysCardContainer = document.getElementById("todays-card");
  const remindersCollectionContainer = document.getElementById(
    "reminders-collection",
  );

  const poemsListContainer = document.getElementById("poems-list");
  const addPoemButton = document.getElementById("add-poem-button");
  const poemEditorModal = document.getElementById("poem-editor-modal");
  const closeEditorButton = document.getElementById("close-editor-button");
  const poemEditorForm = document.getElementById("poem-editor-form");

  const searchInput = document.getElementById("search-input");
  const searchResultsContainer = document.getElementById(
    "search-results-container",
  );

  // Calendar navigation elements
  const calendarNav = document.getElementById("calendar-nav");
  const calendarToggle = document.getElementById("calendar-toggle");
  const prevYearBtn = document.getElementById("prev-year");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");
  const nextYearBtn = document.getElementById("next-year");
  const monthDisplay = document.getElementById("current-month");
  const monthGrid = document.querySelector(".month-grid");

  // --- 2. State Management: A simple object to hold our application's state ---
  const AppState = {
    currentPoemData: [],
    searchIndex: [],
    remindersByMonth: {},
    intersectionObserver: null,
    currentCalendarDate: dayjs(), // Track the currently viewed month in calendar
  };

  // ==========================================================================
  // --- SECTION: Core Application Initialization ---
  // ==========================================================================

  function init() {
    console.log("Initializing Project: For Baby Chix (Final Build)...");
    setupEventListeners();
    initTheme();
    initMusic();
    loadAndRenderPoems();
    buildSearchIndex();
    groupRemindersByMonth();
    renderTodaysCard();
    setupIntersectionObserver();
    initCinematicIntro();
    initCalendarNavigation(); // Initialize calendar
    console.log("Initialization Complete. All systems operational.");
  }

  function setupEventListeners() {
    navLinks.forEach((link) => link.addEventListener("click", handleNavClick));
    themeToggleButton.addEventListener("click", toggleTheme);
    musicToggleButton.addEventListener("click", toggleMusic);
    reminderModal.addEventListener("click", (e) =>
      closeModalOnClick(e, reminderModal),
    );
    addPoemButton.addEventListener("click", openPoemEditor);
    closeEditorButton.addEventListener("click", closePoemEditor);
    poemEditorModal.addEventListener("click", (e) =>
      closeModalOnClick(e, poemEditorModal),
    );
    poemEditorForm.addEventListener("submit", handlePoemSubmit);
    searchInput.addEventListener("input", handleSearch);
    searchInput.addEventListener("focus", handleSearch);
    document.addEventListener("click", (e) => {
      if (
        !searchResultsContainer.contains(e.target) &&
        e.target !== searchInput
      ) {
        searchResultsContainer.innerHTML = "";
      }
    });

    // Calendar navigation event listeners
    calendarToggle.addEventListener("click", toggleCalendar);
    prevYearBtn?.addEventListener("click", () => navigateCalendar("prevYear"));
    prevMonthBtn?.addEventListener("click", () =>
      navigateCalendar("prevMonth"),
    );
    nextMonthBtn?.addEventListener("click", () =>
      navigateCalendar("nextMonth"),
    );
    nextYearBtn?.addEventListener("click", () => navigateCalendar("nextYear"));
  }

  // ==========================================================================
  // --- SECTION: Cinematic Intro ---
  // ==========================================================================

  function initCinematicIntro() {
    if (sessionStorage.getItem("introShown")) {
      cinematicOverlay.classList.add("hidden");
      showPage("page-home");
      return;
    }

    // Show the overlay properly
    cinematicOverlay.classList.remove("hidden");

    setTimeout(() => {
      cinematicOverlay.classList.add("reveal");
    }, 500);

    setTimeout(() => {
      cinematicOverlay.classList.add("hidden");
      showPage("page-home");
      sessionStorage.setItem("introShown", "true");
    }, 4000);
  }

  // ==========================================================================
  // --- SECTION: Page Navigation ---
  // ==========================================================================

  function showPage(pageId) {
    pages.forEach((page) =>
      page.classList.toggle("active", page.id === pageId),
    );
    navLinks.forEach((link) => {
      const linkPageId = link.getAttribute("onclick").match(/'([^']+)'/)[1];
      link.classList.toggle("active", linkPageId === pageId);
    });

    // Show calendar toggle button only on the reminders page
    calendarToggle.classList.toggle("hidden", pageId !== "page-reminders");

    // Hide calendar if user navigates away
    if (pageId !== "page-reminders") {
      calendarNav.classList.remove("visible");
    }

    if (pageId === "page-reminders") {
      document
        .querySelectorAll(".month-section")
        .forEach((el) => AppState.intersectionObserver.observe(el));
    }
  }

  function handleNavClick(event) {
    const pageId = event.currentTarget
      .getAttribute("onclick")
      .match(/'([^']+)'/)[1];
    showPage(pageId);
  }

  // ==========================================================================
  // --- SECTION: Theming & Music ---
  // ==========================================================================

  function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }

  function toggleTheme() {
    const newTheme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  function initMusic() {
    backgroundAudio.volume = 0.3;
  }

  function toggleMusic() {
    if (backgroundAudio.paused) {
      backgroundAudio
        .play()
        .catch((e) => console.error("Audio playback failed:", e));
      musicToggleButton.classList.add("playing");
    } else {
      backgroundAudio.pause();
      musicToggleButton.classList.remove("playing");
    }
  }

  // ==========================================================================
  // --- SECTION: Search Functionality ---
  // ==========================================================================

  function buildSearchIndex() {
    const reminderIndex = remindersData.map((item) => ({
      id: item.id,
      type: "reminder",
      title: `${item.month} ${dayjs(item.date).format("D")}`,
      content: `${item.heart_message} ${item.wellbeing_ps}`.toLowerCase(),
    }));

    const poemIndex = AppState.currentPoemData.map((item) => ({
      id: item.id,
      type: "poem",
      title: item.title,
      content: item.poemLines.join(" ").toLowerCase(),
    }));

    AppState.searchIndex = [...reminderIndex, ...poemIndex];
  }

  function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    if (query.length < 2) {
      searchResultsContainer.innerHTML = "";
      return;
    }

    const results = AppState.searchIndex.filter((item) =>
      item.content.includes(query),
    );

    let resultsHTML = "";
    if (results.length === 0) {
      resultsHTML = `<div class="no-results">No matching memories or poems found</div>`;
    } else {
      results.slice(0, 10).forEach((result) => {
        const previewContent = getSearchResultPreview(result.content, query);
        resultsHTML += `
                  <div class="search-result-item" data-id="${result.id}" data-type="${result.type}">
                      <h4>${result.title}</h4>
                      <p>${previewContent}</p>
                  </div>`;
      });
    }

    searchResultsContainer.innerHTML = resultsHTML;
    searchResultsContainer.classList.add("visible");

    document.querySelectorAll(".search-result-item").forEach((item) => {
      item.addEventListener("click", handleSearchResultClick);
    });
  }

  function getSearchResultPreview(content, query) {
    const index = content.indexOf(query);
    const start = Math.max(0, index - 30);
    const end = Math.min(content.length, index + query.length + 30);
    let snippet = content.substring(start, end);

    if (start > 0) snippet = "..." + snippet;
    if (end < content.length) snippet += "...";

    const regex = new RegExp(
      query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
      "gi",
    );
    return snippet.replace(regex, `<mark>${query}</mark>`);
  }

  function handleSearchResultClick(event) {
    const item = event.currentTarget;
    const id = item.dataset.id;
    const type = item.dataset.type;

    if (type === "reminder") {
      const reminder = remindersData.find((r) => r.id == id);
      if (reminder) openReminderModal(reminder);
    } else if (type === "poem") {
      showPage("page-notebook");
      const poemCard = document.getElementById(id);
      if (poemCard) {
        poemCard.scrollIntoView({ behavior: "smooth", block: "center" });
        poemCard.classList.add("highlight");
        setTimeout(() => poemCard.classList.remove("highlight"), 2000);
      }
    }
    searchInput.value = "";
    searchResultsContainer.innerHTML = "";
    searchResultsContainer.classList.remove("visible");
  }

  // ==========================================================================
  // --- SECTION: Reminder Rendering & Interaction ---
  // ==========================================================================

  function groupRemindersByMonth() {
    AppState.remindersByMonth = remindersData.reduce((acc, reminder) => {
      const month = reminder.month;
      if (!acc[month]) acc[month] = [];
      acc[month].push(reminder);
      return acc;
    }, {});
  }

  function renderTodaysCard() {
    const today = dayjs();
    const todayFormatted = today.format("YYYY-MM-DD");

    // Find today's reminder (match by date regardless of year)
    const todaysReminder = remindersData.find((r) => {
      const reminderDate = dayjs(r.date).format("MM-DD");
      return today.format("MM-DD") === reminderDate;
    });

    if (!todaysCardContainer) return;

    if (todaysReminder) {
      const displayDate = dayjs(todaysReminder.date).format("MMMM D");

      todaysCardContainer.innerHTML = `
            <div class="todays-card">
                <div class="card-badge">★ Today's Note ★</div>
                <h3>${displayDate}</h3>
                <p class="heart-message">"${todaysReminder.heart_message}"</p>
                <p class="wellbeing-ps">${todaysReminder.wellbeing_ps}</p>
            </div>
        `;

      todaysCardContainer.addEventListener("click", () =>
        openReminderModal(todaysReminder),
      );
    } else {
      const displayDate = today.format("MMMM D");

      todaysCardContainer.innerHTML = `
            <div class="todays-card">
                <h3>${displayDate}</h3>
                <p class="heart-message">No special note for today, but remember:</p>
                <p class="wellbeing-ps">You're loved every day of the year ❤️</p>
            </div>
        `;
    }
  }

  function setupIntersectionObserver() {
    let placeholdersHTML = "";
    for (const month in AppState.remindersByMonth) {
      placeholdersHTML += `<section class="month-section" id="month-section-${month}"></section>`;
    }
    remindersCollectionContainer.innerHTML = placeholdersHTML;

    const options = {
      root: null,
      rootMargin: "0px 0px 200px 0px",
      threshold: 0.01,
    };
    AppState.intersectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const month = entry.target.id.replace("month-section-", "");
            renderMonth(month, entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      options,
    );
  }

  function renderMonth(month, container) {
    if (!container || container.dataset.rendered) return;

    const monthReminders = AppState.remindersByMonth[month];
    if (!monthReminders) return;

    const monthTheme = monthReminders[0].theme;
    const monthColor = getComputedStyle(
      document.documentElement,
    ).getPropertyValue(`--color-${month.toLowerCase().trim()}`);

    let gridHTML = `<div class="reminders-grid">`;
    monthReminders.forEach(
      (reminder) => (gridHTML += createReminderCardHTML(reminder)),
    );
    gridHTML += `</div>`;

    container.innerHTML = `<h3 class="month-title" style="border-color: ${monthColor};"><span style="color: ${monthColor};">${month}</span><span class="month-theme">- ${monthTheme}</span></h3>${gridHTML}`;
    container.classList.add("visible");
    container.dataset.rendered = true;

    container.querySelectorAll(".reminder-card").forEach((card, index) => {
      card.addEventListener("click", () =>
        openReminderModal(monthReminders[index]),
      );
    });
  }

  function createReminderCardHTML(reminder, isToday = false) {
    const monthColor = getComputedStyle(
      document.documentElement,
    ).getPropertyValue(`--color-${reminder.month.toLowerCase().trim()}`);
    const cardTitle = `${reminder.month} ${dayjs(reminder.date).format("D")}`;
    return `
            <div class="reminder-card ${isToday ? "today-card" : ""}" style="--theme-color: ${monthColor}; --glow-color: ${monthColor};">
                <h3>${cardTitle}</h3>
                <p class="heart-message">“${reminder.heart_message}”</p>
                <p class="wellbeing-ps">${reminder.wellbeing_ps}</p>
            </div>`;
  }

  function openReminderModal(reminder) {
    const monthColor = getComputedStyle(
      document.documentElement,
    ).getPropertyValue(`--color-${reminder.month.toLowerCase().trim()}`);
    reminderModalContent.innerHTML = `
            <button class="close-button">×</button>
            <h3 style="color: ${monthColor};">${reminder.month} ${dayjs(reminder.date).format("D")}</h3>
            <p class="heart-message">“${reminder.heart_message}”</p>
            <p class="wellbeing-ps" style="color: ${monthColor};">${reminder.wellbeing_ps}</p>`;

    reminderModalContent
      .querySelector(".close-button")
      .addEventListener("click", () =>
        reminderModal.classList.remove("active"),
      );
    reminderModal.classList.add("active");
  }

  function closeModalOnClick(event, modalElement) {
    if (event.target === modalElement) {
      modalElement.classList.remove("active");
    }
  }

  // ==========================================================================
  // --- SECTION: Poem Editor & localStorage Persistence ---
  // ==========================================================================

  function loadAndRenderPoems() {
    try {
      const storedPoems = localStorage.getItem("userPoems");
      AppState.currentPoemData = storedPoems
        ? [...poemsData, ...JSON.parse(storedPoems)]
        : [...poemsData];
    } catch (error) {
      console.error("Could not load poems from localStorage:", error);
      AppState.currentPoemData = [...poemsData];
    }

    poemsListContainer.innerHTML = "";
    if (AppState.currentPoemData.length === 0) {
      poemsListContainer.innerHTML = `<p style="text-align: center;">Your notebook is empty. Add your first poem to begin.</p>`;
      return;
    }

    AppState.currentPoemData
      .sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished))
      .forEach((poem) => {
        const poemCard = document.createElement("div");
        poemCard.className = "poem-card";
        poemCard.id = poem.id;
        poemCard.innerHTML = `
          <div class="poem-header">
            <h2>${poem.title}</h2>
            <div class="poem-actions">
              <button class="edit-poem" data-id="${poem.id}">Edit</button>
              <button class="delete-poem" data-id="${poem.id}">Delete</button>
            </div>
          </div>
          <p class="date-published">Published on ${dayjs(poem.datePublished).format("MMMM D, YYYY")}</p>
          <div class="poem-lines">${poem.poemLines.map((line) => `<p>${line || " "}</p>`).join("")}</div>
        `;
        poemsListContainer.appendChild(poemCard);
      });

    // Add event listeners for edit/delete buttons
    document.querySelectorAll(".edit-poem").forEach((button) => {
      button.addEventListener("click", (e) => {
        const poemId = e.target.dataset.id;
        openPoemEditorForEdit(poemId);
      });
    });

    document.querySelectorAll(".delete-poem").forEach((button) => {
      button.addEventListener("click", (e) => {
        const poemId = e.target.dataset.id;
        deletePoem(poemId);
      });
    });
  }

  function saveUserPoemsToStorage() {
    const userPoems = AppState.currentPoemData.filter((p) =>
      p.id.startsWith("user-poem-"),
    );
    localStorage.setItem("userPoems", JSON.stringify(userPoems));
  }

  function openPoemEditor() {
    poemEditorForm.reset();
    document.getElementById("poem-date").value = dayjs().format("YYYY-MM-DD");
    poemEditorForm.dataset.editingId = "";
    poemEditorModal.classList.add("active");
  }

  function openPoemEditorForEdit(poemId) {
    const poem = AppState.currentPoemData.find((p) => p.id === poemId);
    if (!poem) return;

    document.getElementById("poem-title").value = poem.title;
    document.getElementById("poem-date").value = dayjs(
      poem.datePublished,
    ).format("YYYY-MM-DD");
    document.getElementById("poem-lines").value = poem.poemLines.join("\n");

    // Store the poem ID for updating
    poemEditorForm.dataset.editingId = poemId;

    poemEditorModal.classList.add("active");
  }

  function closePoemEditor() {
    poemEditorModal.classList.remove("active");
  }

  function deletePoem(poemId) {
    if (
      confirm(
        "Are you sure you want to delete this poem? This cannot be undone.",
      )
    ) {
      AppState.currentPoemData = AppState.currentPoemData.filter(
        (p) => p.id !== poemId,
      );
      saveUserPoemsToStorage();
      loadAndRenderPoems();
      buildSearchIndex();
    }
  }

  function handlePoemSubmit(event) {
    event.preventDefault();
    const newPoem = {
      id: poemEditorForm.dataset.editingId || `user-poem-${Date.now()}`,
      title: document.getElementById("poem-title").value.trim(),
      datePublished: document.getElementById("poem-date").value,
      poemLines: document.getElementById("poem-lines").value.trim().split("\n"),
    };

    if (poemEditorForm.dataset.editingId) {
      // Update existing poem
      const index = AppState.currentPoemData.findIndex(
        (p) => p.id === poemEditorForm.dataset.editingId,
      );
      if (index !== -1) {
        AppState.currentPoemData[index] = newPoem;
      }
      delete poemEditorForm.dataset.editingId;
    } else {
      // Add new poem
      AppState.currentPoemData.push(newPoem);
    }

    saveUserPoemsToStorage();
    loadAndRenderPoems();
    buildSearchIndex();
    closePoemEditor();
  }

  // ==========================================================================
  // --- SECTION: Calendar Toggle (MODIFIED) ---
  // ==========================================================================

  function toggleCalendar() {
    // If the calendar is about to be shown...
    if (!calendarNav.classList.contains("visible")) {
      // Get the exact, current height of the header
      const headerHeight = mainHeader.offsetHeight;

      // Dynamically set the calendar's top position to be just below the header
      calendarNav.style.top = `${headerHeight}px`;

      // Also dynamically set the max-height to prevent it from going off-screen
      // The '20px' provides a small, comfortable buffer from the bottom edge
      calendarNav.style.maxHeight = `calc(100vh - ${headerHeight}px - 20px)`;
    }
    // Toggle the visibility class to trigger the CSS animation
    calendarNav.classList.toggle("visible");
  }

  // ==========================================================================
  // --- SECTION: Calendar Navigation ---
  // ==========================================================================

  function initCalendarNavigation() {
    if (!monthDisplay) return;

    // Initialize calendar with current month
    renderCalendar();
  }

  function navigateCalendar(direction) {
    switch (direction) {
      case "prevYear":
        AppState.currentCalendarDate = AppState.currentCalendarDate.subtract(
          1,
          "year",
        );
        break;
      case "prevMonth":
        AppState.currentCalendarDate = AppState.currentCalendarDate.subtract(
          1,
          "month",
        );
        break;
      case "nextMonth":
        AppState.currentCalendarDate = AppState.currentCalendarDate.add(
          1,
          "month",
        );
        break;
      case "nextYear":
        AppState.currentCalendarDate = AppState.currentCalendarDate.add(
          1,
          "year",
        );
        break;
    }
    renderCalendar();
  }

  function renderCalendar() {
    const monthStart = AppState.currentCalendarDate.startOf("month");
    const daysInMonth = AppState.currentCalendarDate.daysInMonth();
    const startDayOfWeek = monthStart.day();

    // Update month/year display
    monthDisplay.textContent = AppState.currentCalendarDate.format("MMMM YYYY");

    // Clear existing days (keep the weekday headers)
    while (monthGrid.children.length > 7) {
      monthGrid.removeChild(monthGrid.lastChild);
    }

    // Add empty cells for days before the first
    for (let i = 0; i < startDayOfWeek; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "empty";
      monthGrid.appendChild(emptyCell);
    }

    // Add days of the month
    const today = dayjs();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement("div");
      dayCell.className = "day";
      dayCell.textContent = day;

      // Check if today
      if (
        AppState.currentCalendarDate.year() === today.year() &&
        AppState.currentCalendarDate.month() === today.month() &&
        day === today.date()
      ) {
        dayCell.classList.add("today");
      }

      // Check if this day has a reminder
      const monthName = AppState.currentCalendarDate.format("MMMM");
      const hasReminder = remindersData.some(
        (r) =>
          r.month === monthName && parseInt(dayjs(r.date).format("D")) === day,
      );

      if (hasReminder) {
        dayCell.classList.add("has-note");
      }

      // Add click handler
      dayCell.addEventListener("click", () => {
        const reminder = remindersData.find(
          (r) =>
            r.month === monthName &&
            parseInt(dayjs(r.date).format("D")) === day,
        );

        if (reminder) {
          openReminderModal(reminder);
        }
      });

      monthGrid.appendChild(dayCell);
    }
  }

  // --- Kick everything off ---
  init();
});
