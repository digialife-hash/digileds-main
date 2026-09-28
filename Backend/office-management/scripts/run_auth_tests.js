import axios from "axios";
import fs from "node:fs";
import path from "node:path";

const logFilePath = "C:/Users/91781/.gemini/antigravity-cli/brain/0ec010d8-e1df-430c-b4fe-53aae2553bbe/.system_generated/tasks/task-203.log";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  const email = "digitalalife@gmail.com";
  const password = "Super@123";
  const baseURL = "http://localhost:5000/api";

  console.log("=== STARTING AUTH FLOW TESTS ===");

  // 1. Initial Login Request
  console.log("\n--- TEST 1: Requesting Login (Step 1) ---");
  let loginRes;
  try {
    loginRes = await axios.post(`${baseURL}/auth/login`, { email, password });
    console.log("Status:", loginRes.status);
    console.log("Response data:", loginRes.data);
  } catch (err) {
    console.error("Login request failed:", err.response?.data || err.message);
    process.exit(1);
  }

  if (!loginRes.data?.data?.requiresTwoFactor) {
    console.error("Expected requiresTwoFactor to be true!");
    process.exit(1);
  }

  console.log("Waiting for backend to write OTP to otp.txt...");
  await sleep(2000);

  // 2. Read OTP from otp.txt
  console.log("\n--- Reading OTP from otp.txt ---");
  const otpPath = path.join("C:/Users/91781/Desktop/office-managementv2/backend", "otp.txt");
  if (!fs.existsSync(otpPath)) {
    console.error("otp.txt does not exist!");
    process.exit(1);
  }
  const otp = fs.readFileSync(otpPath, "utf8").trim();
  console.log("Extracted OTP:", otp);

  // 3. Verify OTP
  console.log("\n--- TEST 2: Submitting OTP (Step 2) ---");
  let verifyRes;
  try {
    verifyRes = await axios.post(`${baseURL}/auth/login/super-admin/verify-2fa`, { email, otp });
    console.log("Status:", verifyRes.status);
    console.log("Response Set-Cookie Headers:", verifyRes.headers["set-cookie"]);
    console.log("Response User:", verifyRes.data?.data?.user?.email);
  } catch (err) {
    console.error("OTP Verification failed:", err.response?.data || err.message);
    process.exit(1);
  }

  const cookies = verifyRes.headers["set-cookie"];
  if (!cookies || cookies.length === 0) {
    console.error("No Set-Cookie headers returned from OTP verification!");
    process.exit(1);
  }

  // Construct cookie string to send in subsequent requests
  const cookieHeader = cookies.map(c => c.split(";")[0]).join("; ");
  console.log("Constructed Cookie Header for subsequent requests:", cookieHeader);

  // 4. Access Protected Dashboard API
  console.log("\n--- TEST 3: Accessing Protected Dashboard Route ---");
  try {
    const dashboardRes = await axios.get(`${baseURL}/super-admin/dashboard/summary`, {
      headers: { Cookie: cookieHeader }
    });
    console.log("Status:", dashboardRes.status);
    console.log("Dashboard response success:", dashboardRes.data?.success);
  } catch (err) {
    console.error("Dashboard request failed:", err.response?.data || err.message);
    process.exit(1);
  }

  // 5. Refresh Session API
  console.log("\n--- TEST 4: Requesting Token Refresh ---");
  let refreshRes;
  try {
    refreshRes = await axios.post(`${baseURL}/auth/refresh`, {}, {
      headers: { Cookie: cookieHeader }
    });
    console.log("Status:", refreshRes.status);
    console.log("Refresh response Set-Cookie Headers:", refreshRes.headers["set-cookie"]);
  } catch (err) {
    console.error("Refresh request failed:", err.response?.data || err.message);
    process.exit(1);
  }

  const refreshCookies = refreshRes.headers["set-cookie"];
  if (!refreshCookies || refreshCookies.length === 0) {
    console.error("No cookies returned from refresh response!");
    process.exit(1);
  }
  const refreshedCookieHeader = refreshCookies.map(c => c.split(";")[0]).join("; ");

  // 6. Access Dashboard API with refreshed cookies
  console.log("\n--- TEST 5: Accessing Dashboard with Refreshed Cookies ---");
  try {
    const dashboardResAfterRefresh = await axios.get(`${baseURL}/super-admin/dashboard/summary`, {
      headers: { Cookie: refreshedCookieHeader }
    });
    console.log("Status:", dashboardResAfterRefresh.status);
    console.log("Dashboard response success after refresh:", dashboardResAfterRefresh.data?.success);
  } catch (err) {
    console.error("Dashboard request with refreshed cookies failed:", err.response?.data || err.message);
    process.exit(1);
  }

  // 7. Requesting Logout
  console.log("\n--- TEST 6: Requesting Logout ---");
  try {
    const logoutRes = await axios.post(`${baseURL}/auth/logout`, {}, {
      headers: { Cookie: refreshedCookieHeader }
    });
    console.log("Status:", logoutRes.status);
    console.log("Logout response Set-Cookie Headers:", logoutRes.headers["set-cookie"]);
  } catch (err) {
    console.error("Logout request failed:", err.response?.data || err.message);
    process.exit(1);
  }

  console.log("\n=== ALL AUTH TESTS PASSED SUCCESSFULLY! ===");
}

runTests();
