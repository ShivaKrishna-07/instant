import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_SECRET,
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // You can add custom sign-in logic here
      // For example, check if user exists in your database
      return true;
    },
    
    async jwt({ token, user, account }) {
      // Persist additional user data to the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      
      // Store Firebase-compatible ID token if needed
      if (account?.id_token) {
        token.idToken = account.id_token;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Add custom fields to session
      if (session.user) {
        session.user.id = token.id;
        session.user.idToken = token.idToken;
      }
      
      return session;
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
