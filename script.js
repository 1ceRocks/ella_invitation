const $ = (id) => document.getElementById(id);
const week = [{d:"Wed",n:16},{d:"Thu",n:17},{d:"Fri",n:18},{d:"Sat",n:19},{d:"Sun",n:20}];
const customDateCard = `
  <div class="day day--custom">
    <input id="dCustomDate" type="radio" name="date" value="Custom date" />
    <label for="dCustomDate">
      <span class="day-name">🎉</span>
      <span class="day-number">Custom</span>
      <small>your date ✨</small>
    </label>
  </div>
`;
$("weekCalendar").innerHTML = [...week.map((x) => `
  <div class="day">
    <input id="d${x.n}" type="radio" name="date" value="September ${x.n}, 2026" />
    <label for="d${x.n}">
      <span class="day-name">${x.d}</span>
      <span class="day-number">${x.n}</span>
      <small>free?</small>
    </label>
  </div>
`), customDateCard].join("");

const optionSets = {
  timeChoices: ["⏰ 10:00 AM","⏰ 11:00 AM","⏰ 12:00 PM","⏰ 1:00 PM","⏰ 2:00 PM","⏰ 3:00 PM","✨ Custom time range","💖 I'll decide"],
  activityChoices: ["🎳 Darts / Bowling / Billiards","☕ Chill (Coffee)","🛍️ Mall Date (Shopping + Arcade)","✨ Custom activity","💖 I'll decide"],
  foodChoices: ["🍝 Pasta","🍕 Pizza","🍔 Burgers and Fries","🍣 Japanese Food","🥟 Chinese Food","🥘 Korean Food","🍛 Filipino Favorites","🍽️ Custom food","💖 I'll decide"],
  locationChoices: ["🌄 Tagaytay","🏙️ North (Manila)","🏠 Around your area in Biñan, Laguna","🌿 South of Laguna","📍 Custom location","💖 I'll decide"]
};

Object.entries(optionSets).forEach(([groupId, values]) => {
  $(groupId).innerHTML = values.map((value) => `
    <label class="choice">
      <input type="radio" name="${groupId}" value="${value}" />
      <span>${value}</span>
    </label>
  `).join("");
});

function selected(groupName) {
  return document.querySelector(`input[name="${groupName}"]:checked`)?.value || "";
}

function getValueFromCustom(groupName, customInputId, customTrigger) {
  const value = selected(groupName);
  if (value === customTrigger) {
    return $(customInputId).value.trim() || "Custom (not specified yet)";
  }
  return value || "Not specified";
}

function showCustom(groupName, wrapperId, triggerValue) {
  const wrapper = $(wrapperId);
  const isVisible = selected(groupName) === triggerValue;
  wrapper.classList.toggle("hidden", !isVisible);
}

function getDateValue() {
  const value = selected("date");
  if (value === "Custom date") {
    const customDate = $("customDate").value;
    if (!customDate) return "Custom date (not specified yet)";
    const formatted = new Date(customDate + "T00:00:00");
    return formatted.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  if (value === "Not available") {
    return "Not available for this one 😅";
  }
  return value || "Not specified";
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("is-active", screen.id === id);
  });
  $("plannerWindow").scrollIntoView({ behavior: "smooth", block: "start" });
}

function showNotice(title, message) {
  const modal = $("noticeModal");
  $("noticeTitle").textContent = title;
  $("noticeMessage").textContent = message;
  modal.classList.remove("hidden");
}

function closeNotice() {
  $("noticeModal").classList.add("hidden");
}

$("noticeCloseBtn").addEventListener("click", closeNotice);
$("noticeModal").addEventListener("click", (event) => {
  if (event.target === $("noticeModal")) closeNotice();
});

document.addEventListener("change", (event) => {
  if (!event.target.matches("input[type=radio]")) return;

  const { name } = event.target;
  if (name === "date") {
    const isCustom = selected("date") === "Custom date";
    $("customDateWrap").classList.toggle("hidden", !isCustom);
  }
  if (name === "timeChoices") showCustom("timeChoices", "customTimeWrap", "✨ Custom time range");
  if (name === "activityChoices") showCustom("activityChoices", "customActivityWrap", "✨ Custom activity");
  if (name === "foodChoices") showCustom("foodChoices", "customFoodWrap", "🍽️ Custom food");
  if (name === "locationChoices") showCustom("locationChoices", "customLocationWrap", "📍 Custom location");
});

$("openPlannerBtn").addEventListener("click", () => {
  $("plannerWindow").classList.add("is-open");
  showScreen("datePanel");
});

