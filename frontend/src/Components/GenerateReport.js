import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from "react-router-dom";
import DataTable from 'react-data-table-component';
import './GenerateReport.css'
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { Tooltip } from 'react-tooltip';
import * as XLSX from 'xlsx';

export const GenerateReport = ({ sidebarExpanded }) => {
    const [originalInfo, setOriginalInfo] = useState([]);
    const [info, setInfo] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const location = useLocation();
    const state = location.state;
    const [filterValue, setFilterValue] = useState('');
    const [selectedRemarks, setSelectedRemarks] = useState([]);
    const [selectedFunding, setSelectedFunding] = useState([]); 

    useEffect(() => {
        // getInfo();
    }, []);

    // const getInfo = async () => {
    //     try {
    //         const response = await axios.get('http://localhost:8080/Projects/');
    //         setOriginalInfo(response.data);
    //         setInfo(response.data);
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //     }
    // };

    const handleFundingToggle = (funding) => {
        if (selectedFunding.includes(funding)) {
            setSelectedFunding(selectedFunding.filter(f => f !== funding));
        } else {
            setSelectedFunding([...selectedFunding, funding]);
        }
    };    

    const handleRemarkToggle = (remark) => {
        if (selectedRemarks.includes(remark)) {
            setSelectedRemarks(selectedRemarks.filter(r => r !== remark));
        } else {
            setSelectedRemarks([...selectedRemarks, remark]);
        }
    };    

    const handleColumnToggle = (title) => {
        if (selectedColumns.includes(title)) {
            setSelectedColumns(selectedColumns.filter(col => col !== title));
        } else {
            setSelectedColumns([...selectedColumns, title]);
        }
    };

    const formatColumnName = (columnName) => {
        let formattedName = columnName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        if (formattedName === "Mande") {
            formattedName = "M&E";
        } else if (formattedName === "Created_at") {
            formattedName = "Created At";
        } else if (formattedName === "Created_by") {
            formattedName = "Created By";
        }
        
        // Remove "Release Data" part if it exists
        formattedName = formattedName.replace('Release Data', '').trim();
    
        // Split column name by "." to handle nested properties
        const parts = formattedName.split('.');
        formattedName = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' '); // Capitalize each part
        
        return formattedName;
    };
    

    const getColumnTitles = () => {
        if (!state || !state.length) return [];
    
        const getAllKeys = (obj) => {
            let keys = [];
            for (const key in obj) {
                if (typeof obj[key] === 'object') {
                    keys.push(...getAllKeys(obj[key]).map(subKey => `${key}.${subKey}`));
                } else if (
                    key !== 'id' &&
                    key !== 'project_id' &&
                    key !== 'updated_at' &&
                    key !== 'deleted_at' &&
                    key !== 'created_at' 
                ) {
                    keys.push(key);
                }
            }
            return keys;
        };
    
        const columnTitles = Object.keys(state[0]).
            filter(
                title => title !== 'id' &&
                    title !== 'sixPSData' &&
                    title !== 'counterFund' &&
                    title !== 'updated_at' &&
                    title !== 'deleted_at' &&
                    title !== 'counterpartFundData' &&
                    title !== 'totalBudget' &&
                    title !== 'budget' &&
                    title !== 'releaseData' &&
                    title !== 'sixPs' &&
                    title !== 'fileData'
            );
    
        // Add releaseData properties to columnTitles if they exist in the state
        if (state[0].releaseData) {
            columnTitles.push('releaseData');
            Object.keys(state[0].releaseData).forEach(key => {
                // Exclude the 'id' property within the releaseData object
                if (key !== 'id' && key !== 'project_id' && key !== 'created_at' && key !== 'updated_at' && key !== 'deleted_at') {
                    columnTitles.push(`releaseData.${key}`);
                }
            });
        }

        const index = columnTitles.indexOf('releaseData');
        if (index !== -1) {
            columnTitles.splice(index, 1);
        }
    
        return columnTitles;
    };    

    const generateColumns = () => {
        const releaseDataColumns = ['actualRelease', 'dateOfRelease']; // Add any other releaseData properties here if needed
    
        return selectedColumns.map(column => ({
            name: formatColumnName(column),
            selector: row => {
                // Check if the column is a releaseData property
                if (releaseDataColumns.includes(column) && row.releaseData) {
                    return row.releaseData[column];
                } else {
                    return row[column];
                }
            },
            sortable: true,
            wrap: true,
            width: 'auto', // Adjust width as needed
        }));
    };

    // const filterDataBySelectedColumns = () => {
    //     if (!state || !state.length) return [];
        
    //     // Filter data by year
    //     const filteredData = filterDataByYear();
    
    //     return filteredData.map(item => {
    //         const filteredItem = {};
    
    //         // Check if releaseData is selected
    //         if (selectedColumns.includes('releaseData')) {
    //             filteredItem.releaseData = item.releaseData;
    //         }
    
    //         // Iterate over selected columns and add data to filteredItem
    //         selectedColumns.forEach(column => {
    //             if (column !== 'releaseData') {
    //                 filteredItem[column] = getColumnValue(item, column);
    //             }
    //         });
    
    //         return filteredItem;
    //     });
    // };
    
    const filterDataBySelectedColumns = () => {
        if (!state || !state.length) return [];
    
        // Filter data by year
        const filteredData = filterDataByYear();
    
        return filteredData.map(item => {
            // Filter by selected remarks
            if (selectedRemarks.length > 0 && !selectedRemarks.includes(item.remarks)) {
                return false;
            }
    
            // Filter by selected funding
            if (selectedFunding.length > 0 && !selectedFunding.includes(item.funding)) {
                return false;
            }
    
            const filteredItem = {};
    
            // Check if releaseData is selected
            if (selectedColumns.includes('releaseData')) {
                filteredItem.releaseData = item.releaseData;
            }
    
            // Iterate over selected columns and add data to filteredItem
            selectedColumns.forEach(column => {
                if (column !== 'releaseData') {
                    filteredItem[column] = getColumnValue(item, column);
                }
            });
    
            return filteredItem;
        }).filter(Boolean); // Remove falsy values (i.e., items that were filtered out)
    };
         
    
    // Helper function to get value of nested properties
    const getColumnValue = (item, column) => {
        const keys = column.split('.');
        let value = item;
        for (const key of keys) {
            if (value[key]) {
                value = value[key];
            } else {
                return ''; // Return empty string if property doesn't exist
            }
        }
        return value;
    };
    
    const exportToExcel = () => {
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        const fileName = 'Generated_Report'; // Update with your desired file name
        
        let exportData = filterDataBySelectedColumns();
    
        // Create an array of arrays representing rows and columns
        const rows = exportData.map(row => {
            return selectedColumns.map(column => {
                return row[column];
            });
        });
    
        // Add headers as the first row
        rows.unshift(selectedColumns.map(column => formatColumnName(column)));
    
        // Create a new workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(rows);
    
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Data Export');
    
        // Save the workbook
        XLSX.writeFile(wb, fileName + fileExtension);
    };

    const downloadWordFile = async () => {
        const currentDate = new Date().toISOString().split('T')[0];
        const filteredData = filterDataBySelectedColumns();

        const paragraphs = filteredData.map((row, index) => {
            const textRuns = [];
            Object.keys(row).forEach(key => {
                textRuns.push(new TextRun({
                    text: `${formatColumnName(key)}: ${row[key]} `,
                    break: 1.5,
                    font: { name: 'Arial' },
                }));
            });
            return new Paragraph({ children: textRuns });
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
                                    font: { name: 'Arial' },
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
    
    const filterDataByYear = () => {
        if (!selectedYear) return state;
        return state.filter(item => {
            const start = item.changeStart || item.originalStart; // Use changeStart if available
            return new Date(start).getFullYear() === parseInt(selectedYear);
        });
    };

    const handleYearToggle = (year) => {
        if (selectedYear === year) {
            setSelectedYear('');
        } else {
            setSelectedYear(year);
        }
    };

    const uniqueYears = state.reduce((acc, item) => {
        const year = new Date(item.changeStart || item.originalStart).getFullYear(); // Use changeStart if available
        if (year && !acc.includes(year)) {
            acc.push(year);
        }
        return acc;
    }, []);
    

    return (
        <div className='row'>
            <div className="col-lg-10">
                <div className="d-flex justify-content-between pt-5 align-items-center">
                    <label className='h5 fw-semibold pt-2'>Generate Report</label>
                    <div className="d-flex align-items-center">
                        <div className='sample me-3 excelgenerateTooltip' style={{ borderRadius: '50px', padding: '7px 3px 2px 3px' }}>
                            <Tooltip anchorSelect=".excelgenerateTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                                Export to Excel
                            </Tooltip>
                            <button type="button" className="btn border-0" data-bs-toggle="tooltip" onClick={exportToExcel}>
                                <i className="fa-solid fa-file-excel fs-5"></i>
                            </button>
                        </div>
                        <div className='sample me-3 generateTooltip' style={{ borderRadius: '50px', padding: '7px 3px 2px 3px' }}>
                            <Tooltip anchorSelect=".generateTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                                Export to Word File
                            </Tooltip>
                            <button type="button" className="btn border-0" data-bs-toggle="tooltip" onClick={downloadWordFile}>
                                <i className="fa-solid fa-file-word fs-5"></i>
                            </button>
                        </div>
                    </div>
                </div>
                {selectedColumns.length > 0 && ( 
                    <>
                        <DataTable
                            columns={generateColumns()}
                            data={filterDataBySelectedColumns()}
                            pagination
                            responsive
                            highlightOnHover
                            striped
                            className='pt-5'
                            style={{ paddingLeft: sidebarExpanded ? '300px' : '150px', transition: 'padding-left 0.3s', width: '10px' }}
                        />
                        
                    </>
                )}
            </div>
            <div className='col-lg-2' style={{ minHeight: '90vh', backgroundColor: '#EEEEEE', position: 'sticky', top: 0 }}>
                <div className="py-2">
                    <h6>Filter Table By:</h6>
                    <textarea
                        className="form-control dropdown-toggle"
                        id="dropFIlter"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                        style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
                        value={selectedColumns.length > 0 ? selectedColumns.map(formatColumnName).join(', ') : ''}
                        onChange={(e) => setSelectedColumns(e.target.value.split(', '))}
                        placeholder='Select Columns'
                        autoComplete='off'
                    />
                    <ul className={`dropdown-menu dropdown-submenu p-2 ${getColumnTitles().length > 10 ? 'scrollable-dropdown' : ''}`} style={{ marginTop: '-20px' }}>
                        {getColumnTitles().map((title, index) => (
                            <div key={index} className="form-check">
                                <input 
                                    type='checkbox' 
                                    className='form-check-input' 
                                    id={`titleCheckbox-${title}`} 
                                    onChange={() => handleColumnToggle(title)}
                                    checked={selectedColumns.includes(title)}
                                />
                                <label 
                                    className="form-check-label" 
                                    htmlFor={`titleCheckbox-${title}`} 
                                    style={{ fontSize: '14px' }}
                                >
                                    {formatColumnName(title)} {/* Display the formatted column name */}
                                </label>
                            </div>
                        ))}
                    </ul>
                </div>
                <div className="py-2">
                    <h6>Filter Year:</h6>
                    <ul className="list-unstyled">
                        {uniqueYears
                            .sort((a, b) => a - b) // Sort the years from least to greatest
                            .map((year, index) => (
                                <div key={index} className="form-check">
                                    <input
                                        type='checkbox'
                                        className='form-check-input'
                                        id={`yearCheckbox-${year}`}
                                        onChange={() => handleYearToggle(year)}
                                        checked={selectedYear === year}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor={`yearCheckbox-${year}`}
                                        style={{ fontSize: '14px' }}
                                    >
                                        {year}
                                    </label>
                                </div>
                            ))}
                    </ul>
                </div>
                <div className="py-2">
                    <h6>Filter Remarks:</h6>
                    <ul className="list-unstyled">
                        {['New', 'Ongoing', 'Completed', 'Terminated'].map((remark, index) => (
                            <div key={index} className="form-check">
                                <input
                                    type='checkbox'
                                    className='form-check-input'
                                    id={`remarkCheckbox-${remark}`}
                                    onChange={() => handleRemarkToggle(remark)}
                                    checked={selectedRemarks.includes(remark)}
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor={`remarkCheckbox-${remark}`}
                                    style={{ fontSize: '14px' }}
                                >
                                    {remark}
                                </label>
                            </div>
                        ))}
                    </ul>
                </div>
                <div className="py-2">
                    <h6>Filter Funding:</h6>
                    <ul className="list-unstyled">
                        {['PCAARRD GIA', 'DOST GIA'].map((funding, index) => (
                            <div key={index} className="form-check">
                                <input
                                    type='checkbox'
                                    className='form-check-input'
                                    id={`fundingCheckbox-${funding}`}
                                    onChange={() => handleFundingToggle(funding)}
                                    checked={selectedFunding.includes(funding)}
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor={`fundingCheckbox-${funding}`}
                                    style={{ fontSize: '14px' }}
                                >
                                    {funding}
                                </label>
                            </div>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
    
}
