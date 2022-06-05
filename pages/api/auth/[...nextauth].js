import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from '../../../firebase';
import { getDoc, setDoc, doc } from "firebase/firestore";
import logoImg from '../../../assets/logoImg.png';

const img = logoImg.src;

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    // CredentialsProvider({
    //   // The name to display on the sign in form (e.g. 'Sign in with...')
    //   name: 'Email',
    //   // The credentials is used to generate a suitable form on the sign in page.
    //   // You can specify whatever fields you are expecting to be submitted.
    //   // e.g. domain, username, password, 2FA token, etc.
    //   // You can pass any HTML attribute to the <input> tag through the object.
    //   credentials: {
    //     email: {
    //       label: 'Email',
    //       type: 'email',
    //       placeholder: 'email@example.com',
    //     },
    //     password: { label: 'Password', type: 'password' },
    //   },
    //   async authorize(credentials) {
    //     console.log("entered");
    //     const auth = getAuth();
    //     const hello = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)
    //       .then((userCredential) => {
    //         // Signed in
    //         const user = userCredential.user;
    //         return {
    //           id: user.id,
    //           name: user.email,
    //           email: user.email,
    //         };
    //         // ...
    //       })
    //       .catch((error) => {
    //         console.log("casa");
    //         const errorCode = error.code;
    //         const errorMessage = error.message;
    //         console.log(errorMessage);
    //       });

    //       return hello;
    //   },
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    // ...add more providers here
  ],
  // If you want to use the base next.js login page
  theme: {
    logo: "/_next/static/media/logoImg.2ae3033f.png",
    brandColor: "#F13287",
    colorScheme: "light",
  },

  // Custom page
  // pages: {
  //   // File name should be lower case as it is a root
  //   signIn: "/auth/signin"
  // },

  callbacks: {
    async session({session, token, user}) {
      
      const docRef = doc(db, 'users', session.user.email);
      const docSnap = await getDoc(docRef).then( (snapshot) => {
        console.log(snapshot.data());
        if(snapshot.data()) {
          session.user.name = snapshot.data().name;
          session.user.isAdmin = snapshot.data().isAdmin;
          session.user.username = snapshot.data().username;
        } else {
          session.user.isAdmin = false;
          session.user.username = session.user.name
          .split(' ')
          .join("")
          .toLocaleLowerCase();
          console.log("user not found");
          setDoc(doc(db,'users', session.user.email), {
            name: session.user.name,
            isAdmin: session.user.isAdmin,
            username: session.user.username
          })
        }
      });

      session.user.uid = token.sub;
      return session;
    }
  }
});