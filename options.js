document.getElementById("connectTwitch").onclick = () => {
  const clientId = "YOUR_CLIENT_ID";
  const redirectUri = "https://wafflepann.github.io/lurker/auth.html";
  const scopes = "user:read:follows";

  const url = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token&scope=${scopes}`;
  window.open(url, "_blank");
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "TWITCH_TOKEN") {
    chrome.storage.local.set({ twitchToken: message.token });
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
