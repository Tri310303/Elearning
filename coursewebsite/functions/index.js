/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const firestore = admin.firestore();

exports.sendReplyOnMessage = functions.firestore
    .document("messages/{messageId}")
    .onCreate(async (snapshot, context) => {
      const messageData = snapshot.data();

      // Lấy thông tin tin nhắn
      const text = messageData.text;

      // Gửi phản hồi
      await firestore.collection("messages").add({
        text: `Chào bạn, tôi đã nhận được tin nhắn của bạn: "${text}". 
        Chúng tôi sẽ liên hệ lại sớm!`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        uid: "bot", // Đặt UID của bot hoặc user quản trị hệ thống
        photoURL: "https://res.cloudinary.com/dg1zsnywc/image/upload/v1718637306/jpd0ipah1ixspxrjgrml.png", // Ảnh đại diện của bot
      });

      return null;
    });
