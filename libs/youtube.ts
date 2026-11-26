export interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  destroy(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  getVolume(): number;
  isMuted(): boolean;
  mute(): void;
  unMute(): void;
  setVolume(volume: number): void;
  getIframe(): HTMLIFrameElement;
}
interface YouTubeAPI {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      width: string;
      height: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: (event: { target: YouTubePlayer }) => void;
        onStateChange: (event: { data: number }) => void;
        onError: (event: { data: number }) => void;
        onAutoplayBlocked: () => void;
      };
    },
  ) => YouTubePlayer;
}
declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}
let apiPromise: Promise<YouTubeAPI> | null = null;
export function loadYouTube(): Promise<YouTubeAPI> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
    };
    const existing = document.getElementById("voib-youtube-api");
    if (existing) return;
    const script = document.createElement("script");
    script.id = "voib-youtube-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.referrerPolicy = "strict-origin-when-cross-origin";
    script.onerror = () => {
      apiPromise = null;
      script.remove();
      reject(new Error("YouTube is unavailable."));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}
