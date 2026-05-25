import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { clear } from '@testing-library/user-event/dist/clear';

const EditProposalModal = ({ isEditModalOpen, closeModal, proposal, refresh }) => {

    const [ISP, setISP] = useState('');
	const [programTitle, setProgramTitle] = useState('');
	const [projectTitle, setProjectTitle] = useState('');
	const [responsiblePerson, setResponsiblePerson] = useState('');
	const [implementingAgency, setImplementingAgency] = useState('');
	const [programLeader, setProgramLeader] = useState('');
	const [funding, setFunding] = useState('');
	const [leadTRD, setLeadTRD] = useState('');
	const [quarter, setQuarter] = useState('');
	const [date, setDate] = useState('');
	const [remarks, setRemarks] = useState('');

    const navigate = useNavigate();

	const [showToast, setShowToast] = useState(false);
	const [toastTimeout, setToastTimeout] = useState(null);
	const [showToastSuccess, setShowToastSuccess] = useState(false);

    useEffect(() => {
        if (proposal) {
            setISP(proposal.ISP);
            setProgramTitle(proposal.programTitle);
            setProjectTitle(proposal.projectTitle);
            setResponsiblePerson(proposal.responsiblePerson);
            setImplementingAgency(proposal.implementingAgency);
			setProgramLeader(proposal.programLeader);
            setFunding(proposal.funding);
            setLeadTRD(proposal.leadTRD);
            setQuarter(proposal.quarter);
            setDate(proposal.date);
            setRemarks(proposal.remarks);
        }
    }, [proposal]);

    const updateProposal = async (e) => {
        e.preventDefault();
    
        const isChanged =
            ISP !== proposal.ISP ||
            programTitle !== proposal.programTitle ||
            projectTitle !== proposal.projectTitle ||
            responsiblePerson !== proposal.responsiblePerson ||
            implementingAgency !== proposal.implementingAgency ||
			programLeader !== proposal.programLeader ||
            funding !== proposal.funding ||
            leadTRD !== proposal.leadTRD ||
            quarter !== proposal.quarter ||
            date !== proposal.date ||
            remarks !== proposal.remarks;
    
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
            await axios.patch(`http://localhost:8080/Proposals/${proposal.id}`, {
                ISP: ISP,
                programTitle: programTitle,
                projectTitle: projectTitle,
                responsiblePerson: responsiblePerson,
                implementingAgency: implementingAgency,
				programLeader: programLeader,
                funding: funding,
                leadTRD: leadTRD,
                quarter: quarter,
                date: date,
                remarks: remarks,
            });
            console.log('Proposal updated successfully');
			setShowToastSuccess(true);
            if (toastTimeout) {
                clearTimeout(toastTimeout);
            }
            const timeout = setTimeout(() => {
                setShowToastSuccess(false);
            }, 5000);
            closeModal();
			clearField();
			refresh();
        } catch (error) {
            console.error('Error updating proposal:', error);
        }
    };
    
    
    const handleISPChange = (e) => {
		const selectedValue = e.target.textContent;
		const parentMenu = e.target.closest('.dropdown-menu');
		if (parentMenu && parentMenu.classList.contains('dropdown-submenu')) {
			setISP(`Inland Biodiversity (${selectedValue})`);
		} else {
			setISP(selectedValue);
		}
	};

	const handleResPerChange = (e) => {
		setResponsiblePerson(e.target.innerText);
	};

	const handleFundingChange = (e) => {
		setFunding(e.target.innerText);
	};

	const handleQuarterChange = (e) => {
		setQuarter(e.target.innerText);
	};

	const handleRemarksChange = (e) => {
        setRemarks(e.target.innerText);
    }  

	const clearField = () => {
        setISP('');
		setProgramTitle('');
		setProjectTitle('');
        setResponsiblePerson('');
		setImplementingAgency('');
		setProgramLeader('');
		setLeadTRD('');
        setFunding('');
        setRemarks('');
        setQuarter('');
        setDate('');
    };

    return (
        <div>
            <form onSubmit={updateProposal}>
                <div className={`modal fade modal-overlay ${isEditModalOpen ? 'show' : ''}`} tabIndex="-1" style={{ display: isEditModalOpen ? 'block' : 'none' }}>
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content p-2">
                            <div className="modal-header border-0">
                                <h1 className="modal-title fw-semibold" style={{ fontSize: '18px' }}>Edit Proposal</h1>
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
                                <div className="form-group pt-3">
									<label className="pb-2">ISP</label>
									<input
										className="form-control dropdown-toggle"
										type="text"
										id="dropISPPropEdit"
										data-bs-toggle="dropdown"
										aria-haspopup="true"
										aria-expanded="false"
										value={ISP}
										onChange={(e) => setISP(e.target.value)}
										placeholder='Select ISP'
										readOnly
									/>
									<ul className="dropdown-menu p-0" aria-labelledby="dropISPPropEdit">
										<li className="dropdown-item" onClick={handleISPChange}>MilkFish</li>
										<li className="dropdown-item" onClick={handleISPChange}>Mangrove Crab</li>
										<li className="dropdown-item" onClick={handleISPChange}>Shrimp</li>
										<li className="dropdown-item" onClick={handleISPChange}>Tilapia</li>
										<li className="dropdown-item" onClick={handleISPChange}>Mussel</li>
										<li className="dropdown-item" onClick={handleISPChange}>Aquafeeds</li>
										<li className="dropdown-item">
											Inland Biodiversity &raquo;
											<ul className="dropdown-menu dropdown-submenu p-0" style={{ marginTop: '-20px' }}>
												<li className="dropdown-item" onClick={handleISPChange}>Lakes</li>
												<li className="dropdown-item" onClick={handleISPChange}>Knifefish</li>
												<li className="dropdown-item" onClick={handleISPChange}>Tawilis</li>
												<li className="dropdown-item" onClick={handleISPChange}>Ayungin</li>
												<li className="dropdown-item" onClick={handleISPChange}>Catfish</li>
												<li className="dropdown-item" onClick={handleISPChange}>Climbing Perch</li>
												<li className="dropdown-item" onClick={handleISPChange}>Eel</li>
												<li className="dropdown-item" onClick={handleISPChange}>Goby</li>
												<li className="dropdown-item" onClick={handleISPChange}>Cyprinids</li>
												<li className="dropdown-itemm">
													<input
														className='ps-2 border-0 p-2'
														type="text"
														placeholder="Other..."
														onChange={(e) => setISP(`Inland Biodiversity (${e.target.value})`)}
														style={{ borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px' }}
													/>
												</li>
											</ul>
										</li>
									</ul>
								</div>
								<div className="row pt-3">
									<div className="col">
										<label className="pb-2">Program Title</label>
										<textarea type="text" className="form-control" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} />
									</div>
									<div className="col">
										<label className="pb-2">Project Title</label>
										<textarea type="text" className="form-control" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
									</div>
								</div>
								<div className="row pt-3">
									<div className="col">
										<label className="pb-2">Responsible Person</label>
										<input
											className="form-control w-100 dropdown-toggle"
											id="dropResPerPropEdit"
											data-bs-toggle="dropdown"
											aria-haspopup="true"
											aria-expanded="false"
											value={responsiblePerson}
											onChange={(e) => setResponsiblePerson(e.target.value)}
											placeholder='Select Responsible Person'
											readOnly
										/>
										<ul className="dropdown-menu p-0" aria-labelledby="dropResPerPropEdit">
											<li className="dropdown-item" onClick={handleResPerChange}>ATC</li>
											<li className="dropdown-item" onClick={handleResPerChange}>VGS</li>
											<li className="dropdown-item" onClick={handleResPerChange}>CVA</li>
											<li className="dropdown-item" onClick={handleResPerChange}>FFCM</li>
											<li className="dropdown-item" onClick={handleResPerChange}>KLT</li>
											<li className="dropdown-item" onClick={handleResPerChange}>GMDO</li>
											<li className="dropdown-item" onClick={handleResPerChange}>STG</li>
											<li className="dropdown-item" onClick={handleResPerChange}>GES</li>
											<li className="dropdown-item" onClick={handleResPerChange}>AMSP</li>
											<li className="dropdown-item" onClick={handleResPerChange}>MAI</li>
											<li className="dropdown-item" onClick={handleResPerChange}>EBRD</li>
											<li className="dropdown-item" onClick={handleResPerChange}>RBR</li>
											<li className="dropdown-itemm">
												<input
													className='ps-2 border-0 p-2'
													type="text"
													placeholder="Other..."
													onChange={(e) => setResponsiblePerson(e.target.value)}
													style={{ borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px' }}
												/>
											</li>
										</ul>
									</div>
									<div className="col">
										<label className="pb-2">Implementing Agency</label>
										<input type="text" className="form-control" value={implementingAgency} onChange={(e) => setImplementingAgency(e.target.value)} />
									</div>
								</div>
								<div className="row pt-3">
									<div className="col">
										<label className="pb-2">Program/Project Leader</label>
										<input type="text" className="form-control" value={ programLeader } onChange={ (e) => setProgramLeader(e.target.value) }/>
									</div>
									<div className="col">
										<label className="pb-2">Funding</label>
										<input
											className="form-control w-100 dropdown-toggle"
											id="dropFundingPropEdit"
											data-bs-toggle="dropdown"
											aria-haspopup="true"
											aria-expanded="false"
											value={funding}
											onChange={(e) => setFunding(e.target.value)}
											placeholder='Select Funding'
											readOnly
										/>
										<ul className="dropdown-menu p-0" aria-labelledby="dropFundingPropEdit">
											<li className="dropdown-item" onClick={handleFundingChange}>DOST GIA</li>
											<li className="dropdown-item" onClick={handleFundingChange}>PCAARRD GIA</li>
										</ul>
									</div>
									<div className="col">
										<label className="pb-2">Lead TRD</label>
										<input type="text" className="form-control" value={leadTRD} onChange={(e) => setLeadTRD(e.target.value)} />
									</div>
								</div>
								<div className="row pt-3">
									<div className="col">
										<label className="pb-2">Quarter</label>
										<input
											className="form-control w-100 dropdown-toggle"
											id="dropQuarterPropEdit"
											data-bs-toggle="dropdown"
											aria-haspopup="true"
											aria-expanded="false"
											value={quarter}
											onChange={(e) => setQuarter(e.target.value)}
											placeholder='Select Quarter'
											readOnly
										/>
										<ul className="dropdown-menu p-0" aria-labelledby="dropFundingPropEdit">
											<li className="dropdown-item" onClick={handleQuarterChange}>1st</li>
											<li className="dropdown-item" onClick={handleQuarterChange}>2nd</li>
											<li className="dropdown-item" onClick={handleQuarterChange}>3rd</li>
											<li className="dropdown-item" onClick={handleQuarterChange}>4th</li>
										</ul>
									</div>
									<div className="col">
										<label className="pb-2">Date</label>
										<input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
									</div>
									<div className="col">
										<label className="pb-2">Remarks</label>
										<input
											className="form-control w-100 dropdown-toggle"
											id="dropRemarksPropEdit"
											data-bs-toggle="dropdown"
											aria-haspopup="true"
											aria-expanded="false"
											value={remarks}
											onChange={(e) => setRemarks(e.target.value)}
											placeholder='Select Remarks'
											readOnly
										/>
										<ul className="dropdown-menu p-0" aria-labelledby="dropRemarksPropEdit">
											<li className="dropdown-item" onClick={handleRemarksChange}>Approved</li>
											<li className="dropdown-item" onClick={handleRemarksChange}>Disapproved</li>
											<li className="dropdown-item" onClick={handleRemarksChange}>Resubmission</li>
											<li className="dropdown-item" onClick={handleRemarksChange}>Under Evaluation</li>
											<li className="dropdown-item" onClick={handleRemarksChange}>Revision</li>
										</ul>
									</div>
								</div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline px-3 py-2 border text-black" onClick={closeModal} style={{ fontSize: '14px' }}>Cancel</button>
                                <button className="btn btn-dark px-3 py-2 border" style={{ fontSize: '14px' }}>Update</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
			<div
                className="toast position-absolute start-50 translate-middle-x bg-success"
                style={{ display: showToastSuccess ? 'block' : 'none' }}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
            >
                <div className="d-flex">
                    <div className="toast-body text-white">
                        Proposal updated successfully.
                    </div>
                </div>	
            </div>
        </div>
    )
}

export default EditProposalModal;