$("closePlannerBtn").addEventListener("click", () => {
  $("plannerWindow").classList.remove("is-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$("continueBtn").addEventListener("click", () => {
  const date = selected("date");
  if (!date) {
    showNotice("Pick a date, love 🥺", "We need one cute option before we plan your birthday date.");
    return;
  }
  if (date === "Custom date") {
    const customDate = $("customDate").value;
    if (!customDate) {
      showNotice("Pick your custom date", "Choose a date from the calendar so we can plan around it.");
      return;
    }
  }
  if (date === "Not available") {
    buildReview(true, "notAvailable");
    showScreen("reviewPanel");
    return;
  }
  if (date === "I'll decide") {
    buildReview(true, "decideAll");
    showScreen("reviewPanel");
    return;
  }
  showScreen("timePanel");
});

$("backToDateBtn").addEventListener("click", () => showScreen("datePanel"));
$("toActivityBtn").addEventListener("click", () => {
  if (!selected("timeChoices")) {
    showNotice("Time first, love", "Pick a time before we move on to the fun part.");
    return;
  }
  showScreen("activityPanel");
});
$("backToTimeBtn").addEventListener("click", () => showScreen("timePanel"));
$("toFoodBtn").addEventListener("click", () => {
  if (!selected("activityChoices")) {
    showNotice("Activity first, babe", "We still need the vibe before we decide what to eat.");
    return;
  }
  showScreen("foodPanel");
});
$("backToActivityBtn").addEventListener("click", () => showScreen("activityPanel"));
$("toLocationBtn").addEventListener("click", () => {
  if (!selected("foodChoices")) {
    showNotice("Food first, pretty girl", "You can’t skip dinner in this plan 😌");
    return;
  }
  showScreen("locationPanel");
});
$("backToFoodBtn").addEventListener("click", () => showScreen("foodPanel"));
$("reviewBtn").addEventListener("click", () => {
  buildReview(false);
  showScreen("reviewPanel");
});
$("editBtn").addEventListener("click", () => showScreen("timePanel"));

function buildReview(decideAll, mode = "normal") {
  const date = selected("date");
  const items = decideAll
    ? mode === "notAvailable"
      ? [
          ["Date", "Not available for this one 😅"],
          ["Status", "Let’s reschedule soon 💜"],
          ["Note", "A little rain check, but still a cute date in the making."]
        ]
      : [
          ["Date", "Ced decides the entire date ✨"],
          ["Birthday note", "Your 23rd birthday treat 🎂"]
        ]
    : [
        ["Date", getDateValue()],
        ["Time", getValueFromCustom("timeChoices", "customTime", "✨ Custom time range")],
        ["Activity", getValueFromCustom("activityChoices", "customActivity", "✨ Custom activity")],
        ["Food", getValueFromCustom("foodChoices", "customFood", "🍽️ Custom food")],
        ["Where", getValueFromCustom("locationChoices", "customLocation", "📍 Custom location")]
      ];

  $("review").innerHTML = items.map(([label, value]) => `<div class="review-item"><b>${label}</b>${value}</div>`).join("");
}

function getSavedPlan() {
  try {
    return JSON.parse(localStorage.getItem("ellaBirthdayPlan") || "null");
  } catch (error) {
    return null;
  }
}

function savePlanLocally() {
  const plan = {
    savedAt: new Date().toISOString(),
    date: getDateValue(),
    time: getValueFromCustom("timeChoices", "customTime", "✨ Custom time range"),
    activity: getValueFromCustom("activityChoices", "customActivity", "✨ Custom activity"),
    food: getValueFromCustom("foodChoices", "customFood", "🍽️ Custom food"),
    where: getValueFromCustom("locationChoices", "customLocation", "📍 Custom location"),
    mode: selected("date") === "Not available" ? "notAvailable" : selected("date") === "I'll decide" ? "decideAll" : "normal"
  };

  localStorage.setItem("ellaBirthdayPlan", JSON.stringify(plan));
  return plan;
}

$("sendBtn").addEventListener("click", () => {
  const plan = savePlanLocally();
  const saved = getSavedPlan();
  console.log("Saved birthday pick", saved || plan);
  showNotice("Saved locally 💾", "Your plan is saved in this browser so you can check it later.");
});

const themeToggle = $("themeToggle");
function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light-theme", isLight);
  themeToggle.textContent = isLight ? "☀️ Light" : "🌙 Dark";
  themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
  localStorage.setItem("ellaTheme", theme);
}

const savedTheme = localStorage.getItem("ellaTheme") || "dark";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
  applyTheme(nextTheme);
});
