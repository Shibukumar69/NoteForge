import os
import sys
import time
import cv2
import yt_dlp

def test_zero_download(youtube_url):
    print("=" * 60)
    print(f"[TEST] Zero-Download Stream Processing for: {youtube_url}")
    print("=" * 60)
    
    t0 = time.time()
    ydl_opts = {
        'format': '18/worst[ext=mp4]/bestvideo[height<=360]/worst',
        'quiet': True,
        'no_warnings': True,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=False)
        stream_url = info.get('url')
        duration = info.get('duration', 0)
        title = info.get('title', '')
        
    print(f"[EXTRACTED STREAM URL] in {time.time() - t0:.2f}s")
    print(f"Title: {title}")
    print(f"Duration: {duration}s ({duration/60:.1f} mins)")
    print(f"Stream URL (first 80 chars): {stream_url[:80]}...")
    
    if not stream_url:
        print("[FAIL] Could not extract stream URL")
        return
        
    # Open remote stream directly in OpenCV with ZERO local video download!
    t1 = time.time()
    cap = cv2.VideoCapture(stream_url)
    if not cap.isOpened():
        print("[FAIL] OpenCV could not open direct stream URL")
        return
        
    print(f"[OPENCV STREAM READY] in {time.time() - t1:.2f}s (ZERO bytes saved on disk!)")
    
    # Sample 5 test timestamps directly from the cloud stream
    test_times_sec = [10, 60, 300, 900, 1800]
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scratch", "zero_download_frames")
    os.makedirs(out_dir, exist_ok=True)
    
    captured = 0
    for t_sec in test_times_sec:
        if t_sec >= duration:
            continue
        t_seek = time.time()
        cap.set(cv2.CAP_PROP_POS_MSEC, t_sec * 1000.0)
        ret, frame = cap.read()
        if ret and frame is not None:
            out_file = os.path.join(out_dir, f"frame_{t_sec}s.jpg")
            cv2.imwrite(out_file, frame)
            print(f"  - Grabbed frame at {t_sec//60:02d}:{t_sec%60:02d} in {time.time() - t_seek:.3f}s -> {out_file}")
            captured += 1
            
    cap.release()
    print("=" * 60)
    print(f"[SUCCESS] Zero-Download streaming test completed! Grabbed {captured} frames in {time.time() - t0:.2f}s total!")
    print("=" * 60)

if __name__ == "__main__":
    test_zero_download("https://youtu.be/8Ja8RQyvovA")
