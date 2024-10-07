"use client";

import { useEffect } from "react";

// Declaramos el tipo para window.adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdComponent() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-5646939424987434"
      data-ad-slot="9476714628"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
