import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Tooltip } from 'react-tooltip';
import './NewData.css'

const AddProposalModal = ({ refresh }) => {

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
	const [showToastSuccess, setShowToastSuccess] = useState(false);
	const [toastTimeout, setToastTimeout] = useState(null);

	const saveProposal = async (e) => {
        e.preventDefault();

        try {
            await axios.post('http://localhost:8080/Proposals', {
                ISP,
                programTitle,
                projectTitle,
                responsiblePerson,
                implementingAgency,
				programLeader,
                funding,
                leadTRD,
                quarter,
                date,
                remarks,
            });
            console.log('Proposal saved successfully');
			setShowToastSuccess(true);
            if (toastTimeout) {
                clearTimeout(toastTimeout);
            }
            const timeout = setTimeout(() => {
                setShowToastSuccess(false);
            }, 5000);
            setToastTimeout(timeout);
			setISP('');
			setProgramTitle('');
			setProjectTitle('');
			setResponsiblePerson('');
			setImplementingAgency('');
			setProgramLeader('');
			setFunding('');
			setLeadTRD('');
			setQuarter('');
			setDate('');
			setRemarks('');
			refresh();
        } catch (error) {
            console.error('Error saving proposal:', error);
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

	return (
		<div>
			<div className='sample me-3 addProposalTooltip' style={{ borderRadius: '50px', padding: '7px 2px 2px 2px' }}>
				<Tooltip anchorSelect=".addProposalTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
					Add new proposal
				</Tooltip>
				<button type="button" className="btn border-0" data-bs-toggle="modal" data-bs-target="#addProposal">
					<i className="fa-solid fa-plus fs-5"></i>
				</button>
			</div>
			<form onSubmit={saveProposal}>
				<div className="modal fade" id='addProposal' tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
					<div className="modal-dialog modal-dialog-centered modal-xl">
						<div className="modal-content p-2">
							<div className="modal-header border-0">
								<h5 className="modal-title fw-semibold" style={{ fontSize: '18px' }}>Add Proposal</h5>
								<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
							</div>
							<div className="modal-body">
								<div className="form-group pt-3">
									<label className="pb-2">ISP</label>
									<input
										className="form-control w-25 dropdown-toggle"
										type="text"
										id="dropISPPropAdd"
										data-bs-toggle="dropdown"
										aria-haspopup="true"
										aria-expanded="false"
										value={ISP}
										onChange={(e) => setISP(e.target.value)}
										placeholder='Select ISP'
										readOnly
									/>
									<ul className="dropdown-menu p-0 w-auto" aria-labelledby="dropISPPropAdd">
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
											id="dropResPerPropAdd"
											data-bs-toggle="dropdown"
											aria-haspopup="true"
											aria-expanded="false"
											value={responsiblePerson}
											onChange={(e) => setResponsiblePerson(e.target.value)}
											placeholder='Select Responsible Person'
											readOnly
										/>
										<ul className="dropdown-menu p-0" aria-labelledby="dropResPerPropAdd">
											<li className="dropdown-item" onClick={handleResPerChange}>ATC</li>
											<li className="dropdown-item" onClick={handleResPerChange}>VGS</li>
											<li className="dropdown-item" onClick={handleResPerChange}>CVA</li>
											<li className="dropdown-item" onClick={handleResPerChange}>FFCM</li>
											<li className="dropdown-item" onClick={handleResPerChange}>KLT</li>
											<li className="dropdown-item" onClick={handleResPerChange}>GMDO</li>
											<li className="dropdown-item" onClick={handleResPerChange}>JJSV</li>
											<li className="dropdown-item" onClick={handleResPerChange}>GRO</li>
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
											id="dropFundingPropAdd"
											data-bs-toggle="dropdown"
											aria-haspopup="true"
											aria-expanded="false"
											value={funding}
											onChange={(e) => setFunding(e.target.value)}
											placeholder='Select Funding'
											readOnly
										/>
										<ul className="dropdown-menu p-0" aria-labelledby="dropFundingPropAdd">
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
											id="dropQuarterPropAdd"
											data-bs-toggle="dropdown"
											aria-haspopup="true"
											aria-expanded="false"
											value={quarter}
											onChange={(e) => setQuarter(e.target.value)}
											placeholder='Select Quarter'
											readOnly
										/>
										<ul className="dropdown-menu p-0" aria-labelledby="dropQuarterPropAdd">
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
											id="dropRemarksPropAdd"
											data-bs-toggle="dropdown"
											aria-haspopup="true"
											aria-expanded="false"
											value={remarks}
											onChange={(e) => setRemarks(e.target.value)}
											placeholder='Select Remarks'
											readOnly
										/>
										<ul className="dropdown-menu p-0" aria-labelledby="dropRemarksPropAdd">
											<li className="dropdown-item" onClick={handleRemarksChange}>Approved</li>
											<li className="dropdown-item" onClick={handleRemarksChange}>Disapproved</li>
											<li className="dropdown-item" onClick={handleRemarksChange}>Resubmission</li>
											<li className="dropdown-item" onClick={handleRemarksChange}>Under Evaluation</li>
											<li className="dropdown-item" onClick={handleRemarksChange}>Revision</li>
										</ul>
									</div>
								</div>
							</div>
							<div className="modal-footer border-0">
								<button type="button" className="btn btn-outline px-3 py-2 border text-black" data-bs-dismiss="modal" style={{ fontSize: '14px' }}>Cancel</button>
                                <button className="btn btn-dark px-3 py-2 border" data-bs-dismiss="modal" style={{ fontSize: '14px' }} disabled={!(
									ISP || programTitle || projectTitle || responsiblePerson || implementingAgency || programLeader || funding || leadTRD || quarter || date || remarks
								)}>Save Proposal</button>
							</div>
						</div>
					</div>
				</div>
			</form>
			<div
				className="toast position-absolute start-50 translate-middle-x bg-success"
                style={{ display: showToastSuccess ? 'block' : 'none', top: '140px' }}
				role="alert"
				aria-live="assertive"
				aria-atomic="true"
			>
				<div className="d-flex">
					<div className="toast-body text-white">
						Proposal saved successfully.
					</div>
				</div>	
			</div>
		</div>
	)
}

export default AddProposalModal;
