import React from "react";
import TransparentNavbar from "../../Components/Navbar/TransparentNavbar";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Gameboxd",
  description:
    "Gameboxd's privacy policy: how we handle and protect your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <TransparentNavbar />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-300">
          Privacy Policy
        </h1>
        <div className="max-w-3xl mx-auto space-y-6 text-lg">
          <p>
            At Gameboxd, we value and respect your privacy. This Privacy Policy
            explains how we collect, use, and protect your personal information
            when you use our platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
            1. Information We Collect
          </h2>
          <p>
            We collect information that you provide directly, such as your
            username, email address, and password when creating an account. We
            also collect information about your activity on the platform, such
            as the reviews you write and the games you mark as favorites.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
            2. How We Use Your Information
          </h2>
          <p>
            We use your information to provide, maintain, and improve our
            services, personalize your experience, and communicate with you. We
            may also use aggregated and anonymous data for analysis and service
            improvement.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
            3. Sharing Information
          </h2>
          <p>
            We do not sell your personal information to third parties. We may
            share information with service providers who help us operate our
            platform, always under strict confidentiality conditions.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
            4. Security
          </h2>
          <p>
            We implement security measures to protect your information against
            unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
            5. Your Rights
          </h2>
          <p>
            You have the right to access, correct, or delete your personal
            information. You can also object to the processing of your data or
            request data portability.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
            6. Changes to This Policy
          </h2>
          <p>
            We may update this privacy policy from time to time. We will notify
            you of significant changes by posting a prominent notice on our
            platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
            7. Contact
          </h2>
          <p>
            If you have questions or concerns about our Privacy Policy, please
            contact us{" "}
            <Link className="text-blue-400 hover:underline" href={"/contact"}>
              here
            </Link>
            .
          </p>

          <p className="mt-8 text-sm text-gray-400">Last updated: 10/09/2024</p>
        </div>
      </div>
    </div>
  );
}
