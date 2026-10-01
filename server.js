
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.YOUTUBE_API_KEY || "";
const VIDEO_ID = process.env.YOUTUBE_VIDEO_ID || "";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let liveChatId = null;
let nextPageToken = "";
let lastPoll = 0;
let scores = {};
let recent = [];
let superChats = [];
let errorMessage = "";

async function yt(url) {
  const r = await fetch(url);
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || `YouTube API error ${r.status}`);
  return data;
}

async function discoverChat() {
  if (!API_KEY || !VIDEO_ID) return;
  const u = new URL("https://www.googleapis.com/youtube/v3/videos");
  u.searchParams.set("part", "liveStreamingDetails");
  u.searchParams.set("id", VIDEO_ID);
  u.searchParams.set("key", API_KEY);
  const data = await yt(u);
  liveChatId = data.items?.[0]?.liveStreamingDetails?.activeLiveChatId || null;
  if (!liveChatId) throw new Error("No active live chat found. Make sure the video is currently live.");
}

function addScore(country, amount, author) {
  if (!country) return;
  scores[country] = (scores[country] || 0) + amount;
  recent.unshift({author: author || "Viewer", country, amount, time: Date.now()});
  recent = recent.slice(0, 20);
}

const aliases = {
  bangladesh:"Bangladesh", bd:"Bangladesh",
  india:"India", in:"India",
  pakistan:"Pakistan", pk:"Pakistan",
  nepal:"Nepal", bhutan:"Bhutan",
  sri_lanka:"Sri Lanka", srilanka:"Sri Lanka", "sri lanka":"Sri Lanka",
  thailand:"Thailand", vietnam:"Vietnam", indonesia:"Indonesia",
  malaysia:"Malaysia", philippines:"Philippines",
  brazil:"Brazil", usa:"United States", "united states":"United States",
  america:"United States", japan:"Japan", korea:"South Korea",
  "south korea":"South Korea", china:"China", russia:"Russia",
  germany:"Germany", france:"France", italy:"Italy",
  spain:"Spain", portugal:"Portugal", canada:"Canada",
  australia:"Australia", "new zealand":"New Zealand",
  mexico:"Mexico", turkey:"Turkey", iran:"Iran",
  iraq:"Iraq", qatar:"Qatar", "saudi arabia":"Saudi Arabia",
  uae:"United Arab Emirates", "united arab emirates":"United Arab Emirates",
  egypt:"Egypt", morocco:"Morocco", albania:"Albania",
  kosovo:"Kosovo", greece:"Greece", norway:"Norway",
  sweden:"Sweden", finland:"Finland", denmark:"Denmark",
  poland:"Poland", ukraine:"Ukraine", romania:"Romania",
  "south africa":"South Africa", nigeria:"Nigeria", ghana:"Ghana",
  kenya:"Kenya", argentina:"Argentina", chile:"Chile",
  colombia:"Colombia", peru:"Peru", uruguay:"Uruguay"
};

function detectCountry(text) {
  const normalized = text.toLowerCase().replace(/[^\p{L}\p{N}\s_]/gu, " ").replace(/\s+/g," ").trim();
  // Longest aliases first, so "south korea" wins over "korea".
  for (const key of Object.keys(aliases).sort((a,b)=>b.length-a.length)) {
    if (normalized === key || normalized.includes(key)) return aliases[key];
  }
  return null;
}

async function pollChat() {
  if (!liveChatId || !API_KEY) return;
  const now = Date.now();
  if (now - lastPoll < 1200) return;
  lastPoll = now;

  const u = new URL("https://www.googleapis.com/youtube/v3/liveChat/messages");
  u.searchParams.set("liveChatId", liveChatId);
  u.searchParams.set("part", "snippet,authorDetails");
  u.searchParams.set("maxResults", "200");
  if (nextPageToken) u.searchParams.set("pageToken", nextPageToken);
  u.searchParams.set("key", API_KEY);

  try {
    const data = await yt(u);
    nextPageToken = data.nextPageToken || nextPageToken;
    for (const item of (data.items || [])) {
      const text = item.snippet?.displayMessage || "";
      const author = item.authorDetails?.displayName || "Viewer";
      const country = detectCountry(text);
      if (country) {
        addScore(country, 1, author);
      }
      const sc = item.snippet?.superChatDetails;
      if (sc) {
        const micros = Number(sc.amountMicros || 0);
        const usd = micros / 1e6;
        const pts = Math.round(usd * 1000);
        if (pts > 0) {
          const country2 = country || "Super Chat";
          if (country2 !== "Super Chat") addScore(country2, pts, author);
          superChats.unshift({author, usd, points: pts, time: Date.now()});
          superChats = superChats.slice(0, 10);
        }
      }
    }
    errorMessage = "";
  } catch (e) {
    errorMessage = e.message;
    // If YouTube says the page token expired, refresh the chat id/token.
    if (/page token|live chat/i.test(e.message)) {
      nextPageToken = "";
    }
  }
}

setInterval(pollChat, 500);

app.get("/api/state", async (req,res) => {
  if (!liveChatId && API_KEY && VIDEO_ID) {
    try { await discoverChat(); errorMessage = ""; }
    catch(e) { errorMessage = e.message; }
  }
  await pollChat();
  res.json({
    connected: !!liveChatId && !errorMessage,
    liveChatId: !!liveChatId,
    error: errorMessage,
    scores,
    recent,
    superChats
  });
});

app.post("/api/test", (req,res) => {
  const {author, message} = req.body || {};
  const country = detectCountry(String(message || ""));
  if (country) addScore(country, 1, author || "Test Viewer");
  res.json({country});
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Country_Battle_Live_with_Viewer_Names.html"));
});

app.listen(PORT, () => console.log(`Country Flag Live running on port ${PORT}`));
