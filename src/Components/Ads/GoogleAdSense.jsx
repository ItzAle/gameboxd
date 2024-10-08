import React, { useEffect } from 'react';

export default function GoogleAdSense({ client, slot, format = 'auto', responsive = true }) {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <ins className="adsbygoogle"
         style={{ display: 'block' }}
         data-ad-client={client}
         data-ad-slot={slot}
         data-ad-format={format}
         data-full-width-responsive={responsive}></ins>
  );
}