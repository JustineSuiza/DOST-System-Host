import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import EditUserModal from './EditUserModal';
import { Tooltip } from 'react-tooltip';

const PasswordCell = ({ password }) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="d-flex align-items-center justify-content-between">
            <span>{showPassword ? password : '*'.repeat(password.length)}</span>
            <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm ms-3" 
                onClick={toggleShowPassword}
            >
                {showPassword ? (
                    <i className="fa fa-eye-slash" aria-hidden="true"></i>
                ) : (
                    <i className="fa fa-eye" aria-hidden="true"></i>
                )}
            </button>
        </div>
    );
};

const Users = ({ sidebarExpanded }) => {
    const [users, setUsers] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filterValue, setFilterValue] = useState('');

    useEffect(() => {
        getUsers();
    }, []);

    const refreshData = () => {
        getUsers();
    };

    const getUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/Accounts');
            setUsers(response.data);
            // console.log("Users fetched:", response.data);
        } catch (error) {
            // console.error('Error fetching users:', error);
        }
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/Accounts/${id}`);
            getUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEditModalOpen = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleApproved = async (id) => {
        try {
            console.log(`Approving user with ID: ${id}`);
    
            // Fetch the current user details
            const response = await axios.get(`http://localhost:8080/Accounts/${id}`);
    
            if (response.status === 200) {
                const { first_name, last_name, username, password, email } = response.data;
    
                // Update the user_lvl to '1' using the fetched values
                const updatedUser = {
                    user_lvl: '1',
                    first_name,
                    last_name,
                    // username,
                    password,
                    email
                };
    
                // Send the PUT request to update the user
                await axios.put(`http://localhost:8080/Accounts/${id}`, updatedUser);
    
                console.log(`User with ID ${id} approved successfully.`);
                
                // Refresh the users list after approval
                getUsers();
            } else {
                console.error(`Failed to fetch user with ID: ${id}. Status code: ${response.status}`);
            }
        } catch (error) {
            console.error('Error approving user:', error.response ? error.response.data : error.message);
        }
    };
    
    function formatDate(timestamp) {
        const date = new Date(timestamp);
        // Convert the date to local timezone
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        // Format the date
        const formattedDate = localDate.toLocaleString();
        return formattedDate;
    }

    const filteredUsers = users.filter((row) =>
        Object.values(row).some(
            (value) =>
                value &&
                value.toString().toLowerCase().includes(filterValue.toLowerCase())
        )
    );

    const columns = [
        { name: 'No.', selector: (row, index) => index + 1, sortable: true, width: '80px' },
        { name: 'First Name', selector: (row) => row.first_name, sortable: true, wrap: true },
        { name: 'Last Name', selector: (row) => row.last_name, sortable: true, wrap: true },
        { name: 'Password', selector: (row) => row.password, sortable: true, wrap: true, cell: row => <PasswordCell password={row.password} /> },
        { name: 'Email', selector: (row) => row.email, sortable: true, wrap: true },
        { name: 'User Level', selector: (row) => row.user_lvl, sortable: true, wrap: true },
        { name: 'Date Created', selector: (row) => formatDate(row.created_at), sortable: true, wrap: true },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="dropdown">
                <button className="btn btn-outline rounded-circle" style={{ paddingInline: '11px' }} type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="fa-solid fa-ellipsis"></i>
                </button>
                <ul className="dropdown-menu border-0 p-0 m-0 h-auto w-auto shadow-lg text-start">
                    <li className='m-1 notif-item' style={{ width: '210px' }} onClick={() => handleEditModalOpen(row)}>
                        <div className=" d-flex align-items-center">
                            <div className='p-1 px-2 pt-1 me-1'>
                                <i className="bi bi-pencil-square fs-5"></i>
                            </div>
                            <div className='d-flex flex-column float'>
                                <div className='fw-medium' style={{ fontSize: '13px', paddingTop: '2px' }}>Edit</div>
                            </div>
                        </div>
                    </li>
                    <li className='m-1 notif-item' style={{ width: '210px' }} data-bs-toggle="modal" data-bs-target="#archiveModal" onClick={() => deleteUser(row.id)}>
                        <div className=" d-flex align-items-center">
                            <div className='p-1 px-2 pt-1 me-1'>
                                <i className="bi bi-trash fs-5 text-danger"></i>
                            </div>
                            <div className='d-flex flex-column float'>
                                <div className='fw-medium text-danger' style={{ fontSize: '13px', paddingTop: '2px' }}>Delete</div>
                            </div>
                        </div>
                    </li>
                    {row.user_lvl === '2' && (
                        <li className='m-1 notif-item' style={{ width: '210px' }}  onClick={() => handleApproved(row.id)}>
                            <div className=" d-flex align-items-center">
                                <div className='p-1 px-2 pt-1 me-1'>
                                    <i className="bi bi-trash fs-5 text-success"></i>
                                </div>
                                <div className='d-flex flex-column float'>
                                    <div className='fw-medium text-success' style={{ fontSize: '13px', paddingTop: '2px' }}>Approve Account</div>
                                </div>
                            </div>
                        </li>
                    )}
                </ul>
            </div>
            ),
            width: '240px'
        },
    ];
    

    return (
        <article className='pt-5 pb-5 pe-5'>
            <EditUserModal 
                isEditModalOpen={isEditModalOpen}
                closeModal={() => setIsEditModalOpen(false)}
                user={selectedUser}  // Changed from users to user
                refresh={getUsers} 
            />

            <div className="d-flex justify-content-between align-items-center">
                <label className='h5 fw-semibold pt-2'>Accounts</label>
                <div className="d-flex align-items-center">
                {/* <AddUserModal
                isAddModalOpen={isAddModalOpen}
                closeModal={() => setIsAddModalOpen(false)}
                refresh={getUsers} 
            /> */}
                    <div className='sample me-3 refreshTooltip' style={{ borderRadius: '50px', padding: '7px 2px 2px 2px' }}>
                        <Tooltip anchorSelect=".refreshTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                            Refresh
                        </Tooltip>
                        <button type="button" className="btn border-0" onClick={refreshData} data-bs-toggle="tooltip" data-bs-title="Refresh">
                            <i className="fa-solid fa-sync fs-5"></i>
                        </button>
                    </div>
                </div>
            </div>

            

            <DataTable
                columns={columns}
                data={filteredUsers}
                pagination
                responsive
                highlightOnHover
                striped
                className='pt-5'
                style={{ paddingLeft: sidebarExpanded ? '300px' : '150px', transition: 'padding-left 0.3s' }}
            />
        </article>
    );
};

export default Users;
