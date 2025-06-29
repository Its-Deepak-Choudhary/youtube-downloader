async function download(type) {
  const urlInput = document.getElementById("url");
  const url = urlInput.value.trim();

  if (!url) {
    alert("❗ Please enter a valid YouTube URL");
    return;
  }

  // Disable input and show loading
  urlInput.disabled = true;
  showLoading(true, `🎬 Fetching ${type === "audio" ? "MP3" : "Video"} from YouTube...`);

  try {
    const response = await fetch("https://your-backend-api.onrender.com/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, type })
    });

    if (!response.ok) {
      throw new Error("❌ Server error or invalid video URL");
    }

    const contentDisposition = response.headers.get("Content-Disposition");
    const videoTitle = response.headers.get("X-Video-Title"); // Custom header from backend
    let filename = (type === "audio" ? "audio.mp3" : "video.mp4");

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match && match[1]) filename = match[1];
    }

    showLoading(true, `⬇️ Downloading "${videoTitle || filename}"...`);

    const blob = await response.blob();

    if (blob.size < 1000) {
      throw new Error("⚠️ File too small. Likely failed.");
    }

    const downloadLink = document.createElement("a");
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadLink.href);

    alert(`✅ Download complete!\n${videoTitle || filename}`);
  } catch (error) {
    console.error(error);
    alert(`❌ Download failed:\n${error.message}`);
  } finally {
    urlInput.disabled = false;
    showLoading(false);
  }
}

function showLoading(isLoading, message = "⏳ Processing...") {
  let loader = document.getElementById("loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "loader";
    loader.style.position = "fixed";
    loader.style.top = "50%";
    loader.style.left = "50%";
    loader.style.transform = "translate(-50%, -50%)";
    loader.style.background = "#000";
    loader.style.color = "#fff";
    loader.style.padding = "20px";
    loader.style.borderRadius = "10px";
    loader.style.zIndex = "1000";
    loader.style.textAlign = "center";
    loader.style.fontSize = "16px";
    document.body.appendChild(loader);
  }
  loader.innerText = message;
  loader.style.display = isLoading ? "block" : "none";
}
