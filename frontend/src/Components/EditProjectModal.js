import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CurrencyInput from 'react-currency-input-field';

const EditProjectModal = ({ isEditModalOpen, closeModal, project, refresh, showToastF }) => {

    const [projectCode, setProjectCode] = useState('');
    const [ISP, setISP] = useState('');
    const [programTitle, setProgramTitle] = useState('');
    const [projectTitle, setProjectTitle] = useState('');
    const [responsiblePerson, setResponsiblePerson] = useState('');
    const [funding, setFunding] = useState('');
    const [budget, setBudget] = useState([]);
    const [totalBudget, setTotalBudget] = useState('');
    const [implementingAgency, setImplementingAgency] = useState('');
    const [programLeader, setProgramLeader] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [postalAddress, setPostalAddress] = useState('');
    const [cooperatingAgency, setCooperatingAgency] = useState('');
    const [originalStart, setOriginalStart] = useState('');
    const [originalEnd, setOriginalEnd] = useState('');
    const [changeStart, setChangeStart] = useState('');
    const [changeImplementationDate, setChangeImplementationDate] = useState('');
    const [firstExtension, setFirstExtension] = useState({ type: 'single', value: '' });
    const [secondExtension, setSecondExtension] = useState({ type: 'single', value: '' });
    const [objectives, setObjectives] = useState('');
    const [description, setDescription] = useState('');
    const [deliverables, setDeliverables] = useState('');
    const [beneficiaries, setBeneficiaries] = useState('');
    const [dcY1Approval, setDcY1Approval] = useState('');
    const [gcY1Approval, setGcY1Approval] = useState('');
    const [execomY1Approval, setExecomY1Approval] = useState('');
    const [dcY2Renewal, setDcY2Renewal] = useState('');
    const [gcY2Renewal, setGcY2Renewal] = useState('');
    const [execomY2Renewal, setExecomY2Renewal] = useState('');
    const [dcY3Renewal, setDcY3Renewal] = useState('');
    const [gcY3Renewal, setGcY3Renewal] = useState('');
    const [execomY3Renewal, setExecomY3Renewal] = useState('');
    const [inceptionMeeting, setInceptionMeeting] = useState({ type: 'single', value: '' });
    const [mande, setMandE] = useState([{ type: 'single', value: '', comment: '' }]);
    const [y1BudgetRealignment, setY1BudgetRealignment] = useState([{ type: 'single', value: '' }]);
    const [y2BudgetRealignment, setY2BudgetRealignment] = useState([{ type: 'single', value: '' }]);
    const [y3BudgetRealignment, setY3BudgetRealignment] = useState([{ type: 'single', value: '' }]);
    const [programReview, setProgramReview] = useState([{ type: 'single', value: '' }]);
    const [terminalReview, setTerminalReview] = useState([{ type: 'single', value: '' }]);
    const [status, setStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [submissionTerminal, setSubmissionTerminal] = useState('');

    //6Ps
    const [sixPs, setSixPs] = useState([]);

    const [selectedYear, setSelectedYear] = useState('');

    const [showToast, setShowToast] = useState(false);
    const [showToastSuccess, setShowToastSuccess] = useState(false);
    const [toastTimeout, setToastTimeout] = useState(null);

    const handleYearChange = (event) => {
        const year = event.target.value;
        setSelectedYear(year);
    };

    useEffect(() => {
        if (project && project.sixPSData) {
            console.log(project)
            setProjectCode(project.projectCode);
            setISP(project.ISP);
            setProgramTitle(project.programTitle);
            setProjectTitle(project.projectTitle);
            setResponsiblePerson(project.responsiblePerson);
            setFunding(project.funding);
            const budgetArray = project.budget ?
                Object.keys(project.budget).map((year) => ({
                    year: year,
                    amount: parseFloat(project.budget[year].replace(/,/g, '')),
                }))
                : [];
            setBudget(budgetArray);
            setTotalBudget(project.totalBudget)
            setImplementingAgency(project.implementingAgency);
            setProgramLeader(project.programLeader);
            setEmailAddress(project.emailAddress);
            setContactNumber(project.contactNumber);
            setPostalAddress(project.postalAddress);
            setCooperatingAgency(project.cooperatingAgency);
            setOriginalStart(project.originalStart);
            setOriginalEnd(project.originalEnd);
            setChangeStart(project.changeStart);
            setChangeImplementationDate(project.changeImplementationDate);
            const trimmedFirstExtension = project.firstExtension.trim();
            let parsedFirstExtension;

            if (trimmedFirstExtension.includes(' - ')) {
                const [start, end] = trimmedFirstExtension.split(' - ');
                parsedFirstExtension = { type: 'range', value: start, end };
            } else {
                parsedFirstExtension = { type: 'single', value: trimmedFirstExtension, end: '' };
            }
            setFirstExtension(parsedFirstExtension);
            const trimmedSecondExtension = project.secondExtension.trim();
            let parsedSecondExtension;

            if (trimmedSecondExtension.includes(' - ')) {
                const [start, end] = trimmedSecondExtension.split(' - ');
                parsedSecondExtension = { type: 'range', value: start, end };
            } else {
                parsedSecondExtension = { type: 'single', value: trimmedSecondExtension, end: '' };
            }
            setSecondExtension(parsedSecondExtension);
            setObjectives(project.objectives);
            setDescription(project.description);
            setDeliverables(project.deliverables);
            setBeneficiaries(project.beneficiaries);
            setDcY1Approval(project.dcY1Approval);
            setGcY1Approval(project.gcY1Approval);
            setExecomY1Approval(project.execomY1Approval);
            setDcY2Renewal(project.dcY2Renewal);
            setGcY2Renewal(project.gcY2Renewal);
            setExecomY2Renewal(project.execomY2Renewal);
            setDcY3Renewal(project.dcY3Renewal);
            setGcY3Renewal(project.gcY3Renewal);
            setExecomY3Renewal(project.execomY3Renewal);
            const trimmedInception = project.inceptionMeeting.trim();
            let parsedInception;

            if (trimmedInception.includes(' - ')) {
                const [start, end] = trimmedInception.split(' - ');
                parsedInception = { type: 'range', value: start, end };
            } else {
                parsedInception = { type: 'single', value: trimmedInception, end: '' };
            }
            setInceptionMeeting(parsedInception);
            const parsedMandE = project.mande.split(',').map(entry => {
                const [datePart, commentPart] = entry.split('(').map(part => part.trim());
                const comment = commentPart ? commentPart.slice(0, -1) : ''; // Remove the closing parenthesis
                if (datePart.includes(' - ')) {
                    const [start, end] = datePart.split(' - ').map(d => d.trim());
                    return { type: 'range', value: start, end, comment };
                } else {
                    return { type: 'single', value: datePart, end: '', comment };
                }
            });
            setMandE(parsedMandE);
            const parsedY1Budget = project.y1BudgetRealignment.split(',').map(date => {
                const trimmedDate = date.trim();
                if (trimmedDate.includes(' - ')) {
                    const [start, end] = trimmedDate.split(' - ');
                    return { type: 'range', value: start, end };
                } else {
                    return { type: 'single', value: trimmedDate, end: '' };
                }
            });
            setY1BudgetRealignment(parsedY1Budget);
            const parsedY2Budget = project.y2BudgetRealignment.split(',').map(date => {
                const trimmedDate = date.trim();
                if (trimmedDate.includes(' - ')) {
                    const [start, end] = trimmedDate.split(' - ');
                    return { type: 'range', value: start, end };
                } else {
                    return { type: 'single', value: trimmedDate, end: '' };
                }
            });
            setY2BudgetRealignment(parsedY2Budget);
            const parsedY3Budget = project.y3BudgetRealignment.split(',').map(date => {
                const trimmedDate = date.trim();
                if (trimmedDate.includes(' - ')) {
                    const [start, end] = trimmedDate.split(' - ');
                    return { type: 'range', value: start, end };
                } else {
                    return { type: 'single', value: trimmedDate, end: '' };
                }
            });
            setY3BudgetRealignment(parsedY3Budget);
            const parsedPReview = project.programReview.split(',').map(date => {
                const trimmedDate = date.trim();
                if (trimmedDate.includes(' - ')) {
                    const [start, end] = trimmedDate.split(' - ');
                    return { type: 'range', value: start, end };
                } else {
                    return { type: 'single', value: trimmedDate, end: '' };
                }
            });
            setProgramReview(parsedPReview);
            const parsedTReview = project.terminalReview.split(',').map(date => {
                const trimmedDate = date.trim();
                if (trimmedDate.includes(' - ')) {
                    const [start, end] = trimmedDate.split(' - ');
                    return { type: 'range', value: start, end };
                } else {
                    return { type: 'single', value: trimmedDate, end: '' };
                }
            });
            setTerminalReview(parsedTReview);
            setSubmissionTerminal(project.submissionTerminal);
            setStatus(project.status);
            setRemarks(project.remarks);

            const sixPsArray = project.sixPs
                ? Object.keys(project.sixPs).map((year) => ({
                    year: year,
                    targetPublication: project.sixPs[year].targetPublication,
                    actualaccomplishmentPeer: project.sixPs[year].actualaccomplishmentPeer,
                    actualaccomplishmentJournal: project.sixPs[year].actualaccomplishmentJournal,
                    actualaccomplishmentPresented: project.sixPs[year].actualaccomplishmentPresented,
                    details: project.sixPs[year].details,
                    actualaccomplishmentIEC: project.sixPs[year].actualaccomplishmentIEC,
                    targetProduct: project.sixPs[year].targetProduct,
                    techName: project.sixPs[year].techName,
                    techDescription: project.sixPs[year].techDescription,
                    targetPatent: project.sixPs[year].targetPatent,
                    agency: project.sixPs[year].agency,
                    techNamePro: project.sixPs[year].techNamePro,
                    statusSix: project.sixPs[year].statusSix,
                    dost: project.sixPs[year].dost,
                    patentNumber: project.sixPs[year].patentNumber,
                    targetPeople: project.sixPs[year].targetPeople,
                    namesBS: project.sixPs[year].namesBS,
                    namesMS: project.sixPs[year].namesMS,
                    namesPhD: project.sixPs[year].namesPhD,
                    targetPlaces: project.sixPs[year].targetPlaces,
                    cooperators: project.sixPs[year].cooperators,
                    international: project.sixPs[year].international,
                    privateSixPS: project.sixPs[year].privateSixPS,
                    targetPolicy: project.sixPs[year].targetPolicy,
                    policyRecommendation: project.sixPs[year].policyRecommendation,
                }))
                : [];
            console.log(sixPsArray)
            console.log(project.sixPs)
            setSixPs(sixPsArray);

        }
    }, [project]);

    const handleMandEChange = (index, field, value, type) => {
        const newDates = [...mande];
        newDates[index][field] = value;
        if (type) newDates[index].type = type;
        setMandE(newDates);
    };

    const handleY1BudgetChange = (index, field, value, type) => {
        const newDates = [...y1BudgetRealignment];
        newDates[index][field] = value;
        newDates[index].type = type;
        setY1BudgetRealignment(newDates);
    };

    const handleY2BudgetChange = (index, field, value, type) => {
        const newDates = [...y2BudgetRealignment];
        newDates[index][field] = value;
        newDates[index].type = type;
        setY2BudgetRealignment(newDates);
    };

    const handleY3BudgetChange = (index, field, value, type) => {
        const newDates = [...y3BudgetRealignment];
        newDates[index][field] = value;
        newDates[index].type = type;
        setY3BudgetRealignment(newDates);
    };

    const handleProgramReviewChange = (index, field, value, type) => {
        const newDates = [...programReview];
        newDates[index][field] = value;
        newDates[index].type = type;
        setProgramReview(newDates);
    };

    const handleTerminalReviewChange = (index, field, value, type) => {
        const newDates = [...terminalReview];
        newDates[index][field] = value;
        newDates[index].type = type;
        setTerminalReview(newDates);
    };

    const handleFirstExtensionChange = (field, value) => {
        setFirstExtension({ ...firstExtension, [field]: value });
    };

    const handleSecondExtensionChange = (field, value) => {
        setSecondExtension({ ...secondExtension, [field]: value });
    };

    const handleInceptionChange = (field, value) => {
        setInceptionMeeting({ ...inceptionMeeting, [field]: value });
    };

    const handleRemoveMandE = (index) => {
        const newDates = [...mande];
        newDates.splice(index, 1);
        setMandE(newDates);
    };

    const handleAddMandE = () => {
        setMandE([...mande, { type: 'single', value: '', comment: '' }]);
    };

    const handleRemoveY1Budget = (index) => {
        const newDates = [...y1BudgetRealignment];
        newDates.splice(index, 1);
        setY1BudgetRealignment(newDates);
    };

    const handleAddY1Budget = () => {
        setY1BudgetRealignment([...y1BudgetRealignment, { type: 'single', value: '' }]);
    };

    const handleRemoveY2Budget = (index) => {
        const newDates = [...y2BudgetRealignment];
        newDates.splice(index, 1);
        setY2BudgetRealignment(newDates);
    };

    const handleAddY2Budget = () => {
        setY2BudgetRealignment([...y2BudgetRealignment, { type: 'single', value: '' }]);
    };

    const handleRemoveY3Budget = (index) => {
        const newDates = [...y3BudgetRealignment];
        newDates.splice(index, 1);
        setY3BudgetRealignment(newDates);
    };

    const handleAddY3Budget = () => {
        setY3BudgetRealignment([...y3BudgetRealignment, { type: 'single', value: '' }]);
    };

    const handleRemovePReview = (index) => {
        const newDates = [...programReview];
        newDates.splice(index, 1);
        setProgramReview(newDates);
    };

    const handleAddPReview = () => {
        setProgramReview([...programReview, { type: 'single', value: '' }]);
    };

    const handleRemoveTReview = (index) => {
        const newDates = [...terminalReview];
        newDates.splice(index, 1);
        setTerminalReview(newDates);
    };

    const handleAddTReview = () => {
        setTerminalReview([...terminalReview, { type: 'single', value: '' }]);
    };

    const updateProject = async (e) => {
        e.preventDefault();

        const formatValue = (data) => {
            if (data.type === 'range') {
                return data.value + ' - ' + data.end;
            }
            return data.value;
        };

        const formatValuemande = (data) => {
            if (data.type === 'range') {
                return `${data.value} - ${data.end} (${data.comment})`;
            }
            return `${data.value} (${data.comment})`;
        };

        const formattedMandE = mande.map(formatValuemande).join(', ');
        const formattedFirstExtension = formatValue(firstExtension);
        const formattedSecondExtension = formatValue(secondExtension);
        const formattedInception = formatValue(inceptionMeeting);
        const formattedY1Budget = y1BudgetRealignment.map(formatValue).join(', ');
        const formattedY2Budget = y2BudgetRealignment.map(formatValue).join(', ');
        const formattedY3Budget = y3BudgetRealignment.map(formatValue).join(', ');
        const formattedPReview = programReview.map(formatValue).join(', ');
        const formattedTReview = terminalReview.map(formatValue).join(', ');

        const isBudgetChanged = project.budgetArray && JSON.stringify(budget) !== JSON.stringify(project.budgetArray);
        const isTotalBudgetChanged = parseFloat(totalBudget) !== parseFloat(project.totalBudget?.replace(/,/g, '') || '0');
        const isSixPsChanged = project.sixPsArray && JSON.stringify(sixPs) !== JSON.stringify(project.sixPsArray);


        const isChanged =
            ISP !== project.ISP ||
            programTitle !== project.programTitle ||
            projectTitle !== project.projectTitle ||
            responsiblePerson !== project.responsiblePerson ||
            funding !== project.funding ||
            isBudgetChanged ||
            isTotalBudgetChanged ||
            implementingAgency !== project.implementingAgency ||
            programLeader !== project.programLeader ||
            emailAddress !== project.emailAddress ||
            contactNumber !== project.contactNumber ||
            postalAddress !== project.postalAddress ||
            cooperatingAgency !== project.cooperatingAgency ||
            originalStart !== project.originalStart ||
            originalEnd !== project.originalEnd ||
            changeStart !== project.changeStart ||
            changeImplementationDate !== project.changeImplementationDate ||
            formattedFirstExtension !== project.firstExtension ||
            formattedSecondExtension !== project.secondExtension ||
            objectives !== project.objectives ||
            description !== project.description ||
            deliverables !== project.deliverables ||
            beneficiaries !== project.beneficiaries ||
            dcY1Approval !== project.dcY1Approval ||
            gcY1Approval !== project.gcY1Approval ||
            execomY1Approval !== project.execomY1Approval ||
            dcY2Renewal !== project.dcY2Renewal ||
            gcY2Renewal !== project.gcY2Renewal ||
            execomY2Renewal !== project.execomY2Renewal ||
            dcY3Renewal !== project.dcY3Renewal ||
            gcY3Renewal !== project.gcY3Renewal ||
            execomY3Renewal !== project.execomY3Renewal ||
            formattedInception !== project.inceptionMeeting ||
            formattedMandE !== project.mande ||
            formattedY1Budget !== project.y1BudgetRealignment ||
            formattedY2Budget !== project.y2BudgetRealignment ||
            formattedY3Budget !== project.y3BudgetRealignment ||
            formattedPReview !== project.programReview ||
            formattedTReview !== project.terminalReview ||
            submissionTerminal !== project.submissionTerminal ||
            status !== project.status ||
            remarks !== project.remarks ||
            isSixPsChanged;
            // isFileChanged ||

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
            await axios.patch(`http://localhost:8080/Projects/${project.id}`, {
                ISP: ISP,
                programTitle: programTitle,
                projectTitle: projectTitle,
                responsiblePerson: responsiblePerson,
                funding: funding,
                budget: budget.map(item => ({ year: item.year, amount: item.amount })),
                totalBudget: totalBudget,
                implementingAgency: implementingAgency,
                programLeader: programLeader,
                emailAddress: emailAddress,
                contactNumber: contactNumber,
                postalAddress: postalAddress,
                cooperatingAgency: cooperatingAgency,
                originalStart: originalStart,
                originalEnd: originalEnd,
                changeStart: changeStart,
                changeImplementationDate: changeImplementationDate,
                firstExtension: formattedFirstExtension,
                secondExtension: formattedSecondExtension,
                objectives: objectives,
                description: description,
                deliverables: deliverables,
                beneficiaries: beneficiaries,
                dcY1Approval: dcY1Approval,
                gcY1Approval: gcY1Approval,
                execomY1Approval: execomY1Approval,
                dcY2Renewal: dcY2Renewal,
                gcY2Renewal: gcY2Renewal,
                execomY2Renewal: execomY2Renewal,
                dcY3Renewal: dcY3Renewal,
                gcY3Renewal: gcY3Renewal,
                execomY3Renewal: execomY3Renewal,
                inceptionMeeting: formattedInception,
                mande: formattedMandE,
                y1BudgetRealignment: formattedY1Budget,
                y2BudgetRealignment: formattedY2Budget,
                y3BudgetRealignment: formattedY3Budget,
                programReview: formattedPReview,
                terminalReview: formattedTReview,
                submissionTerminal: submissionTerminal,
                status: status,
                remarks: remarks,
            });

            await axios.patch(`http://localhost:8080/SixPS/${project.id}`, {
                sixPs: sixPs.map(item => ({
                    year: item.year,
                    targetPublication: item.targetPublication,
                    actualaccomplishmentPeer: item.actualaccomplishmentPeer,
                    actualaccomplishmentJournal: item.actualaccomplishmentJournal,
                    actualaccomplishmentPresented: item.actualaccomplishmentPresented,
                    details: item.details,
                    actualaccomplishmentIEC: item.actualaccomplishmentIEC,
                    targetProduct: item.targetProduct,
                    techName: item.techName,
                    techDescription: item.techDescription,
                    targetPatent: item.targetPatent,
                    agency: item.agency,
                    techNamePro: item.techNamePro,
                    statusSix: item.statusSix,
                    dost: item.dost,
                    patentNumber: item.patentNumber,
                    targetPeople: item.targetPeople,
                    namesBS: item.namesBS,
                    namesMS: item.namesMS,
                    namesPhD: item.namesPhD,
                    targetPlaces: item.targetPlaces,
                    cooperators: item.cooperators,
                    international: item.international,
                    privateSixPS: item.privateSixPS,
                    targetPolicy: item.targetPolicy,
                    policyRecommendation: item.policyRecommendation,
                })),
            });

            console.log('Project updated successfully');
            closeModal();
            refresh();
            showToastF();
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    const generateFields = () => {
        const startYear = new Date(project.originalStart).getFullYear();
        const endYear = new Date(project.originalEnd).getFullYear();
        const years = endYear - startYear + 1;

        const newSixPsData = Array.from({ length: years }, (_, index) => {
            const year = startYear + index;
            return { year, targetPublication: '', actualAccomplishmentPeer: '', actualAccomplishmentJournal: '', actualAccomplishmentPresented: '', details: '', actualAccomplishmentIEC: '', targetProduct: '', techName: '', techDescription: '', targetPatent: '', agency: '', techNamePro: '', statusSix: '', dost: '', patentNumber: '', targetPeople: '', namesBS: '', namesMS: '', namesPhD: '', targetPlaces: '', cooperators: '', international: '', privateSixPS: '', targetPolicy: '', policyRecommendation: '' };
        });

        setSixPs(newSixPsData);
    };

    const handleFieldChange = (index, field, value) => {
        const updatedData = [...sixPs];
        updatedData[index][field] = value;
        setSixPs(updatedData);
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

    // const handleImplementingChange = (e) => {
    //     setImplementingAgency(e.target.innerText);
    // }

    // const handleCooperatingChange = (e) => {
    //     setCooperatingAgency(e.target.innerText);
    // }  

    const handleRemarksChange = (e) => {
        setRemarks(e.target.innerText);
    }

    // const handleDOSTChange = (e) => {
    //     setDOST(e.target.innerText);
    // } 

    const generateBudgetFields = () => {
        const startYear = new Date(originalStart).getFullYear();
        const endYear = new Date(originalEnd).getFullYear();
        const years = endYear - startYear + 1;

        const newBudgetData = Array.from({ length: years }, (_, index) => {
            const year = startYear + index;
            return { year, amount: '' };
        });

        setBudget(newBudgetData);
    };

    const handleBudgetChange = (index, amount) => {
        const updatedBudgetData = [...budget];
        updatedBudgetData[index].amount = amount;
        setBudget(updatedBudgetData);
    };

    // const handleImplementationFileChange = (e) => {
    //     setImplementationFile(e.target.files[0]);
    // };
    // const handleExtensionFileChange = (e) => {
    //     setExtensionFile(e.target.files[0]);
    // };
    // const handleRealignmentFileChange = (e) => {
    //     setRealignmentFile(e.target.files[0]);
    // };

    useEffect(() => {
        const calculateTotalBudget = () => {
            const total = budget.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
            setTotalBudget(total);
        };
        calculateTotalBudget();
    }, [budget]);

    if (!isEditModalOpen) {
        return null;
    }

    return (
        <div>
            <form onSubmit={updateProject}>
                <div className={`modal fade modal-overlay ${isEditModalOpen ? 'show' : ''}`} tabIndex="-1" style={{ display: isEditModalOpen ? 'block' : 'none' }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '80rem' }}>
                        <div className="modal-content p-2">
                            <div className="modal-header border-0">
                                <h1 className="modal-title fw-semibold" style={{ fontSize: '18px' }}>Edit Project</h1>
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
                                    <h5><b>Project Details</b></h5>
                                    <div className="row pt-3">
                                        <div className="col">
                                            <label className="pb-2">Project Code</label>
                                            <input type="text" className="form-control" value={projectCode} onChange={(e) => setProjectCode(e.target.value)} readOnly/>
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">ISP</label>
                                            <input
                                                className="form-control dropdown-toggle"
                                                type="text"
                                                id="dropISPEdit"
                                                data-bs-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="false"
                                                value={ISP}
                                                onChange={(e) => setISP(e.target.value)}
                                                placeholder='Select ISP'
                                                readOnly
                                            />
                                            <ul className="dropdown-menu p-0" aria-labelledby="dropISPEdit">
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
                                                id="dropResPer"
                                                data-bs-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="false"
                                                value={responsiblePerson}
                                                onChange={(e) => setResponsiblePerson(e.target.value)}
                                                placeholder='Select Responsible Person'
                                                readOnly
                                            />
                                            <ul className="dropdown-menu p-0" aria-labelledby="dropResPer">
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
                                            <label className="pb-2">Funding</label>
                                            <input
                                                className="form-control w-100 dropdown-toggle"
                                                id="dropFunding"
                                                data-bs-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="false"
                                                value={funding}
                                                onChange={(e) => setFunding(e.target.value)}
                                                placeholder='Select Funding'
                                                readOnly
                                            />
                                            <ul className="dropdown-menu p-0" aria-labelledby="dropFunding">
                                                <li className="dropdown-item" onClick={handleFundingChange}>DOST GIA</li>
                                                <li className="dropdown-item" onClick={handleFundingChange}>PCAARRD GIA</li>
                                            </ul>
                                        </div>
                                        <div className="col">
                                            <label className="pb-2">Implementing Agency</label>
                                            <input type="text" className="form-control" value={implementingAgency} onChange={(e) => setImplementingAgency(e.target.value)} />
                                        </div>
                                        <div className='col'>
                                            <div className="col">
                                                <label className="pb-2">Program/Project Leader</label>
                                                <input type="text" className="form-control" value={programLeader} onChange={(e) => setProgramLeader(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row pt-3">
                                        <div className="col">
                                            <label className="pb-2">Email Address</label>
                                            <input type="email" className="form-control" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />
                                        </div>
                                        <div className="col">
                                            <label className="pb-2">Contact Number</label>
                                            <input type="number" className="form-control" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                                        </div>
                                        <div className="col">
                                            <label className="pb-2">Postal Address</label>
                                            <input type="text" className="form-control" value={postalAddress} onChange={(e) => setPostalAddress(e.target.value)} />
                                        </div>
                                        <div className="col">
                                            <label className="pb-2">Cooperating Agency</label>
                                            <input type="text" className="form-control" value={cooperatingAgency} onChange={(e) => setCooperatingAgency(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="row pt-3">
                                        <div className="col">
                                            <label className="pb-2">Objectives</label>
                                            <textarea type="text" className="form-control" value={objectives} onChange={(e) => setObjectives(e.target.value)} />
                                        </div>
                                        <div className="col">
                                            <label className="pb-2">Description</label>
                                            <textarea type="text" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
                                        </div>
                                        <div className="col">
                                            <label className="pb-2">Deliverables</label>
                                            <textarea type="text" className="form-control" value={deliverables} onChange={(e) => setDeliverables(e.target.value)} />
                                        </div>
                                        <div className="col">
                                            <label className="pb-2">Beneficiaries</label>
                                            <textarea type="text" className="form-control" value={beneficiaries} onChange={(e) => setBeneficiaries(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className='container border p-4 mt-3 rounded'>
                                    <h5><b>Project Duration</b></h5>
                                    <div className="row pt-3">
                                        <div className='col'>
                                            <label className="pb-2">Original Start</label>
                                            <input type="date" className="form-control" value={originalStart} onChange={(e) => setOriginalStart(e.target.value)} />
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">Original End</label>
                                            <input type="date" className="form-control" value={originalEnd} onChange={(e) => setOriginalEnd(e.target.value)} />
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">Change Start</label>
                                            <input type="date" className="form-control" value={changeStart} onChange={(e) => setChangeStart(e.target.value)} />
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">Change of Implementation Date</label>
                                            <input type="date" className="form-control" value={changeImplementationDate} onChange={(e) => setChangeImplementationDate(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="row pt-3">
                                        <div className='col'>
                                            <label className="pb-2">First Extension</label>
                                            <div className="pb-2 d-flex align-items-center">
                                                <div className='pb-2'>
                                                    <input
                                                        type="radio"
                                                        value="single"
                                                        checked={firstExtension.type === 'single'}
                                                        onChange={() => handleFirstExtensionChange('type', 'single')}
                                                    />
                                                    <label className='me-2'>Single</label>
                                                    <input
                                                        type="radio"
                                                        value="range"
                                                        checked={firstExtension.type === 'range'}
                                                        onChange={() => handleFirstExtensionChange('type', 'range')}
                                                    />
                                                    <label className='me-2'>Range</label>
                                                </div>
                                                {firstExtension.type === 'single' ? (
                                                    <div className='pb-2'>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={firstExtension.value || ''}
                                                            onChange={(e) => handleFirstExtensionChange('value', e.target.value)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className='pb-2 d-flex align-items-center'>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={firstExtension.value || ''}
                                                            onChange={(e) => handleFirstExtensionChange('value', e.target.value)}
                                                        />
                                                        <label className='mx-2'>-</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={firstExtension.end || ''}
                                                            onChange={(e) => handleFirstExtensionChange('end', e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">2nd Extension</label>
                                            <div className="pb-2 d-flex align-items-center">
                                                <div className='pb-2'>
                                                    <input
                                                        type="radio"
                                                        value="single"
                                                        checked={secondExtension.type === 'single'}
                                                        onChange={() => handleSecondExtensionChange('type', 'single')}
                                                    />
                                                    <label className='me-2'>Single</label>
                                                    <input
                                                        type="radio"
                                                        value="range"
                                                        checked={secondExtension.type === 'range'}
                                                        onChange={() => handleSecondExtensionChange('type', 'range')}
                                                    />
                                                    <label className='me-2'>Range</label>
                                                </div>
                                                {secondExtension.type === 'single' ? (
                                                    <div className='pb-2'>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={secondExtension.value || ''}
                                                            onChange={(e) => handleSecondExtensionChange('value', e.target.value)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className='pb-2 d-flex align-items-center'>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={secondExtension.value || ''}
                                                            onChange={(e) => handleSecondExtensionChange('value', e.target.value)}
                                                        />
                                                        <label className='mx-2'>-</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={secondExtension.end || ''}
                                                            onChange={(e) => handleSecondExtensionChange('end', e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className='row pt-3'>
                                        <div className='col'>
                                            <label className="pb-2">Supporting File (Change Implementation)</label>
                                            <input type="file" className='form-control' onChange={handleImplementationFileChange} />
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">Supporting File (Extension)</label>
                                            <input type="file" className='form-control' onChange={handleExtensionFileChange} />
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">Supporting File (Budget Realignment)</label>
                                            <input type="file" className='form-control' onChange={handleRealignmentFileChange} />
                                        </div>
                                    </div> */}
                                    <div className='row pt-3'>
                                        {!budget.length ? (
                                            <div className='col'>
                                                <button type="button" className="btn btn-dark px-3 py-2 border" onClick={generateBudgetFields} style={{ fontSize: '14px' }}>
                                                    Generate Budget Fields
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                <div className='container border p-4 mt-3 rounded'>
                                    <h5><b>Budget</b></h5>
                                    <div className="row pt-3">
                                        {budget.map((item, index) => (
                                            <div key={index} className="col">
                                                <label className="pb-2">Year {index + 1}</label>
                                                <CurrencyInput
                                                    id={`input-${index}`}
                                                    name={`input-name-${index}`}
                                                    placeholder="Enter amount"
                                                    defaultValue={item.amount ? item.amount : ''}
                                                    decimalsLimit={2}
                                                    onValueChange={(value) => handleBudgetChange(index, parseFloat(value))}
                                                    className='form-control'
                                                />
                                            </div>
                                        ))}
                                        <div className="col">
                                            <label className="pb-2">Total Budget</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={totalBudget ? totalBudget.toLocaleString() : ''}
                                                onChange={(e) => setTotalBudget(e.target.value)}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='container border p-4 mt-3 rounded'>
                                    <h5><b>Approvals</b></h5>
                                    <div className="row pt-3">
                                        <div className='col'>
                                            <label className="pb-2">DC Y1 Approval</label>
                                            <input type="date" className="form-control" value={dcY1Approval} onChange={(e) => setDcY1Approval(e.target.value)} />
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">GC Y1 Approval</label>
                                            <input type="date" className="form-control" value={gcY1Approval} onChange={(e) => setGcY1Approval(e.target.value)} />
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">Execom Y1 Approval</label>
                                            <input type="date" className="form-control" value={execomY1Approval} onChange={(e) => setExecomY1Approval(e.target.value)} />
                                        </div>
                                    </div>
                                    <h5 className='pt-3'><b>Renewals</b></h5>
                                    <div className="row pt-3">
                                        <div className='col'>
                                            <label className="pb-2">DC Y2 Renewal</label>
                                            <input type="date" className="form-control" value={dcY2Renewal} onChange={(e) => setDcY2Renewal(e.target.value)} />
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">GC Y2 Renewal</label>
                                            <input type="date" className="form-control" value={gcY2Renewal} onChange={(e) => setGcY2Renewal(e.target.value)} />
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">Execom Y2 Renewal</label>
                                            <input type="date" className="form-control" value={execomY2Renewal} onChange={(e) => setExecomY2Renewal(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="row pt-3">
                                        <div className='col'>
                                            <label className="pb-2">DC Y3 Renewal</label>
                                            <input type="date" className="form-control" value={dcY3Renewal} onChange={(e) => setDcY3Renewal(e.target.value)} />
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">GC Y3 Renewal</label>
                                            <input type="date" className="form-control" value={gcY3Renewal} onChange={(e) => setGcY3Renewal(e.target.value)} />
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">Execom Y3 Renewal</label>
                                            <input type="date" className="form-control" value={execomY3Renewal} onChange={(e) => setExecomY3Renewal(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className='container border p-4 mt-3 rounded'>
                                    <h5><b>Meetings</b></h5>
                                    <div className="row pt-3">
                                        <div className='col'>
                                            <label className="pb-2">Inception Meeting</label>
                                            <div className="pb-2 d-flex align-items-center">
                                                <div className='pb-2'>
                                                    <input
                                                        type="radio"
                                                        value="single"
                                                        checked={inceptionMeeting.type === 'single'}
                                                        onChange={() => handleInceptionChange('type', 'single')}
                                                    />
                                                    <label className='me-2'>Single</label>
                                                    <input
                                                        type="radio"
                                                        value="range"
                                                        checked={inceptionMeeting.type === 'range'}
                                                        onChange={() => handleInceptionChange('type', 'range')}
                                                    />
                                                    <label className='me-2'>Range</label>
                                                </div>
                                                {inceptionMeeting.type === 'single' ? (
                                                    <div className='pb-2'>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={inceptionMeeting.value || ''}
                                                            onChange={(e) => handleInceptionChange('value', e.target.value)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className='pb-2 d-flex align-items-center'>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={inceptionMeeting.value || ''}
                                                            onChange={(e) => handleInceptionChange('value', e.target.value)}
                                                        />
                                                        <label className='mx-2'>-</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={inceptionMeeting.end || ''}
                                                            onChange={(e) => handleInceptionChange('end', e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                    </div>
                                    <div className="row pt-3">
                                        <div className="col">
                                            <label className="pb-2">M&E</label>
                                            <span className="btn p-0 px-2" onClick={handleAddMandE}>
                                            <i className="bi bi-plus-circle text-primary"></i>
                                            </span>
                                            {mande.map((date, index) => (
                                            <div key={index} className="d-flex align-items-start pb-2">
                                                <div className="me-3 my-2">
                                                <input
                                                    type="radio"
                                                    value="single"
                                                    checked={date.type === 'single'}
                                                    onChange={(e) => handleMandEChange(index, 'type', e.target.value)}
                                                />
                                                <label className="form-check-label ms-1 me-2">Single</label>
                                                <input
                                                    type="radio"
                                                    value="range"
                                                    checked={date.type === 'range'}
                                                    onChange={(e) => handleMandEChange(index, 'type', e.target.value)}
                                                />
                                                <label className="form-check-label ms-1 me-2">Range</label>
                                                </div>

                                                {date.type === 'single' ? (
                                                <div className="me-3">
                                                    <input
                                                    type="date"
                                                    className="form-control"
                                                    value={date.value || ''}
                                                    onChange={(e) => handleMandEChange(index, 'value', e.target.value, 'single')}
                                                    />
                                                </div>
                                                ) : (
                                                <div className="d-flex align-items-center me-3">
                                                    <input
                                                    type="date"
                                                    className="form-control"
                                                    value={date.value || ''}
                                                    onChange={(e) => handleMandEChange(index, 'value', e.target.value, 'range')}
                                                    />
                                                    <label className="mx-2">-</label>
                                                    <input
                                                    type="date"
                                                    className="form-control"
                                                    value={date.end || ''}
                                                    onChange={(e) => handleMandEChange(index, 'end', e.target.value, 'range')}
                                                    />
                                                </div>
                                                )}

                                                <div className="flex-grow-1 me-3">
                                                <textarea   
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Comment"
                                                    value={date.comment || ''}
                                                    onChange={(e) => handleMandEChange(index, 'comment', e.target.value)}
                                                    rows="1"
                                                />
                                                </div>

                                                <span className="btn p-0 text-danger my-2" onClick={() => handleRemoveMandE(index)}>
                                                <i className="bi bi-dash-circle"></i>
                                                </span>
                                            </div>
                                            ))}
                                        </div>
                                        </div>

                                </div>
                                <div className='container border p-4 mt-3 rounded'>
                                    <h5><b>Budget Realignment</b></h5>
                                    <div className="row pt-3">
                                        <div className='col'>
                                            <label className='pb-2'>Y1 Budget Realignment</label>
                                            <span className='btn p-0 px-2' onClick={handleAddY1Budget}><i className="bi bi-plus-circle text-primary"></i></span>
                                            {y1BudgetRealignment.map((date, index) => (
                                                <div key={index} className="pb-2 d-flex align-items-center">
                                                    <div className="pb-2">
                                                        <input
                                                            type="radio"
                                                            value="single"
                                                            checked={date.type === 'single'}
                                                            onChange={(e) => handleY1BudgetChange(index, 'type', e.target.value, e.target.value)}
                                                        />
                                                        <label className='me-2'>Single</label>
                                                        <input
                                                            type="radio"
                                                            value="range"
                                                            checked={date.type === 'range'}
                                                            onChange={(e) => handleY1BudgetChange(index, 'type', e.target.value, e.target.value)}
                                                        />
                                                        <label className='me-2'>Range</label>
                                                    </div>
                                                    {date.type === 'single' ? (
                                                        <div className='pb-2'>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.value || ''}
                                                                onChange={(e) => handleY1BudgetChange(index, 'value', e.target.value, 'single')}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className='pb-2 d-flex align-items-center'>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.value || ''}
                                                                onChange={(e) => handleY1BudgetChange(index, 'value', e.target.value, 'range')}
                                                            />
                                                            <label className='mx-2'>-</label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.end || ''}
                                                                onChange={(e) => handleY1BudgetChange(index, 'end', e.target.value, 'range')}
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="btn p-0 mx-2 mb-1 text-danger" onClick={() => handleRemoveY1Budget(index)}><i className="bi bi-dash-circle"></i></span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="row pt-3">
                                        <div className="col">
                                            <label className="pb-2">Y2 Budget Realignment</label>
                                            <span className='btn p-0 px-2' onClick={handleAddY2Budget}><i className="bi bi-plus-circle text-primary"></i></span>
                                            {y2BudgetRealignment.map((date, index) => (
                                                <div key={index} className="pb-2 d-flex align-items-center">
                                                    <div className="pb-2">
                                                        <input
                                                            type="radio"
                                                            value="single"
                                                            checked={date.type === 'single'}
                                                            onChange={(e) => handleY2BudgetChange(index, 'type', e.target.value, e.target.value)}
                                                        />
                                                        <label className='me-2'>Single</label>
                                                        <input
                                                            type="radio"
                                                            value="range"
                                                            checked={date.type === 'range'}
                                                            onChange={(e) => handleY2BudgetChange(index, 'type', e.target.value, e.target.value)}
                                                        />
                                                        <label className='me-2'>Range</label>
                                                    </div>
                                                    {date.type === 'single' ? (
                                                        <div className='pb-2'>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.value || ''}
                                                                onChange={(e) => handleY2BudgetChange(index, 'value', e.target.value, 'single')}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className='pb-2 d-flex align-items-center'>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.value || ''}
                                                                onChange={(e) => handleY2BudgetChange(index, 'value', e.target.value, 'range')}
                                                            />
                                                            <label className='mx-2'>-</label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.end || ''}
                                                                onChange={(e) => handleY2BudgetChange(index, 'end', e.target.value, 'range')}
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="btn p-0 mx-2 mb-1 text-danger" onClick={() => handleRemoveY2Budget(index)}><i className="bi bi-dash-circle"></i></span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="row pt-3">
                                        <div className="col">
                                            <label className="pb-2">Y3 Budget Realignment</label>
                                            <span className='btn p-0 px-2' onClick={handleAddY3Budget}><i className="bi bi-plus-circle text-primary"></i></span>
                                            {y3BudgetRealignment.map((date, index) => (
                                                <div key={index} className="pb-2 d-flex align-items-center">
                                                    <div className="pb-2">
                                                        <input
                                                            type="radio"
                                                            value="single"
                                                            checked={date.type === 'single'}
                                                            onChange={(e) => handleY3BudgetChange(index, 'type', e.target.value, e.target.value)}
                                                        />
                                                        <label className='me-2'>Single</label>
                                                        <input
                                                            type="radio"
                                                            value="range"
                                                            checked={date.type === 'range'}
                                                            onChange={(e) => handleY3BudgetChange(index, 'type', e.target.value, e.target.value)}
                                                        />
                                                        <label className='me-2'>Range</label>
                                                    </div>
                                                    {date.type === 'single' ? (
                                                        <div className='pb-2'>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.value || ''}
                                                                onChange={(e) => handleY3BudgetChange(index, 'value', e.target.value, 'single')}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className='pb-2 d-flex align-items-center'>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.value || ''}
                                                                onChange={(e) => handleY3BudgetChange(index, 'value', e.target.value, 'range')}
                                                            />
                                                            <label className='mx-2'>-</label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.end || ''}
                                                                onChange={(e) => handleY3BudgetChange(index, 'end', e.target.value, 'range')}
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="btn p-0 mx-2 mb-1 text-danger" onClick={() => handleRemoveY3Budget(index)}><i className="bi bi-dash-circle"></i></span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className='container border p-4 mt-3 rounded'>
                                    <h5><b>Reviews</b></h5>
                                    <div className="row pt-3">
                                        <div className='col'>
                                            <label className="pb-2">Program Review</label>
                                            <span className='btn p-0 px-2' onClick={handleAddPReview}><i className="bi bi-plus-circle text-primary"></i></span>
                                            {programReview.map((date, index) => (
                                                <div key={index} className="pb-2 d-flex align-items-center">
                                                    <div className="pb-2">
                                                        <input
                                                            type="radio"
                                                            value="single"
                                                            checked={date.type === 'single'}
                                                            onChange={(e) => handleProgramReviewChange(index, 'type', e.target.value, e.target.value)}
                                                        />
                                                        <label className='me-2'>Single</label>
                                                        <input
                                                            type="radio"
                                                            value="range"
                                                            checked={date.type === 'range'}
                                                            onChange={(e) => handleProgramReviewChange(index, 'type', e.target.value, e.target.value)}
                                                        />
                                                        <label className='me-2'>Range</label>
                                                    </div>
                                                    {date.type === 'single' ? (
                                                        <div className='pb-2'>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.value || ''}
                                                                onChange={(e) => handleProgramReviewChange(index, 'value', e.target.value, 'single')}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className='pb-2 d-flex align-items-center'>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.value || ''}
                                                                onChange={(e) => handleProgramReviewChange(index, 'value', e.target.value, 'range')}
                                                            />
                                                            <label className='mx-2'>-</label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.end || ''}
                                                                onChange={(e) => handleProgramReviewChange(index, 'end', e.target.value, 'range')}
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="btn p-0 mx-2 mb-1 text-danger" onClick={() => handleRemovePReview(index)}><i className="bi bi-dash-circle"></i></span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col">
                                            <label className="pb-2">Terminal Review</label>
                                            <span className='btn p-0 px-2' onClick={handleAddTReview}><i className="bi bi-plus-circle text-primary"></i></span>
                                            {terminalReview.map((date, index) => (
                                                <div key={index} className="pb-2 d-flex align-items-center">
                                                    <div className="pb-2">
                                                        <input
                                                            type="radio"
                                                            value="single"
                                                            checked={date.type === 'single'}
                                                            onChange={(e) => handleTerminalReviewChange(index, 'type', e.target.value, e.target.value)}
                                                        />
                                                        <label className='me-2'>Single</label>
                                                        <input
                                                            type="radio"
                                                            value="range"
                                                            checked={date.type === 'range'}
                                                            onChange={(e) => handleTerminalReviewChange(index, 'type', e.target.value, e.target.value)}
                                                        />
                                                        <label className='me-2'>Range</label>
                                                    </div>
                                                    {date.type === 'single' ? (
                                                        <div className='pb-2'>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.value || ''}
                                                                onChange={(e) => handleTerminalReviewChange(index, 'value', e.target.value, 'single')}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className='pb-2 d-flex align-items-center'>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.value || ''}
                                                                onChange={(e) => handleTerminalReviewChange(index, 'value', e.target.value, 'range')}
                                                            />
                                                            <label className='mx-2'>-</label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date.end || ''}
                                                                onChange={(e) => handleTerminalReviewChange(index, 'end', e.target.value, 'range')}
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="btn p-0 mx-2 mb-1 text-danger" onClick={() => handleRemoveTReview(index)}><i className="bi bi-dash-circle"></i></span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className='row pb-2'>
                                        <div className='col'>
                                            <label className="pb-2">Submission/Acceptance of Terminal Report</label>
                                            <input type="date" className="form-control" value={submissionTerminal} onChange={(e) => setSubmissionTerminal(e.target.value)} />
                                        </div>
                                        <div className='col'></div>
                                    </div>
                                </div>
                                <div className='container border p-4 mt-3 rounded'>
                                    <h5><b>Status</b></h5>
                                    <div className="row pt-3">
                                        <div className='col'>
                                            <label className="pb-2">Status</label>
                                            <textarea type="text" className="form-control" value={status} onChange={(e) => setStatus(e.target.value)} rows="1" />
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">Remarks</label>
                                            <input
                                                className="form-control w-100 dropdown-toggle"
                                                id="dropRemarks"
                                                data-bs-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="false"
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                placeholder='Select Remarks'
                                                readOnly
                                            />
                                            <ul className="dropdown-menu p-0" aria-labelledby="dropRemarks">
                                                <li className="dropdown-item" onClick={handleRemarksChange}>New</li>
                                                <li className="dropdown-item" onClick={handleRemarksChange}>Ongoing</li>
                                                <li className="dropdown-item" onClick={handleRemarksChange}>Completed</li>
                                                <li className="dropdown-item" onClick={handleRemarksChange}>Terminated</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className='container border p-4 mt-3 rounded'>
                                    <h5><b>6Ps</b></h5>
                                    <select value={selectedYear} onChange={handleYearChange} className="form-select mb-3">
                                        <option value="">Select Year</option>
                                        {project && project.sixPs && Object.keys(project.sixPs).map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    {selectedYear && (
                                        <>
                                            {!sixPs.length ? (
                                                <div className='col'>
                                                    <button type="button" className="btn btn-dark px-3 py-2 border" onClick={generateFields} style={{ fontSize: '14px' }}>
                                                        Generate Fields
                                                    </button>
                                                </div>
                                            ) : (
                                                sixPs.map((item, index) => (
                                                    <div key={index}>
                                                        {/* Other fields */}
                                                        {item.year === selectedYear && (
                                                            <>
                                                                <h6 className='pt-3 fw-bold'>Year: {item.year}</h6>
                                                                <h6 className='pt-3 fw-semibold'>Publication</h6>
                                                                <div className="row pt-3">
                                                                    {/* <div className='col'>
                                                                        <label className="pb-2">Year {item.year}</label>
                                                                    </div> */}
                                                                    <div className='col'>
                                                                        <label className="pb-2">Target Publication</label>
                                                                        <textarea type="text" className="form-control" value={item.targetPublication} onChange={(e) => handleFieldChange(index, 'targetPublication', e.target.value)} rows="1" />
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">Actual Accomplishment (Peer-Reviewed)</label>
                                                                        <textarea type="text" className="form-control" value={item.actualaccomplishmentPeer} onChange={(e) => handleFieldChange(index, 'actualaccomplishmentPeer', e.target.value)} rows="1" />
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">Actual Accomplishment (Journal)</label>
                                                                        <textarea type="text" className="form-control" value={item.actualaccomplishmentJournal} onChange={(e) => handleFieldChange(index, 'actualaccomplishmentJournal', e.target.value)} rows="1" />
                                                                    </div>
                                                                </div>
                                                                <div className="row pt-3">
                                                                    <div className='col'>
                                                                        <label className="pb-2">Actual Accomplishment (Presented)</label>
                                                                        <textarea type="text" className="form-control" value={item.actualaccomplishmentPresented} onChange={(e) => handleFieldChange(index, 'actualaccomplishmentPresented', e.target.value)} rows="1" />
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">Details</label>
                                                                        <textarea type="text" className="form-control" value={item.details} onChange={(e) => handleFieldChange(index, 'details', e.target.value)} rows="1" />
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">Actual Accomplishment (IEC)</label>
                                                                        <textarea type="text" className="form-control" value={item.actualaccomplishmentIEC} onChange={(e) => handleFieldChange(index, 'actualaccomplishmentIEC', e.target.value)} rows="1" />
                                                                    </div>
                                                                </div>
                                                                <h6 className='pt-3 fw-semibold'>Product</h6>
                                                                <div className="row pt-3">
                                                                    <div className='col'>
                                                                        <label className="pb-2">Target Product</label>
                                                                        <textarea type="text" className="form-control" value={item.targetProduct} onChange={(e) => handleFieldChange(index, 'targetProduct', e.target.value)} rows="1" />
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">Name of Technology</label>
                                                                        <textarea type="text" className="form-control" value={item.techName} onChange={(e) => handleFieldChange(index, 'techName', e.target.value)} rows="1" />
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">Description of the Technology</label>
                                                                        <textarea type="text" className="form-control" value={item.techDescription} onChange={(e) => handleFieldChange(index, 'techDescription', e.target.value)} rows="1" />
                                                                    </div>
                                                                </div>
                                                                <h6 className='pt-3 fw-semibold'>Patent</h6>
                                                                <div className="row pt-3">
                                                                    <div className='col'>
                                                                        <label className="pb-2">Target Patent</label>
                                                                        <textarea type="text" className="form-control" value={item.targetPatent} onChange={(e) => handleFieldChange(index, 'targetPatent', e.target.value)} rows="1" />
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">Agency</label>
                                                                        <textarea type="text" className="form-control" value={item.agency} onChange={(e) => handleFieldChange(index, 'agency', e.target.value)} rows="1" />
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">Name of Technology/Protocols/Manual with IP/Patent</label>
                                                                        <textarea type="text" className="form-control" value={item.techNamePro} onChange={(e) => handleFieldChange(index, 'techNamePro', e.target.value)} rows="1" />
                                                                    </div>
                                                                </div>
                                                                <div className="row pt-3">
                                                                    <div className='col'>
                                                                        <label className="pb-2">Status</label>
                                                                        <textarea type="text" className="form-control" value={item.statusSix} onChange={(e) => handleFieldChange(index, 'statusSix', e.target.value)} rows="1" />
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">DOST</label>
                                                                        <select
                                                                            className="form-select"
                                                                            value={item.dost}
                                                                            onChange={(e) => handleFieldChange(index, 'dost', e.target.value)}
                                                                        >
                                                                            <option value="Yes">Yes</option>
                                                                            <option value="No">No</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">Patent Number or Application Number</label>
                                                                        <textarea type="text" className="form-control" value={item.patentNumber} onChange={(e) => handleFieldChange(index, 'patentNumber', e.target.value)} rows="1" />
                                                                    </div>
                                                                </div>
                                                                <h6 className='pt-3 fw-semibold'>People and Services</h6>
                                                                <div className="row pt-3">
                                                                    <div className='col'>
                                                                        <label className="pb-2">Target People and Services</label>
                                                                        <textarea type="text" className="form-control" value={item.targetPeople} onChange={(e) => handleFieldChange(index, 'targetPeople', e.target.value)} rows="1" />
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">Names BS</label>
                                                                        <input type="text" className="form-control" value={item.namesBS} onChange={(e) => handleFieldChange(index, 'namesBS', e.target.value)} />
                                                                    </div>
                                                                </div>
                                                                <div className="row pt-3">
                                                                    <div className='col'>
                                                                        <label className="pb-2">Names MS</label>
                                                                        <input type="text" className="form-control" value={item.namesMS} onChange={(e) => handleFieldChange(index, 'namesMS', e.target.value)} />
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">Names PhD</label>
                                                                        <input type="text" className="form-control" value={item.namesPhD} onChange={(e) => handleFieldChange(index, 'namesPhD', e.target.value)} />
                                                                    </div>
                                                                </div>
                                                                <h6 className='pt-3 fw-semibold'>Places and Partnership</h6>
                                                                <div className="row pt-3">
                                                                    <div className='col'>
                                                                        <label className="pb-2">Target Places and Partnership</label>
                                                                        <textarea type="text" className="form-control" value={item.targetPlaces} onChange={(e) => handleFieldChange(index, 'targetPlaces', e.target.value)} rows="1" />
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">Cooperators</label>
                                                                        <input type="text" className="form-control" value={item.cooperators} onChange={(e) => handleFieldChange(index, 'cooperators', e.target.value)} />
                                                                    </div>
                                                                </div>
                                                                <div className="row pt-3">
                                                                    <div className='col'>
                                                                        <label className="pb-2">International</label>
                                                                        <input type="text" className="form-control" value={item.international} onChange={(e) => handleFieldChange(index, 'international', e.target.value)} />
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">Private</label>
                                                                        <input type="text" className="form-control" value={item.privateSixPS} onChange={(e) => handleFieldChange(index, 'privateSixPS', e.target.value)} />
                                                                    </div>
                                                                </div>
                                                                <h6 className='pt-3 fw-semibold'>Policy</h6>
                                                                <div className="row pt-3">
                                                                    <div className='col'>
                                                                        <label className="pb-2">Target Policy</label>
                                                                        <input type="text" className="form-control" value={item.targetPolicy} onChange={(e) => handleFieldChange(index, 'targetPolicy', e.target.value)} />
                                                                    </div>
                                                                    <div className='col'>
                                                                        <label className="pb-2">Policy Recommendations</label>
                                                                        <input type="text" className="form-control" value={item.policyRecommendation} onChange={(e) => handleFieldChange(index, 'policyRecommendation', e.target.value)} />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </>
                                    )}
                                </div>



                                {/* <div className='container border p-4 mt-3 rounded'>
                                    <h5><b>Files</b></h5>
                                    <div className="row pt-3">
                                        <div className='col'>
                                            <label className="pb-2">For Budget Realignment</label>
                                            <input type="file" className="form-control" onChange={(e) => handleBudgetRealignmentFileChange(e.target.files[0])} />
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">For Change Implementation Date</label>
                                            <input type="file" className="form-control" onChange={(e) => handleChangeImplementationFileChange(e.target.files[0])} />
                                        </div>
                                        <div className='col'>
                                            <label className="pb-2">For Extension</label>
                                            <input type="file" className="form-control" onChange={(e) => handleExtensionFileChange(e.target.files[0])} />
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                            <div className="modal-footer border-0">
                                <button type="button" className="btn btn-outline px-3 py-2 border text-black" style={{ fontSize: '14px' }} onClick={closeModal}>Cancel</button>
                                <button className="btn btn-dark px-3 py-2 border" style={{ fontSize: '14px' }}>Update</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditProjectModal;
