import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import * as XLSX from 'xlsx';
import { Tooltip } from 'react-tooltip';
import './Projects.css'
import EditProjectModal from './EditProjectModal';
import FilterProjectModal from './FilterProjectModal';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { useLocation } from "react-router-dom";
import AddProjectFilesModal from './AddProjectFilesModal';
import ImageModal from './ImageModal';
import FileModal from './FileModal';
import { pdfjs } from 'react-pdf';
import PdfModal from './PdfModal';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const Projects = ({ sidebarExpanded }) => {
    const [originalInfo, setOriginalInfo] = useState([]);
    const [info, setInfo] = useState([]);
    const [filterValue, setFilterValue] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddFileModalOpen, setIsAddFileModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [availableYears, setAvailableYears] = useState([]);
    const [availableISP, setAvailableISP] = useState([]);

    const [nearProposals, setNearProposals] = useState([]);
    const [dueProposals, setDueProposals] = useState([]);

    const [showToast, setShowToast] = useState(false);
    const [toastTimeout, setToastTimeout] = useState(null);

    const [showModal, setShowModal] = useState(false);

    const [fileUrl, setFileUrl] = useState('');

    const [idToDelete, setIdToDelete] = useState(null);

    const [activeScrollspy, setActiveScrollspy] = useState('scrollspyHeading1');

    const [selectedYear, setSelectedYear] = useState('');

    const [isImage, setIsImage] = useState(false);

    const location = useLocation();
    const state = location.state;

    const handleYearChange = (event) => {
        const year = event.target.value;
        setSelectedYear(year);
    };

    const openModal = async (fileType) => {
        try {
            let filename;
            if (fileType === 'implementation') {
                filename = selectedProject.fileData.implementationFilename;
            } else if (fileType === 'extension') {
                filename = selectedProject.fileData.extensionFilename;
            } else if (fileType === 'realignment') {
                filename = selectedProject.fileData.realignmentFilename;
            }
    
            const response = await axios.get(`http://localhost:8080/GetFile/${filename}`, {
                responseType: 'blob'
            });
            const contentType = response.headers['content-type'];
    
            if (contentType.includes('pdf')) {
                const file = new Blob([response.data], { type: 'application/pdf' });
                const fileUrl = URL.createObjectURL(file);
                setFileUrl(fileUrl);
                setIsImage(false);
                setShowModal(true);
            } else if (contentType.includes('image')) {
                const imageUrl = URL.createObjectURL(response.data);
                setFileUrl(imageUrl);
                setIsImage(true);
                setShowModal(true);
            } else {
                console.error('Unsupported file type');
            }
        } catch (error) {
            console.error('Error fetching file:', error);
        }
    };
    

    const showToastF = () => {
        setShowToast(true);
        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }
        const timeout = setTimeout(() => {
            setShowToast(false);
        }, 5000);
    }

    useEffect(() => {
        if (state) {
            setFilterValue(state);
        }
    }, [state]);

    useEffect(() => {
        getInfo();
    }, []);

    const getInfo = async () => {
        const response = await axios.get('http://localhost:8080/Projects/');
        setOriginalInfo(response.data);
        setInfo(response.data);
        fetchAvailableISPs(response.data);
        fetchAvailableYears(response.data);
        checkNearProposals(response.data);
    };

    const refreshData = () => {
        getInfo();
        setFilterValue('');
    };

    const handleDeleteClick = (id) => {
        setIdToDelete(id);
    };

    // const deleteProduct = async () => {
    //     try {
    //         if (idToDelete) {
    //             console.log('Deleting product with ID:', idToDelete);

    //             // Fetch all records related to the project
    //             const projectResponse = await axios.get(`http://localhost:8080/Projects/${idToDelete}`);
    //             const projectData = projectResponse.data;
    //             console.log('Project Data:');

    //             const releasesResponse = await axios.get(`http://localhost:8080/Releases/${idToDelete}`);
    //             const releasesData = releasesResponse.data;
    //             console.log(releasesData)

    //             const counterpartFundResponse = await axios.get(`http://localhost:8080/CounterpartFund/${idToDelete}`);
    //             const counterpartFundData = counterpartFundResponse.data;
    //             console.log(counterpartFundData)

    //             // Iterate over each projectData object
    //             projectData.forEach(async (project) => {
    //                 try {
    //                     // Make a POST request for each projectData object
    //                     const budget = Array.isArray(project.budget) ? project.budget : [];
    //                     await axios.post('http://localhost:8080/ArchiveProjects', {
    //                         ISP: project.ISP,
    //                         programTitle: project.programTitle,
    //                         projectTitle: project.projectTitle,
    //                         responsiblePerson: project.responsiblePerson,
    //                         funding: project.funding,
    //                         budget: budget.map(item => ({ year: item.year, amount: item.amount })),
    //                         totalBudget: project.totalBudget,
    //                         implementingAgency: project.implementingAgency,
    //                         programLeader: project.programLeader,
    //                         emailAddress: project.emailAddress,
    //                         contactNumber: project.contactNumber,
    //                         postalAddress: project.postalAddress,
    //                         cooperatingAgency: project.cooperatingAgency,
    //                         originalStart: project.originalStart,
    //                         originalEnd: project.originalEnd,
    //                         objectives: project.objectives,
    //                         description: project.description,
    //                         deliverables: project.deliverables,
    //                         beneficiaries: project.beneficiaries,
    //                         status: project.status,
    //                         remarks: project.remarks,
    //                     });

    //                     // Handle success or perform additional tasks
    //                     console.log('Project archived successfully:', project);
    //                 } catch (error) {
    //                     console.error('Error archiving project:', error);
    //                 }
    //             });
    //             projectData.forEach(async (project) => {
    //                 try {
    //                     // Make a POST request for each projectData object
    //                     const budget = Array.isArray(project.budget) ? project.budget : [];
    //                     await axios.patch(`http://localhost:8080/ArchiveProjects/${idToDelete}`, {
    //                         ISP: project.ISP,
    //                         programTitle: project.programTitle,
    //                         projectTitle: project.projectTitle,
    //                         responsiblePerson: project.responsiblePerson,
    //                         funding: project.funding,
    //                         budget: budget.map(item => ({ year: item.year, amount: item.amount })),
    //                         totalBudget: project.totalBudget,
    //                         implementingAgency: project.implementingAgency,
    //                         programLeader: project.programLeader,
    //                         emailAddress: project.emailAddress,
    //                         contactNumber: project.contactNumber,
    //                         postalAddress: project.postalAddress,
    //                         cooperatingAgency: project.cooperatingAgency,
    //                         originalStart: project.originalStart,
    //                         originalEnd: project.originalEnd,
    //                         changeStart: project.changeStart,
    //                         changeImplementationDate: project.changeImplementationDate,
    //                         firstExtension: project.firstExtension,
    //                         secondExtension: project.secondExtension,
    //                         objectives: project.objectives,
    //                         description: project.description,
    //                         deliverables: project.deliverables,
    //                         beneficiaries: project.beneficiaries,
    //                         dcY1Approval: project.dcY1Approval,
    //                         gcY1Approval: project.gcY1Approval,
    //                         execomY1Approval: project.execomY1Approval,
    //                         dcY2Renewal: project.dcY2Renewal,
    //                         gcY2Renewal: project.gcY2Renewal,
    //                         execomY2Renewal: project.execomY2Renewal,
    //                         dcY3Renewal: project.dcY3Renewal,
    //                         gcY3Renewal: project.gcY3Renewal,
    //                         execomY3Renewal: project.execomY3Renewal,
    //                         inceptionMeeting: project.inceptionMeeting,
    //                         mande: project.mande,
    //                         y1BudgetRealignment: project.y1BudgetRealignment,
    //                         y2BudgetRealignment: project.y2BudgetRealignment,
    //                         y3BudgetRealignment: project.y3BudgetRealignment,
    //                         programReview: project.programReview,
    //                         terminalReview: project.terminalReview,
    //                         status: project.status,
    //                         remarks: project.remarks,
    //                     });

    //                     // Handle success or perform additional tasks
    //                     console.log('Project archived successfully:', project);
    //                 } catch (error) {
    //                     console.error('Error archiving project:', error);
    //                 }
    //             });
    //             await axios.patch('http://localhost:8080/ArchiveReleases', releasesData);
    //             await axios.patch('http://localhost:8080/ArchiveCounterpartFund', counterpartFundData);

    //             // Delete related records first
    //             // await axios.delete(`http://localhost:8080/Releases/${idToDelete}`);
    //             // await axios.delete(`http://localhost:8080/CounterpartFund/${idToDelete}`);

    //             // // Then delete the project itself
    //             // await axios.delete(`http://localhost:8080/Projects/${idToDelete}`);

    //             // Refresh data after deletion
    //             getInfo();
    //             setIdToDelete(null);
    //         }
    //     } catch (error) {
    //         console.error('Error deleting product:', error);
    //     }
    // };

    const getProposalEndDate = (proposal) => {
        if (proposal.secondExtension) {
            // Extract the end date from the secondExtension range
            const extensionDates = proposal.secondExtension.split(' - ');
            return new Date(extensionDates[1]);
        } else if (proposal.firstExtension) {
            // Extract the end date from the firstExtension range
            const extensionDates = proposal.firstExtension.split(' - ');
            return new Date(extensionDates[1]);
        } else if (proposal.changeImplementationDate) {
            return new Date(proposal.changeImplementationDate);
        } else {
            return new Date(proposal.originalEnd);
        }
    };
    
    const checkNearProposals = (data) => {
        const currentDate = new Date('2024-06-10');
        const nearDue = data.filter((proposal) => {
            const proposalEndDate = getProposalEndDate(proposal);
            const timeDiff = proposalEndDate.getTime() - currentDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return daysDiff >= 0 && daysDiff <= 10;
        });
    
        setNearProposals(nearDue);
    };
    
    const checkDueProposals = (data) => {
        const currentDate = new Date('2024-06-10');
        const due = data.filter((proposal) => {
            const proposalEndDate = getProposalEndDate(proposal);
            const timeDiff = proposalEndDate.getTime() - currentDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return daysDiff < 0;
        });
    
        setDueProposals(due);
    };
    
    const calculateDueDate = (receivedDate) => {
        const proposalEndDate = new Date(receivedDate);
        return proposalEndDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    
    const calculateDaysUntilDue = (receivedDate) => {
        const currentDate = new Date('2024-06-10');
        const proposalEndDate = new Date(receivedDate);
        const timeDiff = proposalEndDate.getTime() - currentDate.getTime();
        return Math.abs(Math.ceil(timeDiff / (1000 * 3600 * 24)));
    };
    
    useEffect(() => {
        checkNearProposals(originalInfo);
        checkDueProposals(originalInfo);
    }, [originalInfo]);
    
    const allPendingProposals = [...nearProposals, ...dueProposals];
    

    const handleProjectClick = (clickedProjectId) => {
        const filteredData = originalInfo.filter((row) => row.id === clickedProjectId);
        setInfo(filteredData);
    };

    const handleFilterChange = (e) => {
        setFilterValue(e.target.value);
    };

    const filteredData = info.filter((row) =>
        Object.values(row).some(
            (value) =>
                (value && value.toString().toLowerCase().includes(filterValue.toLowerCase())) ||
                (row.releaseData && Object.values(row.releaseData).some(
                    releaseValue => releaseValue && releaseValue.toString().toLowerCase().includes(filterValue.toLowerCase())
                )) ||
                (row.counterpartFundData && Object.values(row.counterpartFundData).some(
                    counterpartValue => counterpartValue && counterpartValue.toString().toLowerCase().includes(filterValue.toLowerCase())
                )) ||
                (row.sixPSData && Object.values(row.sixPSData).some(
                    sixPSValue => sixPSValue && sixPSValue.toString().toLowerCase().includes(filterValue.toLowerCase())
                ))
        )
    );


    const applyFilter = (filterData) => {
        const { ISP, programTitle, responsiblePerson, funding, remarks, originalStart } = filterData;

        console.log('Filter Data:', filterData);

        const filteredData = originalInfo.filter((row) => {
            const rowStart = new Date(row.changeStart || row.originalStart).getFullYear(); // Use changeStart if available

            const matchesISP = !ISP || ISP.length === 0 || ISP.includes(row.ISP);
            const matchesProgramTitle = !programTitle || row.programTitle.toLowerCase().includes(programTitle.toLowerCase());
            const matchesResponsiblePerson = !responsiblePerson || row.responsiblePerson.toLowerCase().includes(responsiblePerson.toLowerCase());
            const matchesFunding = !funding || funding.length === 0 || funding.includes(row.funding);
            const matchesRemarks = !remarks || remarks.length === 0 || remarks.includes(row.remarks);
            const matchesYear = !originalStart || originalStart.length === 0 || originalStart.includes(rowStart);

            return matchesISP && matchesProgramTitle && matchesResponsiblePerson && matchesFunding && matchesRemarks && matchesYear;
        });

        console.log('Filtered Data:', filteredData);

        setInfo(filteredData);
    };

    const handleEditModalOpen = (project) => {
        setSelectedProject(project);
        setIsEditModalOpen(true);
    };

    const handleAddFileModalOpen = (project) => {
        setSelectedProject(project);
        setIsAddFileModalOpen(true);
    };

    const handleViewModal = (project) => {
        setSelectedProject(project);
    }

    function formatTime(timestamp) {
        const date = new Date(timestamp);
        // Convert the date to local timezone
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        // Format the date
        const formattedDate = localDate.toLocaleString();
        return formattedDate;
    }

    function formatDate(timestamp) {
        if (!timestamp) {
            return "";
        }
    
        // Split the timestamp by comma to handle multiple dates/ranges
        const dateParts = timestamp.split(", ");
        const formattedParts = dateParts.map(part => {
            let comment = "";
            let cleanPart = part;
    
            // Extract comment inside parentheses
            const commentMatch = part.match(/\(([^)]+)\)/);
            if (commentMatch) {
                comment = ` (${commentMatch[1]})`;
                cleanPart = part.replace(commentMatch[0], "").trim();
            }
    
            // Check if it's a range
            if (cleanPart.includes(" - ")) {
                const dates = cleanPart.split(" - ");
                if (dates.length === 2) {
                    return `${formatSingleDate(dates[0])} - ${formatSingleDate(dates[1])}${comment}`;
                }
            } else {
                return `${formatSingleDate(cleanPart)}${comment}`;
            }
        });
    
        return formattedParts.join(", <br />");
    }
    
    function formatSingleDate(dateStr) {
        const date = new Date(dateStr);
    
        if (isNaN(date.getTime())) {
            return dateStr; // Return the original string if the date is invalid
        }
    
        // Array of month names
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
    
        // Get the date components
        const year = date.getFullYear();
        const month = monthNames[date.getMonth()];
        const day = date.getDate();
    
        // Format the date as "Month Day, Year"
        const formattedDate = `${month} ${day.toString().padStart(2, '0')}, ${year}`;
    
        return formattedDate;
    }
    

    const columns = [
        { name: 'No.', selector: (row, index) => index + 1, sortable: true, width: '80px' },
        { name: 'ISP', selector: (row) => row.ISP, sortable: true, wrap: true, width: '100px' },
        { name: 'Program Title', selector: (row) => (<div style={{ height: '100px' }}>{row.programTitle}</div>), sortable: true, wrap: true, width: '180px' },
        { name: 'Project Title', selector: (row) => (<div style={{ height: '100px' }}>{row.projectTitle}</div>), sortable: true, wrap: true, width: '180px' },
        { name: (<div>Responsible Person</div>), selector: (row) => row.responsiblePerson, sortable: true, wrap: true, },
        { name: 'Funding', selector: (row) => row.funding, sortable: true, wrap: true },
        { name: (<div>Implementing Agency</div>), selector: (row) => row.implementingAgency, sortable: true, wrap: true, },
        { name: 'Program Leader', selector: (row) => row.programLeader, sortable: true, wrap: true, },
        {
            name: 'Duration',
            selector: (row) => {
                let startDate, endDate;
                if (!row.originalStart || !row.originalEnd) {
                    return ''; // Handle case where start or end date is missing
                }

                if (row.changeStart || row.changeImplementationDate) {
                    startDate = new Date(row.changeStart || row.originalStart);
                    endDate = new Date(row.changeImplementationDate || row.originalEnd);
                } else {
                    startDate = new Date(row.originalStart);
                    endDate = new Date(row.originalEnd);
                }

                const formatDateString = (date) => {
                    return date.toLocaleDateString('en-US', {
                        month: 'long',
                        day: '2-digit',
                        year: 'numeric'
                    });
                };

                const startDateString = formatDateString(startDate);
                const endDateString = formatDateString(endDate);

                let duration = `${startDateString} - ${endDateString}`;

                const appendExtension = (extension) => {
                    const [extensionStart, extensionEnd] = extension.split(' - ');
                    const extensionStartDate = new Date(extensionStart);
                    const extensionEndDate = new Date(extensionEnd);
                    if (!isNaN(extensionStartDate.getTime()) && !isNaN(extensionEndDate.getTime())) {
                        const extStartDateString = formatDateString(extensionStartDate);
                        const extEndDateString = formatDateString(extensionEndDate);
                        return ` (${extStartDateString} - ${extEndDateString})`;
                    }
                    return '';
                };

                if (row.secondExtension && !(row.changeStart || row.changeImplementationDate) || row.secondExtension && (row.changeStart || row.changeImplementationDate)) {
                    duration += ` (Second Extension: ${appendExtension(row.secondExtension)})`;
                } else if (row.firstExtension && !(row.changeStart || row.changeImplementationDate) || row.firstExtension && (row.changeStart || row.changeImplementationDate)) {
                    duration += ` (First Extension: ${appendExtension(row.firstExtension)})`;
                }

                return duration;
            },
            sortable: true,
            wrap: true,
            width: '150px'
        },
        {
            name: 'Remarks',
            selector: (row) => (
                <div className={`badge p-2 ${row.remarks === 'New' ? 'bg-warning' : row.remarks === 'Ongoing' ? 'bg-primary' : row.remarks === 'Completed' ? 'bg-success' : 'bg-danger'}`}>
                    {row.remarks}
                </div>
            ),
            sortable: true,
            wrap: true,
            width: '130px'
        },
        {
            name: 'Actions',
            cell: (row) => (
                <>
                    <div className="dropdown dropstart">
                        <button className="btn btn-outline rounded-circle" style={{ paddingInline: '11px' }} type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="fa-solid fa-ellipsis"></i>
                        </button>
                        <ul className="dropdown-menu border-0 p-0 m-0 h-auto w-auto shadow-lg text-start">
                            <li className='m-1 notif-item' style={{ width: '210px' }} data-bs-toggle="modal" data-bs-target="#viewModal" onClick={() => handleViewModal(row)}>
                                <div className=" d-flex align-items-center">
                                    <div className='p-1 px-2 pt-1 me-1'>
                                        <i className="bi bi-info-circle fs-5"></i>
                                    </div>
                                    <div className='d-flex flex-column'>
                                        <div className='fw-medium' style={{ fontSize: '13px', paddingTop: '2px' }}>View Project Details</div>
                                    </div>
                                </div>
                            </li>
                            <li className='m-1 notif-item' style={{ width: '210px' }}>
                                <Link to="/DOST/Budgets" state={row.projectTitle} className="text-black">
                                    <div className="d-flex align-items-center">
                                        <div className='p-1 px-2 pt-1 me-1'>
                                            <i className="bi bi-cash-coin fs-5"></i>
                                        </div>
                                        <div className='d-flex flex-column'>
                                            <div className='fw-medium' style={{ fontSize: '13px', paddingTop: '2px' }}>View Budget</div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                            <li className='m-1 notif-item' style={{ width: '210px' }}>
                                <Link to="/DOST/Releases" state={row.projectTitle} className="text-black">
                                    <div className="d-flex align-items-center">
                                        <div className='p-1 px-2 pt-1 me-1'>
                                            <i className="bi bi-r-circle fs-5"></i>
                                        </div>
                                        <div className='d-flex flex-column'>
                                            <div className='fw-medium' style={{ fontSize: '13px', paddingTop: '2px' }}>View Releases</div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                            <li className='m-1 notif-item' style={{ width: '210px' }}>
                                <Link to="/DOST/Counterpart-Funds" state={row.projectTitle} className="text-black">
                                    <div className="d-flex align-items-center">
                                        <div className='p-1 px-2 pt-1 me-1'>
                                            <i className="bi bi-wallet2 fs-5"></i>
                                        </div>
                                        <div className='d-flex flex-column'>
                                            <div className='fw-medium' style={{ fontSize: '13px', paddingTop: '2px' }}>View Counterpart Funds</div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
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
                            <li className='m-1 notif-item' style={{ width: '210px' }} onClick={() => handleAddFileModalOpen(row)}>
                                <div className=" d-flex align-items-center">
                                    <div className='p-1 px-2 pt-1 me-1'>
                                        <i className="bi bi-folder-plus fs-5"></i>
                                    </div>
                                    <div className='d-flex flex-column float'>
                                        <div className='fw-medium' style={{ fontSize: '13px', paddingTop: '2px' }}>Add/Update Files</div>
                                    </div>
                                </div>
                            </li>
                            {/* <li className='m-1 notif-item' style={{ width: '210px' }} data-bs-toggle="modal" data-bs-target="#archiveModal" onClick={() => handleDeleteClick(row.id)}>
                                <div className=" d-flex align-items-center">
                                    <div className='p-1 px-2 pt-1 me-1'>
                                        <i className="bi bi-archive fs-5 text-danger"></i>
                                    </div>
                                    <div className='d-flex flex-column float'>
                                        <div className='fw-medium text-danger' style={{ fontSize: '13px', paddingTop: '2px' }}>Archive</div>
                                    </div>
                                </div>
                            </li> */}
                        </ul>
                    </div>
                </>
            ),
            width: '100px'
        },
    ];

    const exportToExcel = () => {
        const fileType =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        const fileName = 'Projects';

        const exportData = filteredData.map((row, index) => ({
            'No.': index + 1,
            'ISP': row.ISP,
            'Program Title': row.programTitle,
            'Project Title': row.projectTitle,
            'Responsible Person': row.responsiblePerson,
            'Funding': row.funding,
            'Implementing Agency': row.implementingAgency,
            'Program Leader': row.programLeader,
            'Email Address': row.emailAddress,
            'Contact Number': row.contactNumber,
            'Postal Address': row.postalAddress,
            'Cooperating Agency': row.cooperatingAgency,
            'Original Start': row.originalStart,
            'Original End': row.originalEnd,
            'Change Start': row.changeStart,
            'Change of Implementation Date': row.changeImplementationDate,
            'First Extension': row.firstExtension,
            'Second Extension': row.secondExtension,
            'Objectives': row.objectives,
            'Description': row.description,
            'Deliverables': row.deliverables,
            'Beneficiaries': row.beneficiaries,
            'DC Y1 Approval': row.dcY1Approval,
            'GC Y1 Approval': row.gcY1Approval,
            'Execom Y1 Approval': row.execomY1Approval,
            'DC Y2 Renewal': row.dcY2Renewal,
            'GC Y2 Renewal': row.gcY2Renewal,
            'Execom Y2 Renewal': row.execomY2Renewal,
            'DC Y3 Renewal': row.dcY3Renewal,
            'GC Y3 Renewal': row.gcY3Renewal,
            'Execom Y3 Renewal': row.execomY3Renewal,
            'Inception Meeting': row.inceptionMeeting,
            'M&E': row.mande,
            'Y1 Budget Realignment': row.y1BudgetRealignment,
            'Y2 Budget Realignment': row.y2BudgetRealignment,
            'Y3 Budget Realignment': row.y3BudgetRealignment,
            'Program Review': row.programReview,
            'Terminal Review': row.terminalReview,
            'Status': row.status,
            'Remarks': row.remarks,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);

        const columnWidths = [
            { wch: 5 },
            { wch: 20 },
            { wch: 30 },
            { wch: 30 },
            { wch: 30 },
            { wch: 15 },
            { wch: 30 },
            { wch: 30 },
            { wch: 30 },
            { wch: 15 },
            { wch: 40 },
            { wch: 30 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 40 },
            { wch: 40 },
            { wch: 40 },
            { wch: 40 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 40 },
        ];

        ws['!cols'] = columnWidths;

        const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName + fileExtension;
        a.click();
    };

    const fetchAvailableYears = (data) => {
        const years = [...new Set(data.map(item => new Date(item.changeStart || item.originalStart).getFullYear()))] // Use changeStart if available
            .filter(year => !isNaN(year));
        years.sort((a, b) => a - b);
        setAvailableYears(years);
    };

    const fetchAvailableISPs = (data) => {
        const isps = [...new Set(data.map(item => item.ISP))]
            .filter(isp => isp); // Filters out any falsy values like null or undefined
        isps.sort(); // Sort alphabetically
        setAvailableISP(isps); // Assuming setAvailableISPs is a state setter function
    };    

    const downloadWordFile = async () => {
        const currentDate = new Date().toISOString().split('T')[0];
        const paragraphs = filteredData.map((row, index) => {
            return new Paragraph({
                children: [
                    new TextRun({
                        text: `No: ${index + 1} `,
                        break: 1.5,
                        bold: true,
                        font: {
                            name: 'Arial',
                        },
                    }),
                    new TextRun({
                        text: `ISP: ${row.ISP} `,
                        break: 1.5,
                        font: {
                            name: 'Arial',
                        },
                    }),
                    new TextRun({
                        text: `Program Title: ${row.programTitle} `,
                        break: 1.5,
                        font: {
                            name: 'Arial',
                        },
                    }),
                    new TextRun({
                        text: `Project Title: ${row.projectTitle} `,
                        break: 1.5,
                        font: {
                            name: 'Arial',
                        },
                    }),
                    new TextRun({
                        text: `Responsible Person: ${row.responsiblePerson} `,
                        break: 1.5,
                        font: {
                            name: 'Arial',
                        },
                    }),
                    new TextRun({
                        text: `Funding: ${row.funding} `,
                        break: 1.5,
                        font: {
                            name: 'Arial',
                        },
                    }),
                    new TextRun({
                        text: `Budget: ${row.totalBudget} `,
                        break: 1.5,
                        font: {
                            name: 'Arial',
                        },
                    }),
                    new TextRun({
                        text: `Remarks: ${row.remarks}`,
                        break: 1.5,
                        font: {
                            name: 'Arial',
                        },
                    }),
                    new TextRun({
                        text: `Created At: ${row.created_at}`,
                        break: 1.5,
                        font: {
                            name: 'Arial',
                        },
                    }),
                ],
            });
        });

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Generated Report`,
                                    break: 2,
                                    bold: true,
                                    font: {
                                        name: 'Arial',
                                    },
                                    size: 32,
                                }),
                            ]
                        }),
                        ...paragraphs,
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Generated Report_${currentDate}.docx`);
    };

    const handleScrollspyClick = (id) => {
        setActiveScrollspy(id);
    };

    const sortedData = [...filteredData].sort((a, b) => b.id - a.id);

    const data = filteredData;

    // const openModal = () => {
    //     // const filename = selectedProject.fileData.implementationFilename;
    //     // setFileUrl(`http://localhost:8080/GetFile/${filename}`);
    //     setShowModal(true);
    // };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <article className='pt-5 pb-5 pe-5'>
            <div className="modal fade" id="viewModal" tabIndex="-1" aria-labelledby="exampleModalLabel" data-bs-backdrop="static" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
                    <div className="modal-content p-2">
                        <div className="modal-header border-0">
                            <h1 className="modal-title fw-semibold" style={{ fontSize: '18px' }} id="exampleModalLabel">Project Details</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body pt-0">
                            {selectedProject && (
                                <>
                                    <nav id="navbar-example2 p-0 m-0" className="navbar">
                                        <ul className="nav p-0 m-0">
                                            <li className="nav-item p-0 m-0">
                                                <a className="nav-link ps-0" href="#scrollspyHeading1" onClick={() => handleScrollspyClick('scrollspyHeading1')}>Main Details</a>
                                            </li>
                                            <li className="nav-item p-0 m-0">
                                                <a className="nav-link" href="#scrollspyHeading2" onClick={() => handleScrollspyClick('scrollspyHeading2')}>Budget</a>
                                            </li>
                                            <li className="nav-item p-0 m-0">
                                                <a className="nav-link" href="#scrollspyHeading3" onClick={() => handleScrollspyClick('scrollspyHeading3')}>GIS Release</a>
                                            </li>
                                            <li className="nav-item p-0 m-0">
                                                <a className="nav-link" href="#scrollspyHeading4" onClick={() => handleScrollspyClick('scrollspyHeading4')}>Counterpart Funds</a>
                                            </li>
                                            <li className="nav-item p-0 m-0">
                                                <a className="nav-link" href="#scrollspyHeading4" onClick={() => handleScrollspyClick('scrollspyHeading5')}>6PS</a>
                                            </li>
                                        </ul>
                                    </nav>
                                    <div data-bs-spy="scroll" data-bs-target="#navbar-example2" data-bs-root-margin="0px 0px -40%" data-bs-smooth-scroll="true" className="scrollspy-example" tabIndex="0">
                                        {activeScrollspy === 'scrollspyHeading1' && (
                                            <>
                                                <h6 className='pt-1 fw-bold' id="scrollspyHeading1"></h6>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Project Code:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.projectCode}</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>ISP:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.ISP}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col'>
                                                        <label className='h6 fw-semibold'>Program Title:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.programTitle}</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label className='h6 fw-semibold'>Project Title:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.projectTitle}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Responsible Person:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.responsiblePerson}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Funding:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.funding}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Budget:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.totalBudget}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Implementing Agency:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.implementingAgency}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Program/Project Leader:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.programLeader}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Email Address:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.emailAddress}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Contact Number:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.contactNumber}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Postal Address:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.postalAddress}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Cooperating Agency:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.cooperatingAgency}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Original Start:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.originalStart)}</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Original End:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.originalEnd)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Change Start:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.changeStart)}</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Change Implementation Date:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.changeImplementationDate)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>1st Extension:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.firstExtension)}</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>2nd Extension:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.secondExtension)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>File for Implementation Change:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <a className='' style={{ cursor: 'pointer' }} onClick={() => openModal('implementation')}>
                                                            {selectedProject.fileData.implementationFilename}
                                                        </a>
                                                    </div>

                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Extension File:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <a className='' style={{ cursor: 'pointer' }} onClick={() => openModal('extension')}>
                                                            {selectedProject.fileData.extensionFilename}
                                                        </a>
                                                    </div>

                                                    {showModal && isImage && (
                                                        <ImageModal imageUrl={fileUrl} closeModal={closeModal} />
                                                    )}

                                                    {showModal && !isImage && (
                                                        <PdfModal pdfUrl={fileUrl} closeModal={closeModal} />
                                                    )}

                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Objectives:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.objectives}</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Description:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.description}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Deliverables:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.deliverables}</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Beneficiaries:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.beneficiaries}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>DC Y1 Approval:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.dcY1Approval)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>GC Y1 Approval:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.gcY1Approval)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Execom Y1 Approval:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.execomY1Approval)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>DC Y2 Renewal:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.dcY2Renewal)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>GC Y2 Renewal:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.gcY2Renewal)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Execom Y2 Renewal:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.execomY2Renewal)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>DC Y3 Renewal:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.dcY3Renewal)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>GC Y3 Renewal:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.gcY3Renewal)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Execom Y3 Renewal:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.execomY3Renewal)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Inception Meeting:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.inceptionMeeting)}</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>M&E:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: formatDate(selectedProject.mande) }}></label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Y1 Budget Realignment:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.y1BudgetRealignment)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Y2 Budget Realignment:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.y2BudgetRealignment)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Y3 Budget Realignment:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.y3BudgetRealignment)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Realignment File:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <a className='' style={{ cursor: 'pointer' }} onClick={() => openModal('realignment')}>
                                                            {selectedProject.fileData.realignmentFilename}
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Program Review:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.programReview)}</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Terminal Review:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.terminalReview)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Status:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.status}</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Remarks:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label className={`badge p-2 h6 ${selectedProject.remarks === 'New' ? 'bg-warning' : selectedProject.remarks === 'Ongoing' ? 'bg-primary' : selectedProject.remarks === 'Completed' ? 'bg-success' : 'bg-danger'}`} style={{ textAlign: 'justify' }}>{selectedProject.remarks}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Date Created:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatTime(selectedProject.created_at)}</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Date Updated:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{formatTime(selectedProject.updated_at)}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Created By:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.created_by}</label>
                                                    </div>
                                                    <div className='col-md-3'>

                                                    </div>
                                                    <div className='col'>

                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {activeScrollspy === 'scrollspyHeading2' && (
                                            <>
                                                <h6 className='pt-1 fw-bold' id="scrollspyHeading2">Budget</h6>
                                                <div className='row pb-2'>
                                                    <div className='col'>
                                                        {selectedProject.budget && typeof selectedProject.budget === 'object' ? (
                                                            <ul>
                                                                {Object.entries(selectedProject.budget).map(([year, value]) => (
                                                                    <li key={year} className='pb-2'>
                                                                        <strong>{year}:</strong> {value}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <label style={{ textAlign: 'justify' }}>{selectedProject.budget || "No data"}</label>
                                                        )}
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Total Budget:</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.totalBudget && selectedProject.totalBudget ?
                                                            selectedProject.totalBudget :
                                                            "No data"}</label>
                                                    </div>
                                                </div>

                                            </>
                                        )}

                                        {activeScrollspy === 'scrollspyHeading3' && (
                                            <>
                                                <h6 className='pt-1 fw-bold' id="scrollspyHeading3">GIA Releases</h6>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Programmed Amount:</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label style={{ textAlign: 'justify' }}>
                                                            {Number(selectedProject.releaseData.programmedAmount).toLocaleString(undefined, {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Region of Implemeting Agency:</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.releaseData.regionIA}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Particulars/Schedule:</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.releaseData.particulars}</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>DV No.:</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.releaseData.dvNo}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Date of Release/Transferred (FAIS):</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label style={{ textAlign: 'justify' }}>{formatDate(selectedProject.releaseData.dateOfRelease)}</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Month:</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.releaseData.month}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Actual Release per FAIS/DV/ADA:</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label style={{ textAlign: 'justify' }}>
                                                            {Number(selectedProject.releaseData.actualRelease).toLocaleString(undefined, {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Remerks:</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.releaseData.remarksReleases}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Status:</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.releaseData.statusReleases}</label>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {activeScrollspy === 'scrollspyHeading4' && (
                                            <>
                                                <h6 className='pt-1 fw-bold' id="scrollspyHeading4">Counterpart Funds</h6>
                                                <div className='row pb-2'>
                                                    <div className='col'>
                                                        {selectedProject.counterFund && typeof selectedProject.counterFund === 'object' ? (
                                                            <ul>
                                                                {Object.entries(selectedProject.counterFund).map(([year, value]) => (
                                                                    <li key={year} className='pb-2'>
                                                                        <strong>{year}:</strong> {value}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <label style={{ textAlign: 'justify' }}>{selectedProject.counterFund || "No data"}</label>
                                                        )}
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>Total Fund:</label>
                                                    </div>
                                                    <div className='col-md-3'>
                                                        <label style={{ textAlign: 'justify' }}>
                                                            {selectedProject.counterpartFundData && selectedProject.counterpartFundData.totalFund ?
                                                                selectedProject.counterpartFundData.totalFund :
                                                                "No data"}
                                                        </label>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {activeScrollspy === 'scrollspyHeading5' && (
                                            <>
                                                <h6 className='pt-1 fw-bold' id="scrollspyHeading3">6pS</h6>
                                                <div className='row pb-2'>
                                                    <div className='col-md-3'>
                                                        <label className='h6 fw-semibold'>ISP:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.ISP}</label>
                                                    </div>
                                                </div>
                                                <div className='row pb-2'>
                                                    <div className='col'>
                                                        <label className='h6 fw-semibold'>Project Title:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label style={{ textAlign: 'justify' }}>{selectedProject.projectTitle}</label>
                                                    </div>
                                                    <div className='col'>
                                                        <label className='h6 fw-semibold'>Year:</label>
                                                    </div>
                                                    <div className='col'>
                                                        <select value={selectedYear} onChange={handleYearChange} className="mb-3">
                                                            <option value="">Select Year</option>
                                                            {selectedProject && selectedProject.sixPs && Object.keys(selectedProject.sixPs).map((year) => (
                                                                <option key={year} value={year}>{year}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                {selectedYear && selectedProject.sixPs[selectedYear] && (
                                                    <>
                                                        <p className='h6 py-2 text-center fw-semibold bg-dark text-light' style={{ borderRadius: '.3rem' }}>Publication</p>
                                                        <div className='row pb-2'>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Target Publication:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].targetPublication}</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Actual Accomplishment (Peer-Reviewed):</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].actualaccomplishmentPeer}</label>
                                                            </div>
                                                        </div>
                                                        <div className='row pb-2'>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Actual Accomplishment (Journal Volume, Year):</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].actualaccomplishmentJournal}</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Actual Accomplishment Presented in Conferences, etc:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].actualaccomplishmentPresented}</label>
                                                            </div>
                                                        </div>
                                                        <div className='row pb-2'>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Details about the conference/ symposium, etc.:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].details}</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Actual Accomplishment (IEC Materials i.e. brochures, manuals, pamphlet, leaflets, etc) Specify the type of IEC:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].actualaccomplishmentIEC}</label>
                                                            </div>
                                                        </div>
                                                        <p className='h6 py-2 text-center fw-semibold bg-dark text-light' style={{ borderRadius: '.3rem' }}>Product</p>
                                                        <div className='row pb-2'>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Target Product:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].targetProduct}</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Name of Technology:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].techName}</label>
                                                            </div>
                                                        </div>
                                                        <div className='row pb-2'>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Description of the Technology:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].techDescription}</label>
                                                            </div>
                                                        </div>
                                                        <p className='h6 py-2 text-center fw-semibold bg-dark text-light' style={{ borderRadius: '.3rem' }}>Patent</p>
                                                        <div className='row pb-2'>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Target Patent:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].targetPatent}</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Agency:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].agency}</label>
                                                            </div>
                                                        </div>
                                                        <div className='row pb-2'>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Name of Technology/ Protocols/ manual with IP/Patent:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].techNamePro}</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Status:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].statusSix}</label>
                                                            </div>
                                                        </div>
                                                        <div className='row pb-2'>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>DOST:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].dost}</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Patent Number or Application Number:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].patentNumber}</label>
                                                            </div>
                                                        </div>
                                                        <p className='h6 py-2 text-center fw-semibold bg-dark text-light' style={{ borderRadius: '.3rem' }}>People and Services</p>
                                                        <div className='row pb-2'>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Target People and Services:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].targetPeople}</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Names (BS):</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].namesBS}</label>
                                                            </div>
                                                        </div>
                                                        <div className='row pb-2'>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Names (MS):</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].namesMS}</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Names (PhD):</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].namesPhD}</label>
                                                            </div>
                                                        </div>
                                                        <p className='h6 py-2 text-center fw-semibold bg-dark text-light' style={{ borderRadius: '.3rem' }}>Places and Partnership</p>
                                                        <div className='row pb-2'>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Target Places and Partnership:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].targetPlaces}</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Cooperators:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].cooperators}</label>
                                                            </div>
                                                        </div>
                                                        <div className='row pb-2'>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>International:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].international}</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Private:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].privateSixPS}</label>
                                                            </div>
                                                        </div>
                                                        <p className='h6 py-2 text-center fw-semibold bg-dark text-light' style={{ borderRadius: '.3rem' }}>Policy</p>
                                                        <div className='row pb-2'>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Target Policy:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].targetPolicy}</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label className='h6 fw-semibold'>Policy Recommendation:</label>
                                                            </div>
                                                            <div className='col-md-3'>
                                                                <label style={{ textAlign: 'justify' }}>{selectedProject.sixPs[selectedYear].policyRecommendation}</label>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-dark px-3 py-2 border" data-bs-dismiss="modal" style={{ fontSize: '14px' }}>Ok</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className="modal fade" id="archiveModal" tabIndex="-1" aria-labelledby="exampleModalLabel" data-bs-backdrop="static" aria-hidden="true">
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
            </div> */}
            <EditProjectModal
                isEditModalOpen={isEditModalOpen}
                closeModal={() => setIsEditModalOpen(false)}
                project={selectedProject}
                refresh={refreshData}
                showToastF={showToastF}
            />
            <AddProjectFilesModal
                isAddFileModalOpen={isAddFileModalOpen}
                closeModal={() => setIsAddFileModalOpen(false)}
                project={selectedProject}
                refresh={refreshData}
                showToastF={showToastF}
            />
            <div className="d-flex justify-content-between align-items-center">
                <label className='h5 fw-semibold pt-2'>Projects</label>
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
                    <FilterProjectModal
                        applyFilter={applyFilter}
                        availableYears={availableYears}
                        availableISP={availableISP}
                    />
                    <div className='sample me-3 notifTooltip' style={{ borderRadius: '50px', padding: '7px 2px 2px 2px' }}>
                        <Tooltip anchorSelect=".notifTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                            Notifications
                        </Tooltip>
                        <button type="button" className="btn border-0 position-relative" style={{ width: '40px' }} data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="fa-solid fa-bell fs-5"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-lg-end border-0 p-0 w-25 h-auto shadow-lg">
                            <li>
                                <h5 className='p-3 fw-bold'>Notifications</h5>
                                {allPendingProposals.length > 0 ? (
                                    <div className='dropdown-scrollable'>
                                        <ul className='p-0'>
                                            <li>
                                                <h6 className='p-2 ms-2 fw-bold'>Near Due Projects</h6>
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
                                                                            ${calculateDaysUntilDue(getProposalEndDate(proposal)) === 0 ? 'Due Today' :
                                                                                'Due in ' + calculateDaysUntilDue(getProposalEndDate(proposal)) + ' days ' +
                                                                                '(' + calculateDueDate(getProposalEndDate(proposal)) + ')'}
                                                                        `}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className='p-3 text-center'>
                                                        No near due projects
                                                    </div>
                                                )}
                                            </li>
                                            <li>
                                                <h6 className='p-2 mt-3 ms-2 fw-bold'>Due Projects</h6>
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
                                                                            ${calculateDaysUntilDue(getProposalEndDate(proposal)) === 0 ? 'Due Today' :
                                                                                'Due ' + calculateDaysUntilDue(getProposalEndDate(proposal)) + ' days ago ' +
                                                                                '(' + calculateDueDate(getProposalEndDate(proposal)) + ')'}
                                                                        `}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className='p-3 text-center'>
                                                        No due projects
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
                    <div className='sample me-3 reportTooltip' style={{ borderRadius: '50px', padding: '7px 2px 2px 2px' }}>
                        <Tooltip anchorSelect=".reportTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                            Generate Report
                        </Tooltip>
                        <Link to="/DOST/Generate-Report" state={data} className="btn border-0" data-bs-toggle="tooltip" data-bs-title="Refresh">
                            <i className="fa-solid fa-chart-line fs-5"></i>
                        </Link>
                    </div>
                    {/* <div className='sample me-3 generateTooltip' style={{ borderRadius: '50px', padding: '7px 2px 2px 2px' }}>
                        <Tooltip anchorSelect=".generateTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                            Generate Report
                        </Tooltip>
                        <button type="button" className="btn border-0" data-bs-toggle="tooltip" onClick={downloadWordFile}>
                            <i className="fa-solid fa-file-contract fs-5"></i>
                        </button>
                    </div> */}
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


            <DataTable
                columns={columns}
                data={sortedData}
                pagination
                responsive
                highlightOnHover
                striped
                className='pt-5'
                style={{ paddingLeft: sidebarExpanded ? '300px' : '150px', transition: 'padding-left 0.3s' }}
            />

            <div
                className="toast position-absolute start-50 translate-middle-x bg-success"
                style={{ display: showToast ? 'block' : 'none', top: '140px' }}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
            >
                <div className="d-flex">
                    <div className="toast-body text-white">
                        Project updated successfully.
                    </div>
                </div>
            </div>
        </article>
    )
}

export default Projects