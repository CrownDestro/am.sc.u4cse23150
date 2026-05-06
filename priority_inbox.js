require("dotenv").config();
const API_URL = "http://20.207.122.201/evaluation-service/notifications";

function parseTimestamp(ts) {
  if (!ts) return 0;
  const normalized = ts.includes("T") ? ts : ts.replace(" ", "T");
  const date = new Date(`${normalized}Z`);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getWeight(type) {
  switch ((type || "").toLowerCase()) {
    case "placement":
      return 3;
    case "result":
      return 2;
    case "event":
      return 1;
    default:
      return 0;
  }
}

function rank(a, b) {
  const weightDiff = getWeight(b.Type) - getWeight(a.Type);
  if (weightDiff !== 0) return weightDiff;
  return parseTimestamp(b.Timestamp) - parseTimestamp(a.Timestamp);
}

async function fetchNotifications(token) {
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.notifications || [];
}

async function main() {
  const token = process.env.ACCESS_TOKEN;
  const topN = Number(process.env.TOP_N || 10);

  if (!token) {
    throw new Error("Missing ACCESS_TOKEN");
  }

  const notifications = await fetchNotifications(token);
  const top = notifications.sort(rank).slice(0, topN);

  console.log(`Top ${topN} priority notifications:`);
  top.forEach((n, index) => {
    const line = `${index + 1}. ${n.Type} | ${n.Message} | ${n.Timestamp}`;
    console.log(line);
  });
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
