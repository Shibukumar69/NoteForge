import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dsrcjwiwf",
  api_key: process.env.CLOUDINARY_API_KEY || "618793944719848",
  api_secret: process.env.CLOUDINARY_API_SECRET || "4M1vJlGdTOko_mt2Q1NnnQljvrg",
  secure: true,
});

export class CloudinaryService {
  /**
   * Uploads an image or PDF to Cloudinary
   * @param {string} filePath - Absolute or relative local path to file
   * @param {string} folder - Folder name in Cloudinary (e.g. 'noteforge/pages', 'noteforge/pdfs')
   * @param {string} resourceType - 'image' or 'raw' (for PDFs)
   */
  static async uploadFile(filePath, folder = "noteforge/notes", resourceType = "auto") {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
      });
      return result.secure_url || result.url;
    } catch (error) {
      console.error(`Cloudinary upload failed for ${filePath}:`, error.message);
      // Return null so caller can fall back to local relative URL
      return null;
    }
  }

  /**
   * Verifies credentials by pinging Cloudinary
   */
  static async ping() {
    try {
      const res = await cloudinary.api.ping();
      return res.status === "ok";
    } catch (error) {
      console.warn("Cloudinary ping failed:", error.message);
      return false;
    }
  }
}
