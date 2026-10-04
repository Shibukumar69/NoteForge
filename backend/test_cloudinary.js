import { CloudinaryService } from "./src/services/cloudinary.service.js";

async function testCloudinary() {
  console.log("==================================================");
  console.log("[TEST] Testing Cloudinary API Authentication...");
  console.log("==================================================");

  const isOk = await CloudinaryService.ping();
  if (isOk) {
    console.log("[PASS] Cloudinary Authenticated & Online Successfully!");
    process.exit(0);
  } else {
    console.error("[FAIL] Cloudinary Authentication Failed. Check API credentials.");
    process.exit(1);
  }
}

testCloudinary();
