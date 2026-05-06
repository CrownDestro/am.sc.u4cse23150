require("dotenv").config();
const LOG_URL = "http://20.207.122.201/evaluation-service/logs";
const AUTH_TOKEN = process.env.ACCESS_TOKEN;

async function Log(stack, level, packageName, message) {
  if (!AUTH_TOKEN) {
    throw new Error("ACCESS_TOKEN not found");
  }

  const response = await fetch(LOG_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify({
      stack, level, package: packageName, message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API failed: ${response.status} ${errorText}`);
  }
  return response.json();
}
module.exports = { Log };
