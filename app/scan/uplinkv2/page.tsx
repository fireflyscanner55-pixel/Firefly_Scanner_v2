"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserScenarioConfig } from "@/types/radioanalysis";

const VIDEO = "/assets/Timeline%201.mp4";

export default function UplinkV2Page() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const end = Number(sessionStorage.getItem("radioanalysis_scan_end"));
        if (!end || Date.now() < end) {
          router.replace("/scan/initialize");
          return;
        }
        const response = await fetch("/api/user/scenario", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Unable to load scenario");
        const scenario = (data.data ?? data) as UserScenarioConfig;
        if (cancelled) return;
        if (scenario.scenarioType === "negative") {
          router.replace("/scan/live");
        } else if (scenario.scenarioType === "positive") {
          setReady(true);
        } else {
          throw new Error("Invalid scenario assignment");
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Unable to start video");
      }
    };
    void check();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    const video = videoRef.current;
    if (!video) return;
    // Muted autoplay is allowed in most browsers without interaction.
    video.play().catch(() => setError("Autoplay was blocked by the browser. Allow autoplay to continue."));
    const blockKeyboard = (event: KeyboardEvent) => {
      // Block page-level video shortcuts; browser/OS reserved shortcuts remain available.
      if ([" ", "Spacebar", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "k", "j", "l", "f", "m", "Home", "End", "MediaPlayPause", "MediaTrackNext", "MediaTrackPrevious"].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("keydown", blockKeyboard, true);
    return () => window.removeEventListener("keydown", blockKeyboard, true);
  }, [ready]);

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black" onContextMenu={(event) => event.preventDefault()}>
      {error && <p role="alert" className="absolute z-10 max-w-lg px-5 text-center text-red-400">{error}</p>}
      {ready && (
        <video
          ref={videoRef}
          src={VIDEO}
          autoPlay
          muted
          playsInline
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          preload="auto"
          className="pointer-events-none h-full w-full select-none object-contain"
          onEnded={() => {
            sessionStorage.setItem("radioanalysis_uplink_complete", "1");
            router.replace("/scan/live");
          }}
          onError={() => setError("Unable to load the local scanner video: public/assets/Timeline 1.mp4")}
        />
      )}
    </main>
  );
}
