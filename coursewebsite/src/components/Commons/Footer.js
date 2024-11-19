import { Alert } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { FaComments } from "react-icons/fa"; // Import biểu tượng chatbox

const Footer = () => {
    return (
        <div style={styles.footerContainer}>
            <Alert className="d-flex justify-content-between align-items-center" style={styles.footerAlert}>
                <span>Huỳnh Võ Đức Trí &copy; 2024</span>
                <NavLink to="/chat" className="text-decoration-none" style={styles.chatIcon}>
                    <FaComments size={24} /> {/* Kích thước biểu tượng */}
                </NavLink>
            </Alert>
        </div>
    );
};

const styles = {
    footerContainer: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgb(0, 123, 255)', // Màu nền của footer
        zIndex: 1000 // Đảm bảo footer nằm trên các phần tử khác
    },
    footerAlert: {
        margin: 0, // Bỏ margin
        padding: '10px 20px', // Padding cho Alert
    },
    chatIcon: {
        display: 'flex',
        alignItems: 'center',
        color: 'blue', // Màu sắc biểu tượng
        fontSize: '20px', // Kích thước văn bản, nếu cần
    }
};

export default Footer;
