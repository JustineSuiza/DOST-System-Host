import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import ReactDOM from 'react-dom';

const FilterCounterpartFundModal = ({ applyFilter, availableYears, availableISP }) => {

    const [ISP, setISP] = useState([]);
    const [responsiblePerson, setResponsiblePerson] = useState('');
    const [implementingAgency, setImplementingAgency] = useState('');
    const [funding, setFunding] = useState('');
    const [remarks, setRemarks] = useState([]);

    const handleISPChange = (e, ISP) => {
        // const selectedValue = e.target.textContent;
        // const parentMenu = e.target.closest('.dropdown-menu');
        // if (parentMenu && parentMenu.classList.contains('dropdown-submenu')) {
        //     setISP(`Inland Biodiversity (${selectedValue})`);
        // } else {
        //     setISP(selectedValue);
        // }
        if (e.target.checked) {
            setISP(prevSelectedYears => [...prevSelectedYears, ISP]);
        } else {
            setISP(prevSelectedYears => prevSelectedYears.filter(y => y !== ISP));
        }
    };

    const handleResPerChange = (e) => {
        setResponsiblePerson(e.target.innerText);
    };

    const saveFilter = (e) => {
        e.preventDefault();
    
        const filterData = {
            ISP,
            responsiblePerson,
            implementingAgency,
            funding,
            remarks,
        };

        if (selectedYears) {
            filterData.originalStart = selectedYears;
        }
    
        applyFilter(filterData);
    };

    const handleFundingChange = (e) => {
		setFunding(e.target.innerText);
	};

    const handleRemarksChange = (e, remarks) => {
        if (e.target.checked) {
            setRemarks(prevSelectedYears => [...prevSelectedYears, remarks]);
        } else {
            setRemarks(prevSelectedYears => prevSelectedYears.filter(y => y !== remarks));
        }
    } 

    const [selectedYears, setSelectedYears] = useState([]);

    const handleYearChange = (e, year) => {
        if (e.target.checked) {
            setSelectedYears(prevSelectedYears => [...prevSelectedYears, year]);
        } else {
            setSelectedYears(prevSelectedYears => prevSelectedYears.filter(y => y !== year));
        }
    };

    const clearFilter = () => {
        setISP([]);
        setResponsiblePerson('');
        setImplementingAgency('');
        setFunding('');
        setRemarks([]);
        setSelectedYears([]);
    };
    
    return (
        <div>
            <div className='sample me-3 filterTooltip' style={{ borderRadius: '50px', padding: '7px 2px 2px 2px' }}>
                <Tooltip anchorSelect=".filterTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                    Filter
                </Tooltip>
                <button type="button" className="btn border-0" data-bs-toggle="modal" data-bs-target="#filterProject">
                    <i className="fa-solid fa-filter fs-5"></i>
                </button>
            </div>
            {ReactDOM.createPortal(
            <form onSubmit={saveFilter}>
                <div className="modal fade" id='filterProject' tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content p-2">
                            <div className="modal-header border-0">
                                <h1 className="modal-title fw-semibold" style={{ fontSize: '18px' }}>Filter</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className='row pt-3'>
                                    <div className='col'>
                                        <label className="pb-2">ISP</label>
                                        <input
                                            className="form-control w-100 dropdown-toggle"
                                            type="text"
                                            id="dropISPProject"
                                            data-bs-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false"
                                            value={ISP.join(', ')}
                                            onChange={(e) => setISP(e.target.value)}
                                            placeholder='Select ISP'
                                            readOnly
                                        />
                                        <ul className="dropdown-menu dropdown-submenu p-2" style={{ marginTop: '-20px' }}>
                                            {/* <li className="dropdown-item" onClick={handleISPChange}>MilkFish</li>
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
                                            </li> */}
                                            {availableISP.map((isp) => (
                                                <div key={isp} className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`ispCheckbox-${isp}`}
                                                        value={isp}
                                                        checked={ISP.includes(isp)}
                                                        onChange={(e) => handleISPChange(e, isp)}
                                                    />
                                                    <label className="form-check-label" htmlFor={`ispCheckbox-${isp}`}>
                                                        {isp}
                                                    </label>
                                                </div>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className='col'>
                                            <label className="pb-2">Remarks</label>
                                            <input
                                                className="form-control w-100 dropdown-toggle"
                                                id="dropRemarksProject"
                                                data-bs-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="false"
                                                value={remarks.join(', ')}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                placeholder='Select Remarks'
                                                readOnly
                                            />
                                            <ul className="dropdown-menu dropdown-submenu p-2" style={{ marginTop: '-20px' }}>
                                                {/* <li className="dropdown-item" onClick={handleRemarksChange}>New</li>
                                                <li className="dropdown-item" onClick={handleRemarksChange}>Ongoing</li>
                                                <li className="dropdown-item" onClick={handleRemarksChange}>Completed</li>
                                                <li className="dropdown-item" onClick={handleRemarksChange}>Terminated</li> */}
                                                {['New', 'Ongoing', 'Completed', 'Terminated'].map((year) => (
                                                <div key={year} className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`yearCheckbox-${year}`}
                                                        value={year}
                                                        checked={remarks.includes(year)}
                                                        onChange={(e) => handleRemarksChange(e, year)}
                                                    />
                                                    <label className="form-check-label" htmlFor={`yearCheckbox-${year}`}>
                                                        {year}
                                                    </label>
                                                </div>
                                                ))}
                                            </ul>
                                        </div>
                                </div>  
                                <div className='row pt-3'>
                                    <div className='col'>
                                        <label className="pb-2">Year</label>
                                        <input
                                            className="form-control w-100 dropdown-toggle"
                                            id="dropYearCounter"
                                            data-bs-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false"
                                            value={selectedYears.join(', ')}
                                            onChange={(e) => setSelectedYears(e.target.value)}
                                            placeholder='Select Year/s'
                                            autoComplete='off'
                                        />
                                        <ul className="dropdown-menu dropdown-submenu p-2" style={{ marginTop: '-20px' }}>
                                            {availableYears.map((year) => (
                                                <div key={year} className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`yearCheckbox-${year}`}
                                                        value={year}
                                                        checked={selectedYears.includes(year)}
                                                        onChange={(e) => handleYearChange(e, year)}
                                                    />
                                                    <label className="form-check-label" htmlFor={`yearCheckbox-${year}`}>
                                                        {year}
                                                    </label>
                                                </div>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className='col'></div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 d-grid d-md-flex justify-content-md-start">
                                <div className='resetTooltip me-auto'>
                                    <Tooltip anchorSelect=".resetTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                                        Reset
                                    </Tooltip>
                                    <button type="button" className="btn btn-outline rounded-circle py-1 px-2" onClick={clearFilter}><i className="fa-solid fa-arrow-rotate-right"></i></button>
                                </div>
                                <button type="button" className="btn btn-outline px-3 py-2 border text-black" data-bs-dismiss="modal" style={{ fontSize: '14px' }}>Cancel</button>
                                <button className="btn btn-dark px-3 py-2 border" data-bs-dismiss="modal" style={{ fontSize: '14px' }}>Apply</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>,
                document.body
            )}
        </div>
    )
}

export default FilterCounterpartFundModal;
