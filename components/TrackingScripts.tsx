"use client";

import { useEffect } from "react";
import Script from "next/script";

interface TrackingScriptsProps {
  facebookPixelId?: string | null;
  googleAnalyticsId?: string | null;
  tiktokPixelId?: string | null;
}

export default function TrackingScripts({
  facebookPixelId,
  googleAnalyticsId,
  tiktokPixelId,
}: TrackingScriptsProps) {
  // Facebook Pixel initialization
  useEffect(() => {
    if (facebookPixelId && typeof window !== "undefined") {
      // @ts-expect-error Facebook Pixel global
      if (!window.fbq) {
        // @ts-expect-error Facebook Pixel setup
        window.fbq = function (...args: unknown[]) {
          // @ts-expect-error Facebook Pixel queue
          (window.fbq.q = window.fbq.q || []).push(args);
        };
        // @ts-expect-error Facebook Pixel version
        window.fbq.loaded = true;
        // @ts-expect-error Facebook Pixel version
        window.fbq.version = "2.0";
        // @ts-expect-error Facebook Pixel queue
        window.fbq.q = [];
      }
      // @ts-expect-error Facebook Pixel init
      window.fbq("init", facebookPixelId);
      // @ts-expect-error Facebook Pixel track
      window.fbq("track", "PageView");
    }
  }, [facebookPixelId]);

  // TikTok Pixel initialization
  useEffect(() => {
    if (tiktokPixelId && typeof window !== "undefined") {
      // @ts-expect-error TikTok Pixel global
      if (!window.ttq) {
        // @ts-expect-error TikTok Pixel setup
        window.ttq = function (...args: unknown[]) {
          // @ts-expect-error TikTok Pixel queue
          (window.ttq.q = window.ttq.q || []).push(args);
        };
        // @ts-expect-error TikTok Pixel queue
        window.ttq.q = [];
      }
      // @ts-expect-error TikTok Pixel load
      window.ttq.load(tiktokPixelId);
      // @ts-expect-error TikTok Pixel page
      window.ttq.page();
    }
  }, [tiktokPixelId]);

  return (
    <>
      {/* Facebook Pixel */}
      {facebookPixelId && (
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          src={`https://connect.facebook.net/en_US/fbevents.js`}
        />
      )}

      {/* Google Analytics */}
      {googleAnalyticsId && (
        <>
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          />
          <Script
            id="google-analytics-config"
            strategy="afterInteractive"
          >
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}');
            `}
          </Script>
        </>
      )}

      {/* TikTok Pixel */}
      {tiktokPixelId && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          src={`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${tiktokPixelId}&lib=ttq`}
        />
      )}
    </>
  );
}
