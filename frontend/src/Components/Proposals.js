import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import * as XLSX from 'xlsx';
import './Proposals.css'
import FilterProposalModal from './FilterProposalModal';
import EditProposalModal from './EditProposalModal';
import AddProposalModal from './AddProposalModal';
import { Tooltip } from 'react-tooltip';

const Proposals = ({ sidebarExpanded }) => {
    const [originalInfo, setOriginalInfo] = useState([]);
    const [info, setInfo] = useState([]);
    const [filterValue, setFilterValue] = useState('');
    const [nearProposals, setNearProposals] = useState([]);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [availableYears, setAvailableYears] = useState([]);
    const [availableISP, setAvailableISP] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [dueProposals, setDueProposals] = useState([]);

    const [idToDelete, setIdToDelete] = useState(null);

    useEffect(() => {
        getInfo();
    }, []);

    const getInfo = async () => {
        const response = await axios.get('http://localhost:8080/Proposals');
        setOriginalInfo(response.data);
        setInfo(response.data);
        checkNearProposals(response.data);
        fetchAvailableYears(response.data);
        fetchAvailableISPs(response.data);
    };

    let totalProposals = [];
    let approvedProposals = [];
    let disapprovedProposals = [];
    let resubmissionProposals = [];
    let underEvaluationProposals = [];
    let revisionProposals = [];

    if (info.length > 0) {
        totalProposals = info.length;
        approvedProposals = info.filter((project) => project.remarks === 'Approved');
        disapprovedProposals = info.filter((project) => project.remarks === 'Disapproved');
        resubmissionProposals = info.filter((project) => project.remarks === 'Resubmission');
        underEvaluationProposals = info.filter((project) => project.remarks === 'Under Evaluation');
        revisionProposals = info.filter((project) => project.remarks === 'Revision');
    }

    const refreshData = () => {
        getInfo();
    };

    const handleDeleteClick = (id) => {
        setIdToDelete(id);
    };

    const deleteProduct = async () => {
        try {
            if (idToDelete) {
                console.log('Deleting product with ID:', idToDelete); // Log the ID to verify it
                const response = await axios.get(`http://localhost:8080/Proposals/${idToDelete}`);
                const deletedItemData = response.data;
    
                await axios.post('http://localhost:8080/ArchiveProposals', deletedItemData);
    
                await axios.delete(`http://localhost:8080/Proposals/${idToDelete}`);
    
                getInfo();
                setIdToDelete(null);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };        

    const handleFilterChange = (e) => {
        setFilterValue(e.target.value);
    };

    const checkNearProposals = (data) => {
        const currentDate = new Date('12-21-2022');
        const nearDue = data.filter((proposal) => {
            const proposalReceivedDate = new Date(proposal.date);
            const deadlineDate = new Date(proposalReceivedDate);
            deadlineDate.setDate(deadlineDate.getDate() + 40);
            const timeDiff = deadlineDate.getTime() - currentDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return daysDiff >= 0 && daysDiff <= 10;
        });
    
        setNearProposals(nearDue);
    };

    const checkDueProposals = (data) => {
        const currentDate = new Date();
        const due = data.filter((proposal) => {
            const proposalReceivedDate = new Date(proposal.date);
            const deadlineDate = new Date(proposalReceivedDate);
            deadlineDate.setDate(deadlineDate.getDate() + 40);
            const timeDiff = deadlineDate.getTime() - currentDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return daysDiff < 0;
        });
    
        setDueProposals(due);
    };

    const calculateDueDate = (receivedDate) => {
        const proposalReceivedDate = new Date(receivedDate);
        const deadlineDate = new Date(proposalReceivedDate);
        deadlineDate.setDate(deadlineDate.getDate() + 40);
        return deadlineDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const calculateDaysUntilDue = (receivedDate) => {
        const currentDate = new Date();
        const proposalReceivedDate = new Date(receivedDate);
        const deadlineDate = new Date(proposalReceivedDate);
        deadlineDate.setDate(deadlineDate.getDate() + 40);
        
        const timeDiff = deadlineDate.getTime() - currentDate.getTime();
        
        return Math.abs(Math.ceil(timeDiff / (1000 * 3600 * 24)));
    };


    const fetchAvailableYears = (data) => {
        const years = [...new Set(data.map(item => new Date(item.date).getFullYear()))];
        setAvailableYears(years);
    };

    const fetchAvailableISPs = (data) => {
        const isps = [...new Set(data.map(item => item.ISP))]
            .filter(isp => isp); // Filters out any falsy values like null or undefined
        isps.sort(); // Sort alphabetically
        setAvailableISP(isps); // Assuming setAvailableISPs is a state setter function
    };   

    useEffect(() => {
        checkNearProposals(originalInfo);
        checkDueProposals(originalInfo);
        fetchAvailableYears(originalInfo);
    }, [originalInfo]);

    const allPendingProposals = [...nearProposals, ...dueProposals];

    const filteredData = info.filter((row) =>
        Object.values(row).some(
            (value) =>
                value &&
                value.toString().toLowerCase().includes(filterValue.toLowerCase())
        )
    );

    const applyFilter = (filterData) => {
        const { ISP, programTitle, responsiblePerson, implementingAgency, funding, leadTRD, quarter, date, remarks } = filterData;
    
        const filteredData = originalInfo.filter((row) => {
            const rowYear = new Date(row.date).getFullYear();
            const remarkMatches = !remarks || remarks.length === 0 || remarks.includes(row.remarks); // Check if remark matches the filter
    
            return (!ISP || ISP.length === 0 || ISP.includes(row.ISP)) &&
                (!programTitle || row.programTitle.toLowerCase().includes(programTitle.toLowerCase())) &&
                (!responsiblePerson || row.responsiblePerson.toLowerCase().includes(responsiblePerson.toLowerCase())) &&
                (!implementingAgency || row.implementingAgency.toLowerCase().includes(implementingAgency.toLowerCase())) &&
                (!funding || funding.length === 0 || funding.includes(row.funding)) &&
                (!leadTRD || row.leadTRD.toLowerCase().includes(leadTRD.toLowerCase())) &&
                (!quarter || row.quarter.toLowerCase().includes(quarter.toLowerCase())) &&
                (!date || date.length === 0 || date.includes(rowYear)) &&
                remarkMatches; // Include row only if the remark matches the filter
        });
    
        setInfo(filteredData);
    };    

    const handleEditModalOpen = (proposal) => {
        setSelectedProposal(proposal);
        setIsEditModalOpen(true);
    };

    const columns = [
        { name: 'No.', selector: (row, index) => index + 1, sortable: true, width: '80px' },
        { name: 'ISP', selector: (row) => row.ISP, sortable: true, wrap: true },
        { name: 'Program Title', selector: (row) => row.programTitle, sortable: true, wrap: true },
        { name: 'Project Title', selector: (row) => row.projectTitle, sortable: true, wrap: true },
        { name: 'Responsible Person', selector: (row) => row.responsiblePerson, sortable: true },
        { name: 'Implementing Agency', selector: (row) => row.implementingAgency, sortable: true },
        { name: 'Project Leader', selector: (row) => row.programLeader, sortable: true },
        { name: 'Lead TRD', selector: (row) => row.leadTRD, sortable: true },
        { name: 'Funding', selector: (row) => row.funding, sortable: true },
        { name: 'Quarter', selector: (row) => row.quarter, sortable: true },
        { name: 'Date', selector: (row) => row.date, sortable: true },
        { name: 'Remarks', selector: (row) => row.remarks, sortable: true, wrap: true },  
        {
            name: 'Actions',
            cell: (row) => (
              <>
                {/* <button onClick={() => handleEditModalOpen(row)} className='btn btn-sm btn-success mx-1'>
                    <i className="bi bi-pencil-square"></i>
                </button> */}
                {/* <button onClick={() => deleteProduct(row.id)} className='btn btn-sm btn-danger'>
                    <i className="bi bi-archive"></i>
                </button> */}
                <div className="dropdown">
                    <button className="btn btn-outline rounded-circle" style={{ paddingInline: '11px' }} type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="fa-solid fa-ellipsis"></i>
                    </button>
                    <ul className="dropdown-menu border-0 p-0 m-0 h-auto w-auto shadow-lg text-start">
                        <li className='m-1 notif-item' style={{ width: '200px' }} onClick={() => handleEditModalOpen(row)}>    
                            <div className=" d-flex align-items-center">
                                <div className='p-1 px-2 pt-1 me-1'>
                                    <i className="bi bi-pencil-square fs-5"></i>
                                </div>
                                <div className='d-flex flex-column float'>
                                    <div className='fw-medium' style={{ fontSize: '13px', paddingTop: '2px' }}>Edit</div>
                                </div>
                            </div>
                        </li>
                        <li className='m-1 notif-item' style={{ width: '200px' }} data-bs-toggle="modal" data-bs-target="#archiveModal" onClick={() => handleDeleteClick(row.id)}>    
                            <div className=" d-flex align-items-center">
                                <div className='p-1 px-2 pt-1 me-1'>
                                <i className="bi bi-archive fs-5 text-danger"></i>
                                </div>
                                <div className='d-flex flex-column float'>
                                    <div className='fw-medium text-danger' style={{ fontSize: '13px', paddingTop: '2px' }}>Archive</div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
              </>
            ),
            width: '160px'
        },
    ];

    const exportToExcel = () => {
        const fileType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        const fileName = 'Proposals Evaluated';
    
        const exportData = filteredData.map((row, index) => ({
            'No.': index + 1,
            'ISP': row.ISP,
            'Program Title': row.programTitle,
            'Project Title': row.projectTitle,
            'Responsible Person': row.responsiblePerson,
            'Implementing Agency': row.implementingAgency,
            'Program/Project Leader': row.implementingAgency,
            'Lead TRD': row.leadTRD,
            'Funding': row.funding,
            'Quarter': row.quarter,
            'Date': row.date,
            'Remarks': row.remarks,
        }));
    
        const ws = XLSX.utils.json_to_sheet(exportData);
    
        ws["!cols"] = [{ wpx: 80 }, { wpx: 120 }, { wpx: 120 }, { wpx: 120 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }, { wpx: 100 }, { wpx: 100 }, { wpx: 120 }, { wpx: 200 }];
        ws["!rows"] = [{ hidden: false, hpx: 25 }];
    
        const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName + fileExtension;
        a.click();
    };
    
    const handleProjectClick = (clickedProjectId) => {
        const filteredData = originalInfo.filter((row) => row.id === clickedProjectId);
        setInfo(filteredData);
    };

    return (
        <article className='pt-5 pb-5 pe-5'>

            <EditProposalModal 
                isEditModalOpen={isEditModalOpen}
                closeModal={() => setIsEditModalOpen(false)}
                proposal={selectedProposal}
                refresh={refreshData} 
            />

            <div className="modal fade" id="archiveModal" tabIndex="-1" aria-labelledby="exampleModalLabel" data-bs-backdrop="static" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content p-2">
                    <div className="modal-header border-0">
                        <h5 className="modal-title fw-semibold" style={{ fontSize: '18px' }} id="exampleModalLabel">Archive Project?</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <label>Archiving this project will remove it from the active list, but you can restore it later if needed.</label>
                    </div>
                    <div className="modal-footer border-0">
                        <button type="button" className="btn btn-outline px-3 py-2 border text-black" data-bs-dismiss="modal" style={{ fontSize: '14px' }}>Cancel</button>
                        <button type="button" className="btn btn-dark px-3 py-2 border" data-bs-dismiss="modal" style={{ fontSize: '14px' }} onClick={deleteProduct}>Archive</button>
                    </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center">
                <label className='h5 fw-semibold pt-2'>Proposals</label>
                <div className="d-flex align-items-center">
                    <div className="me-4">
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search..."
                                value={filterValue}
                                onChange={handleFilterChange}
                            />
                            {filterValue && (
                                <button
                                    className="btn btn-close"
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: '10px',
                                        transform: 'translateY(-50%)',
                                        zIndex: '1',
                                    }}
                                    onClick={() => setFilterValue('')}
                                >
                                </button>
                            )}
                        </div>
                    </div>
                    <FilterProposalModal
                        applyFilter={applyFilter}
                        availableYears={availableYears}
                        availableISP={availableISP}
                    />
                    <AddProposalModal
                        refresh={refreshData} 
                    />
                    <div className='sample me-3 notifTooltip' style={{ borderRadius: '50px', padding: '7px 2px 2px 2px' }}>
                        <Tooltip anchorSelect=".notifTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                            Pending Proposal
                        </Tooltip>
                        <button type="button" className="btn border-0 position-relative" style={{ width: '40px' }} data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="fa-solid fa-bell fs-5"></i>
                            {nearProposals.length > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ border: '4px solid #F5F5F5' }}>
                                    {nearProposals.length}
                                    <span className="visually-hidden">unread messages</span>
                                </span>
                            )}
                        </button>
                        <ul className="dropdown-menu dropdown-menu-lg-end border-0 p-0 w-25 h-auto shadow-lg">
                            <li>
                                <h5 className='p-3 fw-bold'>Notifications</h5>
                                {allPendingProposals.length > 0 ? (
                                    <div className='dropdown-scrollable'>
                                        <ul className='p-0'>
                                            <li>
                                                <h6 className='p-2 ms-2 fw-bold'>Near Due Proposals</h6>
                                                {nearProposals.length > 0 ? (
                                                    nearProposals.map((proposal, index) => (
                                                        <div className='notif-item my-2 mx-2' key={index} onClick={() => handleProjectClick(proposal.id)}>
                                                            <div className=" ps-3 py-2 d-flex align-items-center">
                                                                <div className='px-2 me-4' style={{ borderRadius: '50%', backgroundColor: '#FFCDD2', padding: '3px' }}>
                                                                    <i className="fa-solid fa-circle-exclamation text-danger" style={{ marginTop: '5px' }}></i>
                                                                </div>
                                                                <div className='d-flex flex-column float'>
                                                                    <div className='fw-semibold'>{proposal.projectTitle}</div>
                                                                    <div className='mt-1'>
                                                                        {` 
                                                                            ${calculateDaysUntilDue(proposal.date) === 0 ? 'Due Today' : 
                                                                            'Due in ' + calculateDaysUntilDue(proposal.date) + ' days ' + 
                                                                            '(' + calculateDueDate(proposal.date) + ')'}
                                                                        `}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className='p-3 text-center'>
                                                        No near due proposals
                                                    </div>
                                                )}
                                            </li>
                                            <li>
                                                <h6 className='p-2 mt-3 ms-2 fw-bold'>Due Proposals</h6>
                                                {dueProposals.length > 0 ? (
                                                    dueProposals.map((proposal, index) => (
                                                        <div className='notif-item my-2 mx-2' key={index} onClick={() => handleProjectClick(proposal.id)}>
                                                            <div className=" ps-3 py-2 d-flex align-items-center">
                                                                <div className='p-1 px-2 me-4' style={{ borderRadius: '50%', backgroundColor: '#E0E0E0' }}>
                                                                    <i className="bi bi-file-earmark-fill"></i>
                                                                </div>
                                                                <div className='d-flex flex-column float'>
                                                                    <div className='fw-semibold'>{proposal.projectTitle}</div>
                                                                    <div className='mt-1'>
                                                                        {` 
                                                                            ${calculateDaysUntilDue(proposal.date) === 0 ? 'Due Today' : 
                                                                            'Due ' + calculateDaysUntilDue(proposal.date) + ' days ago ' + 
                                                                            '(' + calculateDueDate(proposal.date) + ')'}
                                                                        `}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className='p-3 text-center'>
                                                        No due proposals
                                                    </div>
                                                )}
                                            </li>
                                        </ul>
                                    </div>
                                
                                ) : (
                                    <div className='p-3 text-center'>
                                        No proposals pending 
                                    </div>
                                )}
                            </li>
                        </ul>
                    </div>
                    <div className='sample me-3 refreshTooltip' style={{ borderRadius: '50px', padding: '7px 2px 2px 2px' }}>
                        <Tooltip anchorSelect=".refreshTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                            Refresh
                        </Tooltip>
                        <button type="button" className="btn border-0" onClick={refreshData} data-bs-toggle="tooltip" data-bs-title="Refresh">
                            <i className="fa-solid fa-sync fs-5"></i>
                        </button>
                    </div>
                    <div className='sample me-3 excelTooltip' style={{ borderRadius: '50px', padding: '7px 2px 2px 2px' }}>
                        <Tooltip anchorSelect=".excelTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                            Export to .xlxs
                        </Tooltip>
                        <button type="button" className="btn border-0" onClick={exportToExcel} data-bs-toggle="tooltip" data-bs-title="Export to Excel">
                            <i className="fa-solid fa-file-excel fs-5"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className='row row-cols-lg-6 g-3 pt-4'>
                <div className='col'>
                <div className='card radius-10 border'>
                    <div className='card-body' style={{ padding: '25px 20px 25px 35px' }}>
                    <div className='d-flex align-items-center'>
                        <div className='' style={{ backgroundColor: '#EEEEEE', borderRadius: '50px', padding: '10px' }}>
                        <i className='fa-solid fa-equals fs-5 p-1' style={{ color: '#ooo' }}></i>
                        </div>
                        <div className='ps-4 text-truncate'>
                        <p className='mb-0 text-dark fs-4 fw-bold'>{totalProposals}</p>
                        <p className='text-secondary h6' style={{ fontSize: '15px' }}>Total Proposals</p>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                <div className='col'>
                <div className='card radius-10 border'>
                    <div className='card-body' style={{ padding: '25px 20px 25px 35px' }}>
                    <div className='d-flex align-items-center'>
                        <div className='' style={{ backgroundColor: '#E8F5E9', borderRadius: '50px', padding: '10px' }}>
                        <i className='fa-regular fa-circle-check fs-5 p-1' style={{ color: '#4CAF50' }}></i>
                        </div>
                        <div className='ps-4 text-truncate'>
                        <p className='mb-0 text-dark fs-4 fw-bold'>{approvedProposals.length} ({((approvedProposals.length / totalProposals) * 100).toFixed()}%)</p>
                        <p className='text-secondary h6' style={{ fontSize: '15px' }}>Approved Proposals</p>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                <div className='col'>
                <div className='card radius-10 border'>
                    <div className='card-body' style={{ padding: '25px 20px 25px 35px' }}>
                    <div className='d-flex align-items-center'>
                        <div className='' style={{ backgroundColor: '#FFEBEE', borderRadius: '50px', padding: '10px' }}>
                        <i className='fa-solid fa-ban fs-5 p-1' style={{ color: '#F44336' }}></i>
                        </div>
                        <div className='ps-4 text-truncate'>
                        <p className='mb-0 text-dark fs-4 fw-bold'>{disapprovedProposals.length} ({((disapprovedProposals.length / totalProposals) * 100).toFixed()}%)</p>
                        <p className='text-secondary h6' style={{ fontSize: '15px' }}>Disapproved Proposals</p>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                <div className='col'>
                <div className='card radius-10 border'>
                    <div className='card-body' style={{ padding: '25px 20px 25px 35px' }}>
                    <div className='d-flex align-items-center'>
                        <div className='' style={{ backgroundColor: '#FFF3E0', borderRadius: '50px', padding: '10px' }}>
                        <i className='fa-solid fa-repeat fs-5 p-1' style={{ color: '#FF9800' }}></i>
                        </div>
                        <div className='ps-4 text-truncate'>
                        <p className='mb-0 text-dark fs-4 fw-bold'>{resubmissionProposals.length} ({((resubmissionProposals.length / totalProposals) * 100).toFixed()}%)</p>
                        <p className='text-secondary h6' style={{ fontSize: '15px' }}>Resubmission Proposals</p>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                <div className='col'>
                <div className='card radius-10 border'>
                    <div className='card-body' style={{ padding: '25px 20px 25px 35px' }}>
                    <div className='d-flex align-items-center'>
                        <div className='' style={{ backgroundColor: '#E1F5FE', borderRadius: '50px', padding: '10px', paddingInline: '12px' }}>
                        <i className='fa-solid fa-file-lines fs-5 p-1' style={{ color: '#03A9F4' }}></i>
                        </div>
                        <div className='ps-4 text-truncate'>
                        <p className='mb-0 text-dark fs-4 fw-bold'>{underEvaluationProposals.length} ({((underEvaluationProposals.length / totalProposals) * 100).toFixed()}%)</p>
                        <p className='text-secondary h6' style={{ fontSize: '15px' }}>Under Evaluation Proposals</p>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                <div className='col'>
                <div className='card radius-10 border'>
                    <div className='card-body' style={{ padding: '25px 20px 25px 35px' }}>
                    <div className='d-flex align-items-center'>
                        <div className='' style={{ backgroundColor: '#D1C4E9', borderRadius: '50px', padding: '10px' }}>
                        <i className='fa-solid fa-file-pen fs-5 p-1 pe-0' style={{ color: '#673AB7' }}></i>
                        </div>
                        <div className='ps-4 text-truncate'>
                        <p className='mb-0 text-dark fs-4 fw-bold'>{revisionProposals.length} ({((revisionProposals.length / totalProposals) * 100).toFixed()}%)</p>
                        <p className='text-secondary h6' style={{ fontSize: '15px' }}>Revision Proposals</p>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredData}
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

export default Proposals;
