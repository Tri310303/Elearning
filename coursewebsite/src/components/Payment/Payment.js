import React, { useContext, useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import API, { authApi, endpoints } from "../../configs/APIs";
import cookie from "react-cookies";
import { MyBookContext, MyUserContext } from "../../configs/Contexts";

const Payment = () => {
    const currentUser = useContext(MyUserContext);
    const [user, setUser] = useState(currentUser || {});
    const { books2 } = useContext(MyBookContext);
    const token = cookie.load('access-token');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentId = urlParams.get('paymentId');
        const payerID = urlParams.get('PayerID');

        if (paymentId && payerID) {
            confirmPayment(paymentId, payerID);
        }

        const cancelStatus = urlParams.get('status');
        if (cancelStatus && cancelStatus === 'cancelled') {
            setErrorMessage('Thanh toán đã bị hủy bỏ.');
        }
    }, []);

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        if (!paymentMethod) {
            alert('Vui lòng chọn hình thức thanh toán.');
            return;
        }

        if (paymentMethod === 'cash' && (!name || !email || !address)) {
            alert('Vui lòng nhập đầy đủ thông tin để nhận hàng.');
            return;
        }

        try {
            const requestData = {
                user: user.id,
                book: books2.id,
                book_name: books2.name,
                price: (books2.price / 25000).toFixed(2), // Chuyển đổi giá sang USD
            };

            if (paymentMethod === 'cash') {
                requestData.name = name;
                requestData.email = email;
                requestData.address = address;
            }

            const response = await authApi(token).post(endpoints.payments, requestData);

            if (response.status === 201) {
                const approvalUrl = response.data.redirect_url;
                window.location.href = approvalUrl; // Chuyển hướng đến URL PayPal
            } else {
                setErrorMessage('Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error(error);
            setErrorMessage('Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại.');
        }
    };
    

    const confirmPayment = async (paymentId, payerID) => {
        try {
            const confirmResponse = await API.get(`${endpoints.paypal_webhook_success}?paymentId=${paymentId}&PayerID=${payerID}`);

            if (confirmResponse.status === 200) {
                setShowAlert(true);
            } else {
                setErrorMessage('Thanh toán không thành công. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error(error);
            setErrorMessage('Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại.');
        }
    };

    return (
        <Container className="mt-4">
            <h2 className="text-center text-info mb-4">Chọn hình thức thanh toán</h2>
            <Row className="justify-content-center">
                <Col md={6}>
                    <Form onSubmit={handlePaymentSubmit}>
                        <Form.Group controlId="formPaymentMethod">
                            <Form.Label>Hình thức thanh toán</Form.Label>
                            <Form.Select onChange={handlePaymentMethodChange} required>
                                <option value="">Chọn hình thức thanh toán</option>
                                <option value="cash">Tiền mặt khi nhận hàng</option>
                                <option value="paypal">PayPal</option>
                                <option value="stripe">Stripe</option>
                                <option value="zalopay">Zalo Pay</option>
                                <option value="momo">Momo</option>
                            </Form.Select>
                        </Form.Group>

                        {paymentMethod === 'cash' && (
                            <div>
                                <h3 className="text-center text-info mt-4">Nhập thông tin thanh toán cho tiền mặt khi nhận hàng</h3>
                                <Form.Group controlId="formName">
                                    <Form.Label>Tên người nhận</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tên người nhận"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Nhập email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="formAddress">
                                    <Form.Label>Địa chỉ giao hàng</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        placeholder="Nhập địa chỉ giao hàng"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </div>
                        )}

                        {paymentMethod === 'paypal' && (
                            <div>
                                <h3 className="text-center text-danger mt-4">
                                    Tên sách: {books2.name} 
                                </h3>
                                <h3 className="text-center text-success mt-4">
                                    Giá sách: {books2.price} VND
                                </h3>
                                <h3 className="text-center text-info mt-4">
                                    Tổng tiền thanh toán Paypal: {(books2.price / 25000).toFixed(2)} USD
                                </h3>
                            </div>
                        )}

                        <Button variant="primary" type="submit" >
                            Thanh toán
                        </Button>
                    </Form>

                    {showAlert && (
                        <Alert variant="success" className="mt-3">
                            <p>Đặt hàng thành công! Đơn hàng của quý khách đã được ghi nhận.</p>
                            <Button variant="outline-primary" href="/" className="mt-2">
                                Trang chủ
                            </Button>
                        </Alert>
                    )}

                    {errorMessage && (
                        <Alert variant="danger" className="mt-3">
                            <p>{errorMessage}</p>
                        </Alert>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Payment;