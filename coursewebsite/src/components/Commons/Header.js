import { useContext, useEffect, useState } from "react";
import { Badge, Button, Col, Container, Form, Nav, Navbar, NavDropdown, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import APIs, { endpoints } from "../../configs/APIs";
import { MySearchContext ,MyDispatchContext, MyUserContext } from "../../configs/Contexts";
import MySpinner from "./MySpinner";

const Header = () => {
    const [categories, setCategories] = useState(null);
    const [kw, setKw] = useState("");
    const nav = useNavigate();
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const { searchKeyword, setSearchKeyword } = useContext(MySearchContext);

    const loadCates = async () => {
        try {
            let res = await APIs.get(endpoints['categories']);
            setCategories(res.data);
        } catch (ex) {
            console.error(ex);
        }
    }

    useEffect(() => {
        loadCates();
    }, []);

    const submit = (event) => {
        event.preventDefault();
        setSearchKeyword(kw); // Cập nhật từ khóa tìm kiếm
        // Không cần điều chỉnh đường dẫn nữa
    };
    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href="#home">E-Course Website</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Link to="/" className="nav-link">Trang chủ</Link>
                        <NavDropdown title="Danh mục" id="basic-nav-dropdown">
                            {categories === null ? <MySpinner /> : <>
                                {categories.map(c => {
                                    let url = `/category/${c.id}`;
                                    return <Link to={url} className="nav-link" key={c.id}>{c.name}</Link>;
                                })}
                            </>}
                        </NavDropdown>
                        {user !== null ? <>
                            <Link to="/book" className="nav-link text-success">Mua sách</Link>
                            <Link to="/" className="nav-link text-danger">{user.username}</Link>
                            <Link onClick={() => dispatch({ "type": "logout" })} to="/" className="nav-link text-primary">Đăng xuất</Link>
                            <Link to="/profile" className="nav-link text-info">Hồ sơ</Link>
                        </> : <>
                            <Link to="/login" className="nav-link text-danger">Đăng nhập</Link>
                            <Link to="/register" className="nav-link text-info">Đăng ký</Link>
                        </>}
                    </Nav>
                </Navbar.Collapse>
                {user !== null ? <>
                    <Form inline onSubmit={submit}>
                        <Row>
                            <Col xs="auto">
                                <Form.Control 
                                    value={kw} 
                                    onChange={e => setKw(e.target.value)}
                                    type="text"
                                    placeholder="Tìm khóa học bạn cần ở đây..."
                                    className="mr-sm-2"
                                />
                            </Col>
                            <Col xs="auto">
                                <Button type="submit">Tìm</Button>
                            </Col>
                        </Row>
                    </Form>
                </> : <></>}
            </Container>
        </Navbar>
    );
}

export default Header;