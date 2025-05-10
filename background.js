const CLIENT_ID = "YOUR_CLIENT_ID"; // NOT secret, safe to include
const API_BASE = "https://api.twitch.tv/helix/";
const POLL_INTERVAL_MINUTES = 1;

let channelTabs = {}; // { channelName: tabId }

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("pollTwitch", {
    periodInMinutes: POLL_INTERVAL_MINUTES,
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "pollTwitch") {
    checkStreams();
  }
});

async function checkStreams() {
  const { twitchToken, channels = [] } = await chrome.storage.local.get([
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

  const data = await response.json();
  const liveChannels = new Set(
    data.data.map((stream) => stream.user_login.toLowerCase())
  );

  for (const channel of channels) {
    const isLive = liveChannels.has(channel.toLowerCase());

    if (isLive && !channelTabs[channel]) {
      chrome.tabs.create({ url: `https://twitch.tv/${channel}` }, (tab) => {
        channelTabs[channel] = tab.id;
      });
    }

    if (!isLive && channelTabs[channel]) {
      chrome.tabs.remove(channelTabs[channel]);
      delete channelTabs[channel];
    }
  }
}
