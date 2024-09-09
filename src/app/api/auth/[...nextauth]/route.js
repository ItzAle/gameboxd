import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let db;

if (!getApps().length) {
  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? JSON.parse(process.env.FIREBASE_PRIVATE_KEY)
        : undefined,
    }),
  });
  db = getFirestore(app);
}

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        const userRef = db.collection("users").doc(user.email);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          await userRef.set({
            email: user.email,
            name: user.name,
            profilePicture: user.image,
            bio: "",
            reviews: [],
            likedGames: [],
            lastLogin: new Date(),
          });
        } else {
          await userRef.update({
            name: user.name,
            profilePicture: user.image,
            lastLogin: new Date(),
          });
        }
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
