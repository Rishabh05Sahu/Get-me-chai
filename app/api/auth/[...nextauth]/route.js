import NextAuth from 'next-auth'
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import connectDb from '@/db/connectDb';
import User from '@/models/User';

export const authoptions = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "github" || account.provider === "google")  {
        try {
          await connectDb();

          // Check if user exists
          let currentUser = await User.findOne({ email: user.email });

          if (!currentUser) {
            // Create new user
            currentUser = await User.create({
              email: user.email,
              username: user.email.split("@")[0],
            });
          }

          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },

    async session({ session }) {
      try {
        await connectDb();
        const dbUser = await User.findOne({ email: session.user.email });

        if (dbUser) {
          session.user.name = dbUser.username;
        }

        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
      }
    },
  }
});

export { authoptions as GET, authoptions as POST };
