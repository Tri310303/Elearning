import { BrowserRouter, Route, Routes } from "react-router-dom"
import Footer from "./components/Commons/Footer";
import Header from "./components/Commons/Header";
import Home from "./components/Home/Home";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from "react-bootstrap";
import React, { useState } from "react";
import { MyBookContext, MySearchContext, MyDispatchContext, MyUserContext } from "./configs/Contexts";
import { MyUserReducer } from "./configs/Reducers";
import { useReducer } from "react";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import Payment from "./components/Payment/Payment";
import Chat from "./components/community/Chat";
import Lessons from "./components/Lessons/Lessons";
import LessonDetail from "./components/Lessons/LessonDetail";
import Profile from "./components/User/Profile";
import Book from "./components/community/Book";

const App = () => {
  const [user, useDispatch] = useReducer(MyUserReducer, null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [books2, setBooks2] = useState({});
  return (
    <BrowserRouter>
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={useDispatch}>
          <MySearchContext.Provider value={{ searchKeyword, setSearchKeyword }}>
            <MyBookContext.Provider value={{ books2, setBooks2}}>
              <Header />
              <Container>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/category/:cateId" element={<Home />} /> {/* Thêm route này */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/lesson/:courseId" element={<Lessons />} />
                  <Route path="/lessonDetail/:lessonId" element={<LessonDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/book" element={<Book />} />
                </Routes>
              </Container>
              <Footer />
            </MyBookContext.Provider>
          </MySearchContext.Provider>
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </BrowserRouter>
  );
}

export default App;