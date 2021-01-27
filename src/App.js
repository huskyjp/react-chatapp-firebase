import './App.css';
import React, { useRef, useState } from 'react';

// interact with firebase
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

// firebase state management
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// initialize firebase setting 
firebase.initializeApp({
    // your config
})



// access to firebase object
const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {
  // state management: whether user is logged in or logged out
  // if user signed out , user is null
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
      <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn auth={auth} firebase={firebase}/>}
      </section>
    </div>
  );
}

// when user is null
function SignIn() {
  const signinWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button onClick={signinWithGoogle}>Sing in with Google!</button>
      <p>Please keep the guidline!</p>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}> Sign Out ? </button>
  )
}


function ChatRoom() {
  // to automatically scroll
  const dummy = useRef();
  // create object to access to firebase document
  const messagesRef = firestore.collection('messages');
  // get query
  const query = messagesRef.orderBy('createdAt').limit(25);
  // dynamimcally listen to the changes via hook
  const [messages] = useCollectionData(query, { idField: 'id' });
  // user input
  const [ formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });
    // reset
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });

  }

  return (
    <>  
      <main>
        {messages && messages.map(msg => <ChatMessage key = {msg.id} message={msg} />)} 
        <div ref={dummy}> </div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}  placeholder="say something nice"/>
        <button type="submit" disabled={!formValue}>Submit</button>
      </form>
    
    </>
  )
}


function ChatMessage(props) {
  const { text, uid,  photoURL } = props.message;

  // ternary operator for CSS styling
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL  || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  )
}

export default App;
