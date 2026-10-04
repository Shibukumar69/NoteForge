import http from "http";
import app from "./src/app.js";

async function runTests() {
  console.log("==================================================");
  console.log("[TEST] Starting Node.js / Express Backend Test Suite");
  console.log("==================================================");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = "http://127.0.0.1:5099";

  let authToken = "";

  try {
    // 1. Test Health
    console.log("Testing GET /api/health...");
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    if (healthRes.status !== 200 || healthJson.status !== "online") {
      throw new Error(`Health check failed: ${JSON.stringify(healthJson)}`);
    }
    console.log("[PASS] /api/health is online!");

    // 2. Test User Registration
    console.log("Testing POST /api/auth/register...");
    const testEmail = `student_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Engineer",
        email: testEmail,
        password: "securepassword123",
      }),
    });
    const regJson = await regRes.json();
    if (regRes.status !== 201 || !regJson.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regJson)}`);
    }
    authToken = regJson.token;
    console.log(`[PASS] User registration passed! Token acquired.`);

    // 3. Test User Login
    console.log("Testing POST /api/auth/login...");
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "securepassword123",
      }),
    });
    const loginJson = await loginRes.json();
    if (loginRes.status !== 200 || !loginJson.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginJson)}`);
    }
    console.log("[PASS] User login passed!");

    // 4. Test Authenticated Profile Route
    console.log("Testing GET /api/auth/me...");
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const meJson = await meRes.json();
    if (meRes.status !== 200 || !meJson.user) {
      throw new Error(`Auth profile check failed: ${JSON.stringify(meJson)}`);
    }
    console.log(`[PASS] Authenticated user retrieved: ${meJson.user.email}`);

    // 5. Test GET /api/lectures
    console.log("Testing GET /api/lectures...");
    const lecRes = await fetch(`${baseUrl}/api/lectures`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const lecJson = await lecRes.json();
    if (lecRes.status !== 200 || !Array.isArray(lecJson.lectures)) {
      throw new Error(`Get lectures failed: ${JSON.stringify(lecJson)}`);
    }
    console.log("[PASS] Lectures list retrieved!");

    // 6. Test GET /api/notes
    console.log("Testing GET /api/notes...");
    const notesRes = await fetch(`${baseUrl}/api/notes`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const notesJson = await notesRes.json();
    if (notesRes.status !== 200 || !Array.isArray(notesJson.notes)) {
      throw new Error(`Get notes failed: ${JSON.stringify(notesJson)}`);
    }
    console.log("[PASS] Notes list retrieved!");

    console.log("==================================================");
    console.log("[SUCCESS] ALL BACKEND UNIT & API TESTS PASSED!");
    console.log("==================================================");
    server.close(() => {
      process.exit(0);
    });
  } catch (err) {
    console.error("\n[FAIL] Backend Test Error:", err);
    server.close(() => {
      process.exit(1);
    });
  }
}

runTests();
