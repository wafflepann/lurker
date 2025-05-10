const params = new URLSearchParams(window.location.hash.slice(1));
const token = params.get("access_token");

if (token) {
  chrome.runtime.sendMessage({ type: "TWITCH_TOKEN", token });
}
