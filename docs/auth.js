const params = new URLSearchParams(window.location.hash.slice(1));
const token = params.get("access_token");

if (token) {
  // Send token to the extension's window
  window.opener?.postMessage({ type: "TWITCH_TOKEN", token }, "*");
}
