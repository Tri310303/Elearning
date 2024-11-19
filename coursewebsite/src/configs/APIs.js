import axios from "axios";
import cookie from "react-cookies";

const BASE_URL = 'http://127.0.0.1:8000/';

export const endpoints = {
    'categories': '/categories/',
    'tags':`/tags/`,
    'courses': '/courses/',
    'books': `/books/`,

    'lessons': (courseId) => `/courses/${courseId}/lessons/`,
    'lessonDetails': (lessonId) => `/lessons/${lessonId}/`,
    'add-lesson': `/lessons/`,
    'comments': (lessonId) => `/comments/?lesson_id=${lessonId}`,
    'add-comment': (lessonId) => `/lessons/${lessonId}/comments/`,
    'like': (lessonId) => `/lessons/${lessonId}/like/`,
    'add-assignment':`/assignments/`,

    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'register': '/users/',

    'payments': `/payments/`,
    'paypal_webhook_success': `/payments/webhook/success/`,  // Thêm endpoint cho webhook thành công
    'paypal_webhook_cancel': `/payments/webhook/cancel/`,    // Thêm endpoint cho webhook hủy
}

console.info(cookie.load('token'))

export const authApi = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}` // Thêm "Bearer" trước token
        }
    });
};

export default axios.create({
    baseURL: BASE_URL
});