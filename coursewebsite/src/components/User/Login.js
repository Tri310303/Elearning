import React, { useContext, useState } from "react";
import { Button, Form } from "react-bootstrap";
import cookie from "react-cookies";
import { Navigate, useNavigate } from "react-router-dom";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";

const Login = () => {
    const fields = [{
        "label": "Tên đăng nhập",
        "type": "text",
        "field": "username"
    }, {
        "label": "Mật khẩu",
        "type": "password",
        "field": "password"
    }];
    const [user, setUser] = useState({});
    const dispatch = useContext(MyDispatchContext);
    const currentUser = useContext(MyUserContext);
    const nav = useNavigate();

    const login = async (e) => {
        e.preventDefault();
        
        try {
            let res = await APIs.post(endpoints['login'], {
                'username': user.username,
                'password': user.password,
                'client_id': "akgBQXtzkXuElRHMkL6nNuZa7zflReaGfBQPpECP",
                'client_secret': "hkl6Glzs73ABngMEAIfry6CeXJGiL5qnW45mCdm5myjmhoQZprQ09Q85xLkV5aJrLBcKuOgEv3gK9lgLazXOGiGdud0GaPyXmGFIKdKSbgzwti7V6ezLhoQHrE9tUeT1",
                "grant_type": "password"
            });
            
            console.info(res.data); // Log the response for debugging
            
            // Lưu token vào cookie
            cookie.save("access-token", res.data.access_token);
    
            // Fetch current user với token vừa nhận
            let u = await authApi(res.data.access_token).get(endpoints['current-user']); 
            dispatch({
                "type": "login",
                "payload": u.data
            });
            nav("/"); // Navigate to home
        } catch (ex) {
            console.error(ex.response); // Log the server response for detailed error information
        }
    }


    const change = (event, field) => {
        setUser(current => {
            return {...current, [field]: event.target.value}
        })
    }

    if (currentUser !== null)
        return <Navigate  to="/" />

    return (
        <>
            <h1 className="text-center text-info">ĐĂNG NHẬP TÀI KHOẢN</h1>
            <Form onSubmit={login}>
                {fields.map(f => <React.Fragment key={f.field}>
                    <Form.Group className="mb-3" controlId={f.field}>
                        <Form.Control onChange={e => change(e, f.field)} value={user[f.field]} type={f.type} placeholder={f.label} />
                    </Form.Group>
                </React.Fragment>)}

                <Button variant="info" type="submit" className="mb-1 mt-1">Đăng nhập</Button>
            </Form>
        </>
    );
}

export default Login;


// import React, { useContext, useState } from 'react';
// import { MDBContainer, MDBCol, MDBRow, MDBBtn, MDBInput, MDBCheckbox } from 'mdb-react-ui-kit';
// import cookie from 'react-cookies';
// import { Navigate, useNavigate } from 'react-router-dom';
// import APIs, { authApi, endpoints } from '../../configs/APIs';
// import { MyDispatchContext, MyUserContext } from '../../configs/Contexts';

// const Login = () => {
//     const [user, setUser] = useState({});
//     const dispatch = useContext(MyDispatchContext);
//     const currentUser = useContext(MyUserContext);
//     const nav = useNavigate();

//     const login = async (e) => {
//         e.preventDefault();
//         try {
//             let res = await APIs.post(endpoints['login'], {
//                 'username': user.username,
//                 'password': user.password,
//                 'client_id': "akgBQXtzkXuElRHMkL6nNuZa7zflReaGfBQPpECP",
//                 'client_secret': "hkl6Glzs73ABngMEAIfry6CeXJGiL5qnW45mCdm5myjmhoQZprQ09Q85xLkV5aJrLBcKuOgEv3gK9lgLazXOGiGdud0GaPyXmGFIKdKSbgzwti7V6ezLhoQHrE9tUeT1",
//                 "grant_type": "password"
//             });

//             cookie.save("access-token", res.data.access_token);
//             let u = await authApi(res.data.access_token).get(endpoints['current-user']);
//             dispatch({
//                 "type": "login",
//                 "payload": u.data
//             });
//             nav("/");
//         } catch (ex) {
//             console.error(ex.response);
//         }
//     }

//     const change = (event, field) => {
//         setUser(current => {
//             return { ...current, [field]: event.target.value }
//         });
//     }

//     if (currentUser !== null) return <Navigate to="/" />;

//     return (
//         <MDBContainer fluid className="p-3 my-5 h-custom">
//             <style>
//                 {`
//                     .divider:after,
//                     .divider:before {
//                         content: "";
//                         flex: 1;
//                         height: 1px;
//                         background: #eee;
//                     }
//                     .h-custom {
//                         height: calc(100% - 73px);
//                     }
//                     @media (max-width: 450px) {
//                         .h-custom {
//                             height: 100%;
//                         }
//                     }
//                 `}
//             </style>
//             <MDBRow>
//                 <MDBCol col='10' md='6'>
//                     <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp" className="img-fluid" alt="Sample image" />
//                 </MDBCol>

//                 <MDBCol col='4' md='6'>
//                     <div className="d-flex flex-row align-items-center justify-content-center">
//                         <p className="lead fw-normal mb-0 me-3">Sign in</p>
//                     </div>

//                     <div className="divider d-flex align-items-center my-4"></div>

//                     <MDBInput
//                         wrapperClass='mb-4'
//                         label='Tên đăng nhập'
//                         id='formControlLg'
//                         type='text'
//                         size="lg"
//                         onChange={e => change(e, 'username')}
//                     />
//                     <MDBInput
//                         wrapperClass='mb-4'
//                         label='Mật khẩu'
//                         id='formControlLg'
//                         type='password'
//                         size="lg"
//                         onChange={e => change(e, 'password')}
//                     />

//                     <div className="d-flex justify-content-between mb-4">
//                         <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me' />
//                         <a href="!#">Forgot password?</a>
//                     </div>

//                     <div className='text-center text-md-start mt-4 pt-2'>
//                         <MDBBtn className="mb-0 px-5" size='lg' onClick={login}>Login</MDBBtn>
//                         <p className="small fw-bold mt-2 pt-1 mb-2">Don't have an account? <a href="register" className="link-danger">Register</a></p>
//                     </div>
//                 </MDBCol>
//             </MDBRow>
//         </MDBContainer>
//     );
// }

// export default Login;
