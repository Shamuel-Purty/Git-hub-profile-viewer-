const recentBox = document.getElementById("recent-searches");
const loader = document.getElementById("loader");

// DARK MODE TOGGLE
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

//MAIN SEARCH FUNCTION
async function searchUser() {
  const username = document.getElementById("username").value.trim();
  if (!username) return alert("Enter username!");

  loader.classList.remove("hidden");

  const profileUrl = `https://api.github.com/users/${username}`;
  const reposUrl = `https://api.github.com/users/${username}/repos`;

  try {
    const profileRes = await fetch(profileUrl);
    const profileData = await profileRes.json();

    if (profileData.message === "Not Found") {
      document.getElementById("user-info").innerHTML = "<p>User not found.</p>";
      document.getElementById("repos").innerHTML = "";
      loader.classList.add("hidden");
      return;
    }

    // Show Profile
    document.getElementById("user-info").innerHTML = `
      <img src="${profileData.avatar_url}" width="100" />
      <h2>${profileData.name || profileData.login}</h2>
      <p>${profileData.bio || "No bio"}</p>
      <p>📦 Repos: ${profileData.public_repos} | ⭐ Followers: ${profileData.followers} | 👥 Following: ${profileData.following}</p>
      <a href="${profileData.html_url}" target="_blank">View Profile</a>
    `;

    //Show Repos
    const reposRes = await fetch(reposUrl);
    const reposData = await reposRes.json();

    let repoHTML = "<h3>Recent Repositories</h3>";
    reposData.slice(0, 5).forEach(repo => {
      repoHTML += `
        <div class="repo">
          <a href="${repo.html_url}" target="_blank"><strong>${repo.name}</strong></a>
          <p>${repo.description || "No description"}</p>
          <p> ${repo.stargazers_count} | ${repo.language || "N/A"}</p>
        </div>
      `;
    });
    document.getElementById("repos").innerHTML = repoHTML;

    // Save to LocalStorage
    updateRecent(username);

  } catch (err) {
    document.getElementById("user-info").innerHTML = "<p>Error fetching user.</p>";
    console.error(err);
  }

  loader.classList.add("hidden");
}
E
// RECENT SEARCHES
function updateRecent(username) {
  let recent = JSON.parse(localStorage.getItem("recentUsers")) || [];

  // Prevent duplicates
  recent = recent.filter(u => u !== username);
  recent.unshift(username);
  if (recent.length > 5) recent.pop();

  localStorage.setItem("recentUsers", JSON.stringify(recent));
  renderRecent();
}

function renderRecent() {
  const recent = JSON.parse(localStorage.getItem("recentUsers")) || [];
  if (recent.length === 0) {
    recentBox.innerHTML = "";
    return;
  }

  recentBox.innerHTML = "<h3>Recent Searches</h3>";

  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexWrap = "wrap";
  wrapper.style.gap = "0.5rem";
  wrapper.style.justifyContent = "center";

  recent.forEach((u, index) => {
    const pill = document.createElement("div");
    pill.className = "recent-pill";

    const nameBtn = document.createElement("span");
    nameBtn.textContent = u;
    nameBtn.onclick = () => fillSearch(u);

    const closeBtn = document.createElement("span");
    closeBtn.textContent = "❌";
    closeBtn.className = "close-btn";
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      deleteRecent(index);
    };

    pill.appendChild(nameBtn);
    pill.appendChild(closeBtn);
    wrapper.appendChild(pill);
  });

  recentBox.appendChild(wrapper);
}

function deleteRecent(index) {
  let recent = JSON.parse(localStorage.getItem("recentUsers")) || [];
  recent.splice(index, 1); // remove that item
  localStorage.setItem("recentUsers", JSON.stringify(recent));
  renderRecent(); // re-render
}


function fillSearch(username) {
  document.getElementById("username").value = username;
  searchUser();
}

function clearRecent() {
  localStorage.removeItem("recentUsers");
  renderRecent();
}

// Load recent on page load
renderRecent();
