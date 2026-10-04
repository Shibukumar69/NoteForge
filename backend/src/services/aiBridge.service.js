import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

export class AIBridgeService {
  static async checkHealth() {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 3000 });
      return response.data;
    } catch (error) {
      console.warn("AI Microservice health check failed:", error.message);
      return { status: "offline", error: error.message };
    }
  }

  static async getYouTubeInfo(url) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/youtube/info`, { url }, { timeout: 15000 });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch YouTube info from AI service:", error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || "Could not fetch YouTube video information");
    }
  }

  static async processVideo({ videoPath, youtubeUrl, lectureTitle, jobId, inkStyle, notesStyle }) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/process-video`,
        {
          video_path: videoPath || null,
          youtube_url: youtubeUrl || null,
          lecture_title: lectureTitle,
          job_id: jobId,
          ink_style: inkStyle || "royal_blue",
          notes_style: notesStyle || "detailed",
          sample_interval_sec: 5.0,
        },
        { timeout: 600000 } // 10 minutes timeout for download + processing
      );
      return response.data;
    } catch (error) {
      console.error("Failed to process video with AI service:", error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || "AI video processing failed");
    }
  }
}
