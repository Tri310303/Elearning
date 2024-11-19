import React, { useContext, useEffect, useState } from "react";
import API, { endpoints } from '../../configs/APIs';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Import Link để điều hướng
import { MyBookContext } from "../../configs/Contexts";
import { useNavigate } from 'react-router-dom';
const Book = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { books2, setBooks2 } = useContext(MyBookContext);
    const navigate = useNavigate();
    useEffect(() => {
        const loadBooks = async () => {
            let url = endpoints['books'];

            try {
                let res = await API.get(url);
                let allBooks = res.data.results || res.data;

                setBooks(allBooks);
            } catch (ex) {
                setBooks([]);
                console.error(ex);
            } finally {
                setLoading(false);
            }
        };

        loadBooks();
    }, []);

    return (
        <Container style={{ padding: '40px', backgroundColor: '#f9f9f9' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '30px', textAlign: 'center', textTransform: 'uppercase' }}>
                TÀI LIỆU SÁCH
            </h1>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spinner animation="border" />
                    <span style={{ fontSize: '22px', color: '#6c757d', marginLeft: '10px' }}>Loading...</span>
                </div>
            ) : (
                <Row className="justify-content-center">
                    {books.length > 0 ? (
                        books.map((b) => (
                            <Col key={b.id} md={4} xs={12} className='p-3'>
                                <Card style={{ height: '100%' }}>
                                    <Card.Img variant="top" src={b.image} style={{ height: '200px', objectFit: 'cover' }} />
                                    <Card.Body>
                                        <Card.Title style={{ fontSize: '20px', fontWeight: '500', color: '#007bff' }}>
                                            {b.name}
                                        </Card.Title>
                                        <Card.Text>
                                            <strong>Tác giả:</strong> {b.author} <br />
                                            <strong>Giá:</strong> {b.price} VND
                                        </Card.Text>
                                        <Card.Text style={{ display: 'flex', alignItems: 'center' }}>
                                            <strong style={{ marginRight: '5px', marginBottom: '14.5px' }}>Nội dung:</strong>
                                            <span dangerouslySetInnerHTML={{ __html: b.content }} />
                                        </Card.Text>
                                        <Button
                                            variant="primary"
                                            style={{ marginTop: '10px', width: '100%' }}
                                            onClick={() => {
                                                setBooks2({ // Cập nhật để lấy toàn bộ thông tin sách
                                                    id: b.id,
                                                    image: b.image,
                                                    created_date: b.created_date,
                                                    updated_date: b.updated_date,
                                                    active: b.active,
                                                    name: b.name,
                                                    content: b.content,
                                                    price: b.price,
                                                    author: b.author,
                                                }); // Thêm thông tin sách vào context
                                                navigate(`/payment/`); // Điều hướng đến trang thanh toán
                                            }}
                                        >
                                            Thanh toán
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <h5>Không có sách nào để hiển thị</h5>
                    )}
                </Row>
            )}
        </Container>
    );
};

export default Book;
