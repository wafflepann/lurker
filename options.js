document.getElementById("connectTwitch").onclick = () => {
  const clientId = "k94k8emoeags4qs8ln9oas608dmu93";
  const redirectUri = "https://wafflepann.github.io/lurker/auth.html";
  const scopes = "user:read:follows"; // No scopes needed for stream status

  const url = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token&scope=${scopes}`;
  window.open(url, "_blank");
};

// NEW: Listen for postMessage from GitHub Pages OAuth redirect
window.addEventListener("message", (event) => {
  if (event?.data?.type === "TWITCH_TOKEN" && event.data.token) {
    chrome.storage.local.set({ twitchToken: event.data.token });
  }
});

document.getElementById("addChannel").onclick = async () => {
  const input = document.getElementById("channelInput");
  const newChannel = input.value.trim().toLowerCase();
  if (!newChannel) return;

  const { channels = [] } = await chrome.storage.local.get("channels");
  if (!channels.includes(newChannel)) {
    channels.push(newChannel);
    await chrome.storage.local.set({ channels });
    renderList(channels);
  }

  input.value = "";
};

async function renderList(channels) {
  const list = document.getElementById("channelList");
  list.innerHTML = "";
  channels.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    list.appendChild(li);
  });
}

chrome.storage.local.get("channels").then(({ channels = [] }) => {
  renderList(channels);
});
