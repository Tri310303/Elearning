import React, { useEffect, useState, useContext } from "react";
import API, { endpoints } from '../../configs/APIs';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { MySearchContext } from "../../configs/Contexts";

const Home = () => {
    const { searchKeyword } = useContext(MySearchContext);
    const { cateId } = useParams(); // Lấy cateId từ URL
    const [courses, setCourses] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCourses = async () => {
            let url = endpoints['courses'];

            if (searchKeyword) {
                url = `${url}?kw=${searchKeyword}`; // Thêm tham số tìm kiếm
            }

            try {
                let res = await API.get(url);
                let allCourses = res.data.results;

                // Lọc khóa học theo cateId
                if (cateId) {
                    allCourses = allCourses.filter(course => course.category === parseInt(cateId));
                }

                setCourses(allCourses);
            } catch (ex) {
                setCourses([]);
                console.error(ex);
            } finally {
                setLoading(false);
            }
        };

        loadCourses();
    }, [searchKeyword, cateId]); // Cập nhật dependencies

    return (
        <Container style={{ padding: '40px', backgroundColor: '#f9f9f9' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '30px', textAlign: 'center', textTransform: 'uppercase' }}>
                DANH MỤC KHOÁ HỌC
            </h1>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spinner animation="border" />
                    <span style={{ fontSize: '22px', color: '#6c757d', marginLeft: '10px' }}>Loading...</span>
                </div>
            ) : (
                <Row className="justify-content-center">
                    {courses && courses.map((c) => (
                        <Col key={c.id} md={3} xs={12} className='p-2'>
                            <Card style={{ width: '100%', height: '100%' }}>
                                <Link to={`/lesson/${c.id}`}>
                                    <Card.Img variant="top" src={c.image} style={{ height: '150px', objectFit: 'cover' }} />
                                </Link>
                                <Card.Body>
                                    <Card.Title style={{ fontSize: '20px', fontWeight: '500', color: '#007bff' }}>
                                        <Link to={`/lesson/${c.id}`} style={{ color: '#007bff', textDecoration: 'none' }}>
                                            {c.subject}
                                        </Link>
                                    </Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default Home;