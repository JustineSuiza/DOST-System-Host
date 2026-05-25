import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Modal.css'

const EditUserProfile = ({ isEditModalOpen, closeModal, user, refresh }) => {

    const [first_name, setFirstname] = useState('');
    const [last_name, setLastname] = useState('');
    // const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [user_lvl, setUserlvl] = useState('');

    const [showToast, setShowToast] = useState(false);
    const [toastTimeout, setToastTimeout] = useState(null);

    useEffect(() => {
        if (user) {
            setFirstname(user.first_name);
            setLastname(user.last_name);
            // setUsername(user.username);
            setPassword(user.password);
            setEmail(user.email);
            setUserlvl(user.user_lvl);
        }
    }, [user]);

    const updateUser = async (e) => {
        e.preventDefault();
    
        const isChanged =
        first_name !== user.first_name ||
        last_name !== user.last_name ||
        // username !== user.username ||
        password !== user.password ||
        email !== user.email ||
        user_lvl !== user.user_lvl;
    
        if (!isChanged) {
            setShowToast(true);
            if (toastTimeout) {
                clearTimeout(toastTimeout);
            }
            const timeout = setTimeout(() => {
                setShowToast(false);
            }, 5000);
            setToastTimeout(timeout);
            return;
        }
    
        try {
            await axios.patch(`http://localhost:8080/Accounts/${user.id}`, {
                first_name: first_name,
                last_name: last_name,
                // username: username,
                password: password,
                email: email,
                user_lvl: user_lvl,
            });
            console.log('User updated successfully');
            // Update the localStorage with the new first name
            localStorage.setItem('first_name', first_name);
            closeModal();
            refresh();
            // Refresh the page
            window.location.reload();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    return (
        <div>
            <form onSubmit={updateUser}>
                <div className={`modal fade modal-overlay ${isEditModalOpen ? 'show' : ''}`} tabIndex="-1" style={{ display: isEditModalOpen ? 'block' : 'none' }}>
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content p-2">
                            <div className="modal-header border-0">
                                <h1 className="modal-title fw-semibold" style={{ fontSize: '18px' }}>Edit User</h1>
                                <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
                                <div
                                    className="toast position-absolute top-10 start-50 translate-middle-x bg-danger"
                                    style={{ display: showToast ? 'block' : 'none' }}
                                    role="alert"
                                    aria-live="assertive"
                                    aria-atomic="true"
                                >
                                    <div className="d-flex">
                                        <div className="toast-body text-white">
                                            Nothing changed
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-body">
                            <div className="mb-3">
                                    <label className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={first_name}
                                        onChange={(e) => setFirstname(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={last_name}
                                        onChange={(e) => setLastname(e.target.value)}
                                    />
                                </div>
                                {/* <div className="mb-3">
                                    <label htmlFor="username" className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div> */}
                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">User Level</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={user_lvl}
                                        onChange={(e) => setUserlvl(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button type="button" className="btn btn-outline px-3 py-2 border text-black" onClick={closeModal} style={{ fontSize: '14px' }}>Cancel</button>
                                <button className="btn btn-dark px-3 py-2 border" style={{ fontSize: '14px' }}>Update</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditUserProfile;
