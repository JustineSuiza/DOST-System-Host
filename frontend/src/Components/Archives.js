import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';

const Archives = () => {
    const [archiveData, setArchiveData] = useState([]);

    useEffect(() => {
        // Fetch archived data from the backend when the component mounts
        fetchArchiveData();
    }, []);

    const fetchArchiveData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/ArchiveProposals'); // Replace with your actual endpoint

            // Modify the data to set the 'type' value to 'Proposals'
            const modifiedData = response.data.map(item => ({
                ...item,
                type: 'Proposals'
            }));

            setArchiveData(modifiedData);
        } catch (error) {
            console.error('Error fetching archived data:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/ArchiveProposals/${id}`); // Replace with your actual delete endpoint
            // After successful deletion, remove the deleted item from archiveData
            setArchiveData(prevData => prevData.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting archived data:', error);
        }
    };

    const handleUnarchive = async (item) => {
        try {
            // Send a POST request to the backend to move the item back to Proposals table
            await axios.post('http://localhost:8080/Proposals', item); // Replace with your actual endpoint
            // After successful unarchiving, delete the item from the archive
            await handleDelete(item.id);
        } catch (error) {
            console.error('Error unarchiving data:', error);
        }
    };

    return (
        <div>
            {/* <div className='samplee mx-3' style={{ borderRadius: '10px', padding: '7px 2px 2px 2px' }}>
                <button type="button" className="btn border-0 w-100" data-bs-toggle="modal" data-bs-target="#archive">
                    <i className="fa-solid fa-box-archive fs-5"></i>
                </button>

            </div> */}
            <li className="sidebar-item">
                <a type='button' className={`sidebar-link`} data-bs-toggle="modal" aria-expanded="false" data-bs-target="#archive">
                  <i className="fa-solid fa-box-archive fs-5" style={{ color: 'transparent' }}></i>
                  <label>Archive</label>
                </a>
            </li>
            {ReactDOM.createPortal(
            <div className="modal fade" id="archive" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
                    <div className="modal-content p-2">
                        <div className="modal-header border-0">
                            <h5 className="modal-title fw-semibold" style={{ fontSize: '18px' }}>Archived Projects</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Project Name</th>
                                        <th scope="col">Date Archived</th>
                                        <th scope="col">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {archiveData.map((item, index) => (
                                        <tr key={index}>
                                            <td className='w-50'>{item.projectTitle}</td>
                                            <td>{item.created_at}</td> 
                                            <td>{item.type}</td> 
                                            <td style={{ width: '10px' }}><i className="bi bi-box-arrow-up text-primary" style={{ cursor: 'pointer' }} onClick={() => handleUnarchive(item)}></i></td>
                                            <td><i className="bi bi-trash-fill text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDelete(item.id)}></i></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-outline px-3 py-2 border text-black" data-bs-dismiss="modal" style={{ fontSize: '14px' }}>Cancel</button>
                            <button className="btn btn-dark px-3 py-2 border" style={{ fontSize: '14px' }} data-bs-dismiss="modal">Done</button>
                        </div>
                    </div>
                </div>
            </div>,
                document.body
            )}
        </div>
    );
};

export default Archives;
