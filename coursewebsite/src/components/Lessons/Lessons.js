import React, { useContext, useEffect, useState } from "react";
import API, { authApi, endpoints } from '../../configs/APIs';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Import icon trái tim
import cookie from "react-cookies"; // Để lấy token
import { MyUserContext } from "../../configs/Contexts";

const Lessons = () => {
    const { courseId } = useParams();
    const [lessons, setLessons] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUser = useContext(MyUserContext);
    const [user, setUser] = useState(currentUser || {});
    const [tags, setTags] = useState([]);
    const [showModal, setShowModal] = useState(false); // State để điều khiển modal
    const [newLesson, setNewLesson] = useState({
        subject: "",
        image: null,
        content: "",
        tags: [], // Mảng chứa ID của tags đã chọn
    });

    useEffect(() => {
        const loadLessons = async () => {
            try {
                let res = await API.get(endpoints['lessons'](courseId));
                setLessons(res.data);
            } catch (ex) {
                setLessons([]);
                console.info(ex);
            } finally {
                setLoading(false);
            }
        };

        const loadTags = async () => {
            try {
                let res = await API.get(endpoints['tags']); // Lấy danh sách tags
                setTags(res.data); // Lưu vào state tags
            } catch (ex) {
                console.error(ex);
            }
        };

        loadTags();
        loadLessons();
    }, [courseId]);

    // Kiểm tra chức vụ
    const getRole = () => {
        if (user.is_superuser && user.is_staff) return 'Admin';
        if (!user.is_superuser && user.is_staff) return 'Giảng viên';
        return 'Sinh viên';
    };

    // Hàm xử lý like
    const handleLike = async (lessonId, isLiked) => {
        const token = cookie.load('access-token');
        try {
            let res = await authApi(token).post(endpoints['like'](lessonId));
            setLessons(prevLessons =>
                prevLessons.map(lesson =>
                    lesson.id === lessonId ? { ...lesson, liked: !isLiked } : lesson
                )
            );
        } catch (ex) {
            console.error("Error liking/unliking lesson:", ex);
        }
    };

    // Mở modal
    const handleOpenModal = () => {
        setShowModal(true);
    };

    // Đóng modal
    const handleCloseModal = () => {
        setShowModal(false);
        setNewLesson({ subject: "", image: null, content: "", tags: [] }); // Reset form
    };

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewLesson({ ...newLesson, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("Selected file:", file); // Kiểm tra xem tệp đã được chọn
            setNewLesson({ ...newLesson, image: file });
        } else {
            console.warn("No file selected"); // Nếu không có tệp nào được chọn
        }
    };

    // Xử lý chọn tag
    const handleTagChange = (e) => {
        const selectedTags = Array.from(e.target.selectedOptions, option => option.value);
        setNewLesson({ ...newLesson, tags: selectedTags.map(id => parseInt(id)) }); // Chuyển đổi ID sang số nguyên
    };

    // Gửi API để tạo môn học
    const handleCreateLesson = async () => {
        const token = cookie.load('access-token');
        let formData = new FormData();
        
        // Gán các trường vào formData
        formData.append('subject', newLesson.subject);
        formData.append('image', newLesson.image);
        formData.append('content', newLesson.content);
        formData.append('user', user.id); // Đảm bảo user.id là số
        formData.append('course', courseId); // Đảm bảo courseId là số
        
        // Chỉ cần thêm ID của tag vào formData
        newLesson.tags.forEach(tagId => formData.append('tags', tagId)); // Chỉ thêm ID tag
    
        // Log dữ liệu để kiểm tra
        console.log("Form Data Before Sending: ", Object.fromEntries(formData)); // Log để kiểm tra dữ liệu
    
        try {
            await authApi(token).post(endpoints['add-lesson'], formData,{
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setShowModal(false); // Đóng modal sau khi gửi thành công
            let res = await API.get(endpoints['lessons'](courseId));
            setLessons(res.data);
        } catch (error) {
            console.error("Error creating lesson:", error.response.data); // Log lỗi chi tiết
        }
    };

    return (
        <Container style={{ padding: '40px', backgroundColor: '#f9f9f9' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '30px', textAlign: 'center', textTransform: 'uppercase' }}>
                DANH SÁCH MÔN HỌC
            </h1>
            {/* Hiển thị nút Tạo môn học nếu role là Admin hoặc Giảng viên */}
            {['Admin', 'Giảng viên'].includes(getRole()) && (
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Button variant="success" onClick={handleOpenModal}>Tạo môn học</Button>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spinner animation="border" />
                    <span style={{ fontSize: '22px', color: '#6c757d', marginLeft: '10px' }}>Loading...</span>
                </div>
            ) : (
                <Row className="justify-content-center">
                    {lessons.map((lesson) => (
                        <Col key={lesson.id} md={3} xs={12} className='p-2'>
                            <Card style={{ width: '100%', height: '100%' }}>
                                <Link to={`/lessonDetail/${lesson.id}`}>
                                    <Card.Img
                                        variant="top"
                                        src={`https://res.cloudinary.com/dg1zsnywc/${lesson.image}`}
                                        style={{ height: '150px', objectFit: 'cover' }}
                                    />
                                </Link>
                                <Card.Body>
                                    <Card.Title style={{ fontSize: '20px', fontWeight: '500', color: '#007bff' }}>
                                        <Link to={`/lessonDetail/${lesson.id}`} style={{ color: '#007bff', textDecoration: 'none' }}>
                                            {lesson.subject}
                                        </Link>
                                    </Card.Title>

                                    {/* Sử dụng flex để căn ngang icon like và nút chi tiết */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Link to={`/lessonDetail/${lesson.id}`}>
                                            <Button variant="primary">Chi tiết môn học</Button>
                                        </Link>
                                        {/* Hiển thị nút like/unlike */}
                                        <div
                                            onClick={() => handleLike(lesson.id, lesson.liked)}
                                            style={{ cursor: 'pointer', color: lesson.liked ? 'red' : 'grey' }}
                                        >
                                            {lesson.liked ? <FaHeart /> : <FaRegHeart />} Like
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Modal tạo môn học */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Tạo môn học</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="subject">
                            <Form.Label>Tên môn học</Form.Label>
                            <Form.Control
                                type="text"
                                name="subject"
                                value={newLesson.subject}
                                onChange={handleChange}
                                placeholder="Nhập tên môn học"
                            />
                        </Form.Group>
                        <Form.Group controlId="image">
                            <Form.Label>Hình ảnh môn học</Form.Label>
                            <Form.Control
                                type="file"
                                name="image"
                                onChange={handleFileChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="content">
                            <Form.Label>Nội dung môn học</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="content"
                                value={newLesson.content}
                                onChange={handleChange}
                                placeholder="Nhập nội dung môn học"
                            />
                        </Form.Group>
                        <Form.Group controlId="tags">
                            <Form.Label>Chọn tag</Form.Label>
                            <Form.Control as="select" multiple onChange={handleTagChange}>
                                {tags.map(tag => (
                                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Hủy</Button>
                    <Button variant="primary" onClick={handleCreateLesson}>Xác nhận</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Lessons;

