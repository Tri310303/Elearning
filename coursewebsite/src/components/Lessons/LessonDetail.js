import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API, { authApi, endpoints } from "../../configs/APIs";
import moment from "moment";
import cookie from "react-cookies";
import { Container, Row, Col, Button, Card, Spinner, Modal, Form } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa'; 
import { MyUserContext } from "../../configs/Contexts";

const LessonDetail = () => {
    const { lessonId } = useParams();
    const [lesson, setLesson] = useState(null);
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [tags, setTags] = useState([]);
    const [showModal, setShowModal] = useState(false); // State để điều khiển modal
    const [file, setFile] = useState(null); // State để lưu file

    const currentUser = useContext(MyUserContext);
    const [user, setUser] = useState(currentUser || {});

    useEffect(() => {
        const loadLesson = async () => {
            try {
                let res = await API.get(endpoints['lessonDetails'](lessonId));
                setLesson(res.data);
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        };

        const loadComments = async () => {
            const token = cookie.load('access-token');
            try {
                let res = await authApi(token).get(endpoints['comments'](lessonId));
                setComments(res.data);
            } catch (ex) {
                console.error(ex);
            }
        };

        const loadTags = async () => {
            try {
                let res = await API.get(endpoints['tags']); 
                setTags(res.data); 
            } catch (ex) {
                console.error(ex);
            }
        };

        loadTags();
        loadLesson();
        loadComments();
    }, [lessonId]);

    const getRole = () => {
        if (user.is_superuser && user.is_staff) return 'Admin';
        if (!user.is_superuser && user.is_staff) return 'Giảng viên';
        return 'Sinh viên';
    };

    const handleFileSubmit = async () => {
        const token = cookie.load('access-token');
        let formData = new FormData();
        formData.append("user", user.id);
        formData.append("lesson", lessonId);
        formData.append("file", file);

        try {
            let res = await authApi(token).post(endpoints['add-assignment'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("Assignment submitted:", res.data);
            setShowModal(false); // Đóng modal sau khi nộp bài thành công
        } catch (ex) {
            console.error("Error submitting assignment:", ex);
        }
    };

    const addComment = async (event) => {
        event.preventDefault();
        const token = cookie.load('access-token');
        try {
            let res = await authApi(token).post(endpoints['add-comment'](lessonId), { content });
            setComments([res.data, ...comments]);
            setContent("");
        } catch (ex) {
            console.error("Error adding comment:", ex);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <Spinner animation="border" />
                <span style={{ fontSize: '22px', color: '#6c757d', marginLeft: '10px' }}>Loading...</span>
            </div>
        );
    }

    return (
        <Container style={{ padding: '40px', backgroundColor: '#f9f9f9' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '30px', textAlign: 'center', textTransform: 'uppercase' }}>
                CHI TIẾT MÔN HỌC
            </h1>
            {lesson && (
                <Card style={{ marginBottom: '20px' }}>
                    <Card.Body>
                        <Row>
                            <Col md={4}>
                                <Card.Img src={`https://res.cloudinary.com/dg1zsnywc/${lesson.image}`} alt={lesson.subject} style={{ objectFit: 'cover', height: '150px' }} />
                            </Col>
                            <Col md={8}>
                                <Card.Title style={{ fontSize: '24px' }}>{lesson.subject}</Card.Title>
                                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                    {lesson.tags.map(tagId => {
                                        const tag = tags.find(tag => tag.id === tagId);
                                        return (
                                            <span key={tagId} style={{ backgroundColor: 'blue', color: 'white', borderRadius: '10px', padding: '5px', marginRight: '5px' }}>
                                                {tag ? tag.name : null}
                                            </span>
                                        );
                                    })}
                                </div>
                                <div dangerouslySetInnerHTML={{ __html: lesson.content }} style={{ marginTop: '20px' }}></div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {['Admin', 'Giảng viên', 'Sinh viên'].includes(getRole()) && (
                <div style={{ marginBottom: '20px' }}>
                    <Button variant="success" onClick={() => setShowModal(true)}>Nộp bài</Button>
                </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Nộp bài</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Chọn file</Form.Label>
                        <Form.Control type="file" onChange={e => setFile(e.target.files[0])} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="primary" onClick={handleFileSubmit}>Nộp bài</Button>
                </Modal.Footer>
            </Modal>

            <div style={{ marginTop: '40px' }}>
                <h2>Bình luận</h2>
                <form onSubmit={addComment} style={{ display: 'flex', marginBottom: '20px' }}>
                    <input
                        type="text"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        style={{ flex: 1, padding: '10px', marginRight: '10px' }}
                        placeholder="Nội dung bình luận..."
                    />
                    <Button type="submit">Bình luận</Button>
                </form>
                {comments.length > 0 && comments.map(c => (
                    <div key={c.id} style={{ display: 'flex', marginBottom: '20px' }}>
                        <div style={{ textAlign: 'center', marginRight: '10px' }}>
                            {c.user.avatar ? (
                                <img
                                    src={c.user.avatar ? `https://res.cloudinary.com/dg1zsnywc/${c.user.avatar}` : FaUserCircle}
                                    alt={c.user.username}
                                    style={{ width: '60px', height: '60px', borderRadius: '50%' }}
                                />
                            ) : (
                                <FaUserCircle style={{ width: '60px', height: '60px', color: '#ccc' }} />
                            )}
                            <div style={{ fontSize: '14px', marginTop: '5px' }}>{c.user.username}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <p>{c.content}</p>
                            <span style={{ color: '#888' }}>{moment(c.created_date).fromNow()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Container>
    );
};

export default LessonDetail;



