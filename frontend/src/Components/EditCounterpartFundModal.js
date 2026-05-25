import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CurrencyInput from 'react-currency-input-field';

const EditCounterpartFundModal = ({ isEditModalOpen, closeModal, project, refresh, showToastF }) => {

    const [counterFund, setCounterFund] = useState([]); 
    const [originalCounterFund, setOriginalCounterFund] = useState([]);
    const [totalFund, setTotalFund] = useState('');
    const [originalStart, setOriginalStart] = useState('');
    const [originalEnd, setOriginalEnd] = useState('');

	const [showToast, setShowToast] = useState(false);
	const [showToastSuccess, setShowToastSuccess] = useState(false);
	const [toastTimeout, setToastTimeout] = useState(null);

    useEffect(() => {
        if (project && project.counterpartFundData) {
            console.log("Received project:", project);
            const fundArray = project.counterFund ? 
                Object.keys(project.counterFund).map((year) => ({
                    year: year,
                    amount: parseFloat(project.counterFund[year].replace(/,/g, '')),
                })) 
                : [];
            setCounterFund(fundArray);
            setOriginalCounterFund(fundArray);
            setTotalFund(project.counterpartFundData.totalFund)
        } else {
            console.log("Received project:", project);
        }
    }, [project]);
    

    const updateFund = async (e) => {
        e.preventDefault();

        const isFundChanged = JSON.stringify(counterFund) !== JSON.stringify(originalCounterFund);
        const isTotalFundChanged = parseFloat(totalFund) !== parseFloat(project.counterpartFundData.totalFund?.replace(/,/g, '') || '0');
        const isChanged =
        isFundChanged ||
        isTotalFundChanged;
    
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
            await axios.patch(`http://localhost:8080/CounterpartFund/${project.id}`, {
                counterFund: counterFund.map(item => ({ year: item.year, amount: item.amount })),
                totalFund: totalFund,
            });
            closeModal();
			refresh();
            showToastF();
        } catch (error) {
            console.error('Error updating fund:', error);
        }
    };

    const generateFundFields = () => {
        const startYear = new Date(project.originalStart).getFullYear();
        const endYear = new Date(project.originalEnd).getFullYear();
        const years = endYear - startYear + 1;

        const newFundData = Array.from({ length: years }, (_, index) => {
            const year = startYear + index;
            return { year, amount: '' };
        });

        setCounterFund(newFundData);
    };

    const handleFundChange = (index, amount) => {
        const updatedFundData = [...counterFund];
        updatedFundData[index].amount = amount;
        setCounterFund(updatedFundData);
    };
      
    useEffect(() => {
        const calculateTotalFund = () => {
            const total = counterFund.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
            setTotalFund(total);
        };
        calculateTotalFund();
    }, [counterFund]);  

    return (
        <div>
            <form onSubmit={updateFund}>
                <div className={`modal fade modal-overlay ${isEditModalOpen ? 'show' : ''}`} tabIndex="-1" style={{ display: isEditModalOpen ? 'block' : 'none' }}>
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content p-2">
                            <div className="modal-header border-0">
                                <h1 className="modal-title fw-semibold" style={{ fontSize: '18px' }}>Edit Counterpart Fund</h1>
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
                                <div className='container border p-4 mt-3 rounded'>
                                    <h5><b>Counterpart Funds</b></h5>
                                    <div className='row pt-3'>
                                        {!counterFund.length ? (
                                            <div className='col'>
                                                <button type="button" className="btn btn-dark px-3 py-2 border" onClick={generateFundFields} style={{ fontSize: '14px' }}>
                                                    Generate Funds Fields
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="row pt-3">
                                        {counterFund.map((item, index) => (
                                            <div key={index} className="col">
                                                <label className="pb-2">Year {item.year}</label>
                                                <CurrencyInput
                                                    id={`input-${index}`}
                                                    name={`input-name-${index}`}
                                                    placeholder="Enter amount"
                                                    defaultValue={item.amount ? item.amount : ''}
                                                    decimalsLimit={2}
                                                    onValueChange={(value) => handleFundChange(index, parseFloat(value))}
                                                    className='form-control'
                                                />
                                            </div>
                                        ))}
                                        <div className="col">
                                            <label className="pb-2">Total Fund</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={totalFund ? totalFund.toLocaleString() : ''}
                                                onChange={(e) => setTotalFund(e.target.value)}
                                                readOnly
                                            />
                                        </div>
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
        </div>
    )
}

export default EditCounterpartFundModal;
