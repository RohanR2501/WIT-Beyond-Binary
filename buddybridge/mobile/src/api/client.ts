// Hardcoded URLs for local development
const API_BASE = "http://192.168.104.223:8000";  // Use your backend server's IP
const WS_BASE = "ws://192.168.104.223:8000";   // Use your backend server's IP for WebSocket

export async function chatWsUrl(roomId: string) {
  // Ensure the returned value is a string
  const url = `${WS_BASE}/ws/chat/${roomId}`;
  console.log("WebSocket URL:", url);  // Log to verify the URL is a string
  return url;  // Return the WebSocket URL as a string
}


export async function upsertUser(payload: any) {
  console.log("Connecting to API at:", API_BASE); // Check the API URL
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    console.log("User upserted:", data);
    return data;
  } catch (error) {
    console.error("Error in upsertUser:", error);
    throw error;
  }
}

export async function getMatches(userId: string) {
  const res = await fetch(`${API_BASE}/matches/${userId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getWingman(roomId: string, userA: string, userB: string) {
  const url = `${API_BASE}/wingman/${roomId}?user_a=${encodeURIComponent(userA)}&user_b=${encodeURIComponent(userB)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
