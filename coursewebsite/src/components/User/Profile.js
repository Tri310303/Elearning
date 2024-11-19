import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import cookie from "react-cookies";
import { MyUserContext } from "../../configs/Contexts";
import API, { authApi, endpoints } from "../../configs/APIs";

const Profile = () => {
    const currentUser = useContext(MyUserContext);
    const [user, setUser] = useState(currentUser || {});

    useEffect(() => {
        const loadUser = async () => {
            if (!currentUser) {
                const token = cookie.load('access-token');
                try {
                    let res = await authApi(token).get(endpoints['current-user']);
                    setUser(res.data);
                } catch (ex) {
                    console.error(ex);
                }
            } else {
                setUser(currentUser);
            }
        };

        loadUser();
    }, [currentUser]);

    // Kiểm tra chức vụ
    const getRole = () => {
        if (user.is_superuser && user.is_staff) return 'Admin';
        if (!user.is_superuser && user.is_staff) return 'Giảng viên';
        return 'Sinh viên';
    };

    return (
        <Container style={{ padding: '40px', backgroundColor: '#f9f9f9' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px' }}>
                Hồ Sơ Cá Nhân
            </h1>
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card style={{ padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                        <Row className="align-items-center text-center">
                            <Col xs={4}>
                                {user.avatar ? (
                                    <img
                                        src={`https://res.cloudinary.com/dg1zsnywc/${user.avatar}`}
                                        alt={user.username}
                                        style={{ width: '100%', height: 'auto', borderRadius: '10px' }} // Hình vuông lớn hơn với bo tròn nhẹ
                                    />
                                ) : (
                                    <FaUserCircle style={{ width: '100%', height: 'auto', borderRadius: '10px' }} />
                                )}
                            </Col>
                            <Col xs={8}>
                                <h4 style={{ fontWeight: 'bold' }}>{user.username || 'Không có tên'}</h4>
                                <p><strong>Email:</strong> {user.email || 'Không có email'}</p>
                                <p><strong>Họ và tên:</strong> {user.last_name || ''} {user.first_name}</p>
                                <p><strong>Chức vụ:</strong> {getRole()}</p>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;