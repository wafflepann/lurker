const CLIENT_ID = "k94k8emoeags4qs8ln9oas608dmu93"; // Not secret
const API_BASE = "https://api.twitch.tv/helix/";
const POLL_INTERVAL_MINUTES = 1;

let channelTabs = {}; // { channelName: tabId }

browser.runtime.onInstalled.addListener(() => {
  browser.alarms.create("pollTwitch", {
    periodInMinutes: POLL_INTERVAL_MINUTES,
  });
});

browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "pollTwitch") {
    checkStreams();
  }
});

async function checkStreams() {
  const { twitchToken, channels = [] } = await browser.storage.local.get([
    "twitchToken",
    "channels",
  ]);
  if (!twitchToken || !channels.length) return;

  const loginParams = channels
    .map((name) => `user_login=${encodeURIComponent(name)}`)
    .join("&");

  const response = await fetch(`${API_BASE}streams?${loginParams}`, {
    headers: {
      Authorization: `Bearer ${twitchToken}`,
      "Client-Id": CLIENT_ID,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Twitch API error:", errorText);

    // Optional: clear token if unauthorized
    if (response.status === 401) {
      await browser.storage.local.remove("twitchToken");
      console.warn("Token invalid or expired. User must reconnect.");
    }
    return;
  }

  const data = await response.json();
  const liveChannels = new Set(
    data.data.map((stream) => stream.user_login.toLowerCase())
  );

  for (const channel of channels) {
    const isLive = liveChannels.has(channel.toLowerCase());

    if (isLive && !channelTabs[channel]) {
      browser.tabs.create({ url: `https://twitch.tv/${channel}` }, (tab) => {
        channelTabs[channel] = tab.id;
      });
    }

    if (!isLive && channelTabs[channel]) {
      browser.tabs.remove(channelTabs[channel]);
      delete channelTabs[channel];
    }
  }
}
