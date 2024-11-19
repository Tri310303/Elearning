import React, { useState, useRef } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBU3oHjbir6t5l1I4o_y1X5Hnbp9EK6esM",
  authDomain: "ecommercewebsite-5d3ee.firebaseapp.com",
  projectId: "ecommercewebsite-5d3ee",
  storageBucket: "ecommercewebsite-5d3ee.appspot.com",
  messagingSenderId: "474495285402",
  appId: "1:474495285402",
  measurementId: "G-KMT368RGJ3"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
}

const auth = firebase.auth();
const firestore = firebase.firestore();

const styles = {
  body: {
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    maxWidth: '800px',
    width: '100%',
    height: '80vh',
    border: '1px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Thêm bóng cho khung chat
  },
  header: {
    backgroundColor: '#4267B2',
    color: '#fff',
    padding: '16px', // Tăng padding cho header
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #ccc',
  },
  chatContent: {
    flex: '1',
    padding: '20px',
    overflowY: 'auto',
    backgroundColor: '#fff', // Đặt nền trắng cho nội dung chat
  },
  message: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '16px',
    maxWidth: '80%',
  },
  sentMessage: {
    backgroundColor: '#DCF8C6', // Màu nền cho tin nhắn gửi đi
    alignSelf: 'flex-end', // Căn phải cho tin nhắn gửi đi
    borderRadius: '20px',
    padding: '10px',
    position: 'relative',
    marginLeft: 'auto', // Căn lề trái tự động để đẩy sang bên phải
    marginBottom: '10px', // Khoảng cách giữa các tin nhắn
    maxWidth: '80%', // Giới hạn độ rộng
    wordWrap: 'break-word', // Ngắt dòng nếu tin nhắn quá dài
  },
  receivedMessage: {
    backgroundColor: '#fff', // Màu nền cho tin nhắn nhận
    alignSelf: 'flex-start', // Căn trái cho tin nhắn nhận
    borderRadius: '20px',
    padding: '10px',
    position: 'relative',
    marginRight: 'auto', // Căn lề phải tự động để đẩy sang bên trái
    marginBottom: '10px', // Khoảng cách giữa các tin nhắn
    maxWidth: '80%', // Giới hạn độ rộng
    wordWrap: 'break-word', // Ngắt dòng nếu tin nhắn quá dài
  },
  messageText: {
    fontSize: '16px',
    maxWidth: '100%',
    wordWrap: 'break-word',
  },
  timestamp: {
    fontSize: '12px',
    color: '#888',
    textAlign: 'right',
    marginTop: '5px',
  },
  inputContainer: {
    borderTop: '1px solid #ccc',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  input: {
    flex: '1',
    height: '40px',
    fontSize: '16px',
    padding: '8px',
    borderRadius: '20px',
    border: 'none',
    outline: 'none',
    marginRight: '12px',
  },
  sendButton: {
    backgroundColor: '#4267B2',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  img: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '10px',
  },
};

function Chat() {
  const [user] = useAuthState(auth);
  const dummy = useRef();

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await firestore.collection('messages').add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={styles.body}>
      <div style={styles.chatContainer}>
        <header style={styles.header}>
          <h1>💬 Nhắn tin</h1>
          <SignOut />
        </header>
        <section style={styles.chatContent}>
          {user ? <ChatRoom dummy={dummy} /> : <SignIn />}
        </section>
        <form onSubmit={sendMessage} style={styles.inputContainer}>
          <input
            style={styles.input}
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="Nhập tin nhắn của bạn..."
          />
          <button type="submit" style={styles.sendButton} disabled={!formValue}>
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button style={{ ...styles.sendButton, backgroundColor: '#4CAF50', margin: 'auto', display: 'block' }} onClick={signInWithGoogle}>
        Đăng nhập bằng Google
      </button>
      <p style={{ textAlign: 'center', marginTop: '16px', color: '#555' }}>Xin vui lòng không vi phạm quy định cộng đồng hoặc bạn sẽ bị cấm vĩnh viễn!</p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button style={styles.sendButton} onClick={() => auth.signOut()}>
        Đăng xuất
      </button>
    )
  );
}

function ChatRoom({ dummy }) {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  return (
    <main style={styles.chatContent}>
      {messages && messages.map((msg) => (
        <div key={msg.id} style={{ ...styles.message, ...(msg.uid === auth.currentUser.uid ? styles.sentMessage : styles.receivedMessage) }}>
          {msg.uid === auth.currentUser.uid ? (
            <>
              <div style={{ flex: 1 }}> {/* Chiếm phần không gian còn lại cho tin nhắn */}
                <div style={styles.messageText}>
                  {msg.text}
                </div>
                <div style={styles.timestamp}>
                  {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString('vi-VN') : '...'}
                </div>
              </div>
              <img src={msg.photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} style={styles.img} alt="Avatar" />
            </>
          ) : (
            <>
              <img src={msg.photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} style={styles.img} alt="Avatar" />
              <div style={{ flex: 1 }}> {/* Chiếm phần không gian còn lại cho tin nhắn */}
                <div style={styles.messageText}>
                  {msg.text}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#888',
                  textAlign: 'left',
                  marginTop: '5px',
                }}>
                  {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString('vi-VN') : '...'}
                </div>
              </div>
            </>
          )}
        </div>
      ))}
      <span ref={dummy}></span>
    </main>
  );
}

export default Chat;