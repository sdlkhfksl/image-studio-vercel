// utils/videoUtils.ts

declare global {
  interface Window {
    FFmpeg: any;
  }
}

const fetchFile = async (url: string): Promise<Uint8Array> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return new Uint8Array(await response.arrayBuffer());
};

export const stitchVideos = async (
  videoUrls: string[], 
  onProgress: (progress: number) => void
): Promise<void> => {
  if (videoUrls.length === 0) {
    throw new Error("没有可拼接的视频。");
  }
  
  onProgress(0);

  const { FFmpeg } = window.FFmpeg;
  const ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }: { message: string }) => {
    console.log('[FFMPEG Log]', message);
  });
  
  ffmpeg.on('progress', ({ progress }: { progress: number }) => {
    onProgress(Math.round(progress * 100));
  });

  await ffmpeg.load({
      coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
  });
  
  const concatListContent = videoUrls.map((_, index) => `file 'input${index}.mp4'`).join('\n');
  await ffmpeg.writeFile('concat_list.txt', concatListContent);

  // Fetch and write all files concurrently
  await Promise.all(videoUrls.map(async (url, index) => {
    const data = await fetchFile(url);
    await ffmpeg.writeFile(`input${index}.mp4`, data);
  }));

  try {
    // Run ffmpeg command
    await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', '-c', 'copy', 'output.mp4']);

    const data = await ffmpeg.readFile('output.mp4');
    const blob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `comic-story-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onProgress(100);
  } catch (error) {
    console.error("FFmpeg execution failed:", error);
    throw new Error("视频拼接失败。请检查控制台日志获取更多信息。");
  } finally {
    try {
        await ffmpeg.terminate();
    } catch (e) {
        console.warn("Could not terminate ffmpeg instance.", e);
    }
  }
};
