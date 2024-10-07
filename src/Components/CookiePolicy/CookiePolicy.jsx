import React from "react";
import Link from "next/link";

const CookiePolicy = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 text-lg">
      <p>
        This Cookie Policy explains how Gameboxd (&quot;we&quot;,
        &quot;us&quot;, and &quot;our&quot;) uses cookies and similar
        technologies to recognize you when you visit our website at gameboxd.com
        (&quot;Website&quot;). It explains what these technologies are and why
        we use them, as well as your rights to control our use of them.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
        What are cookies?
      </h2>
      <p>
        Cookies are small data files that are placed on your computer or mobile
        device when you visit a website. Cookies are widely used by website
        owners in order to make their websites work, or to work more
        efficiently, as well as to provide reporting information.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
        Why do we use cookies?
      </h2>
      <p>
        We use first party and third party cookies for several reasons. Some
        cookies are required for technical reasons in order for our Website to
        operate, and we refer to these as &quot;essential&quot; or
        &quot;strictly necessary&quot; cookies. Other cookies enable us to track
        and target the interests of our users to enhance the experience on our
        Website. Third parties serve cookies through our Website for
        advertising, analytics and other purposes.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
        How can I control cookies?
      </h2>
      <p>
        You have the right to decide whether to accept or reject cookies. You
        can exercise your cookie rights by setting your preferences in the
        Cookie Consent Manager. The Cookie Consent Manager allows you to select
        which categories of cookies you accept or reject. Essential cookies
        cannot be rejected as they are strictly necessary to provide you with
        services.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
        Changes to this Cookie Policy
      </h2>
      <p>
        We may update this Cookie Policy from time to time in order to reflect,
        for example, changes to the cookies we use or for other operational,
        legal or regulatory reasons. Please therefore re-visit this Cookie
        Policy regularly to stay informed about our use of cookies and related
        technologies.
      </p>

      <p className="mt-8">
        If you have any questions about our use of cookies or other
        technologies, please email us at{" "}
        <Link href="/contact" className="text-blue-400 hover:underline">
          our contact page
        </Link>
        .
      </p>

      <p className="mt-8 text-sm text-gray-400">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
};

export default CookiePolicy;
