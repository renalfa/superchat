import "./App.css";

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useRef, useState } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyBPrnhS4FZ2fSBrUCLUfFslOyNIYBo85zU",
  authDomain: "mock-test-b4d31.firebaseapp.com",
  projectId: "mock-test-b4d31",
  storageBucket: "mock-test-b4d31.appspot.com",
  messagingSenderId: "140220065993",
  appId: "1:140220065993:web:925a4606a78e3755718518",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1 className={user ? "" : "sub"}>Super Chat</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p className="sub">
        Masuk menggunakan akun google untuk mengakses fitur chat ❤️.
      </p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, "messages");
  const q = query(messagesRef, orderBy("createdAt"), limit(100));

  const [messages] = useCollectionData(q, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    try {
      await addDoc(messagesRef, {
        text: formValue,
        createdAt: serverTimestamp(),
        uid,
        photoURL,
      });
    } catch (error) {
      console.error("Error sending message: ", error);
    }

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Ketik pesan disini..."
        />

        <button type="submit" disabled={!formValue}>
          Send
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, createdAt } = props.message;

  function formatDate(dateObject) {
    if (!dateObject || (!dateObject.seconds && !dateObject.nanoseconds)) {
      return "Invalid Date";
    }
    const milliseconds =
      (dateObject.seconds || 0) * 1000 +
      Math.round((dateObject.nanoseconds || 0) / 1000000);

    const formattedDate = new Date(milliseconds);

    const day = formattedDate.getDate();
    const month = formattedDate.getMonth() + 1;
    const year = formattedDate.getFullYear();
    const hours = formattedDate.getHours();
    const minutes = formattedDate.getMinutes();

    const formattedDateString = `${month}/${day}/${year}, ${hours}:${minutes
      .toString()
      .padStart(2, "0")}`;

    return formattedDateString;
  }

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL ||
            `https://ui-avatars.com/api/?name=${auth.currentUser?.displayName}&background=random&size=150`
          }
          alt="user"
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: messageClass === "sent" ? "flex-end" : "flex-start",
          }}
        >
          <p>{text}</p>
          <span
            style={{
              fontSize: "0.7rem",
              color: "#ccc",
              marginTop: "-0.5rem",
              display: "block",
              textAlign: messageClass === "sent" ? "right" : "left",
              padding: "0 0.5rem",
            }}
          >
            {formatDate(createdAt)}
          </span>
        </div>
      </div>
    </>
  );
}

export default App;
