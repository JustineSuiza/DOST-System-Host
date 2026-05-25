import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import './Dashboard.css';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from "chart.js";
import { Tooltip as ReactTooltip, Tooltip } from 'react-tooltip';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';

const regionCoordinates = {
  "Region I (Ilocos Region)": [120.6200, 16.0832],
  "Region II (Cagayan Valley)": [121.8107, 16.9754],
  "Region III (Central Luzon)": [120.7120, 15.4828],
  "Region IV-A (CALABARZON)": [121.0794, 14.1008],
  "Region IV-B (MIMAROPA)": [118.7365, 9.8432],
  "Region V (Bicol Region)": [123.4137, 13.4210],
  "Region VI (Western Visayas)": [122.5373, 11.0050],
  "Region VII (Central Visayas)": [124.0641, 9.8169],
  "Region VIII (Eastern Visayas)": [125.0388, 12.2446],
  "Region IX (Zamboanga Peninzula)": [123.2588, 8.1541],
  "Region X (Northern Mindanao)": [124.6857, 8.0202],
  "Region XI (Davao Region)": [126.0893, 7.3042],
  "Region XII (SOCCSKSARGEN)": [124.6857, 6.2707],
  "National Capital Region (NCR)": [121.0223, 14.6091],
  "Cordillera Administrative Region (CAR)": [121.1719, 17.3513],
  "Autonomous Region in Muslim Mindanao (ARMM)": [124.2422, 6.9568],
  "Region XIII (Caraga)": [125.7407, 8.8015],
};

ChartJS.register(...registerables);

const Dashboard = () => {
  const [info, setInfo] = useState([]);
  const [proposals, setProposals] = useState([]);
  const mapContainerRef = useRef(null);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedYearsProposal, setSelectedYearsProposal] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [ispOptions, setIspOptions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    getInfo();
    getProposal();
  }, []);

  useEffect(() => {
    let animationTimeout;
    const animateChart = () => {
      // Animate the chart after a delay
      animationTimeout = setTimeout(() => {
        // Render the chart animation
        // Then initialize the map
        initializeMap();
      }, 500); // Adjust the delay as needed
    };

    animateChart();

    return () => clearTimeout(animationTimeout);
  }, [info]);

  const initializeMap = () => {
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [122.4376, 12.3674],
      zoom: 5,
    });

    const filteredProjects = info.filter(project => project.remarks !== "Terminated");

    const regionToDisplay = filteredProjects
      .map(project => project.releaseData?.regionIA)
      .filter(region => region);

    const projectsCount = {};
    regionToDisplay.forEach(region => {
      projectsCount[region] = (projectsCount[region] || 0) + 1;
    });

    Object.keys(regionCoordinates).forEach(region => {
      if (regionToDisplay.includes(region)) {
        const coordinates = regionCoordinates[region];

        const popupContent = document.createElement('div');
        popupContent.className = 'custom-popup';
        popupContent.innerHTML = `<label>${region}</label><p>Number of projects: ${projectsCount[region]}</p>`;

        // Add click event listener to popup content
        popupContent.addEventListener('click', () => {
          // Do something when popup content is clicked, e.g., open a link or show more information
          console.log('Popup content clicked:', region);
          navigate("/DOST/Projects", { state: region });
        });

        const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: true, closeButton: false })
          .setDOMContent(popupContent);

        new mapboxgl.Marker({ color: 'red' })
          .setLngLat(coordinates)
          .addTo(map)
          .setPopup(popup)
          .togglePopup();
      }
    });

    return () => map.remove();
  };


  const getInfo = async () => {
    try {
      const res = await axios.get('http://localhost:8080/Projects');
      setInfo(res.data || []);
    } catch (err) {
      console.error('Failed to fetch Projects:', err);
      setInfo([]);
    }
  };

  const getProposal = async () => {
    try {
      const res = await axios.get('http://localhost:8080/Proposals');
      setProposals(res.data || []);
    } catch (err) {
      console.error('Failed to fetch Proposals:', err);
      setProposals([]);
    }
  };

  const refreshData = () => {
    getInfo();
  };

  const clearFilter = () => {
    setSelectedYears([]);
    getInfo();
  };

  const clearFilterProposal = () => {
    setSelectedYearsProposal([]);
    getProposal();
  };

  const validYears = info
    .map(project => new Date(project.changeStart || project.originalStart).getFullYear())
    .filter((year, index, self) => !isNaN(year) && self.indexOf(year) === index)
    .sort((a, b) => a - b);


  const validYearsProposal = proposals
    .map(proposal => new Date(proposal.date).getFullYear())
    .filter((year, index, self) => !isNaN(year) && self.indexOf(year) === index)
    .sort((a, b) => a - b);

  const applyYearFilter = () => {
    if (selectedYears.length > 0) {
      const filteredInfo = info.filter(project => {
        const startYear = new Date(project.changeStart || project.originalStart).getFullYear();
        return selectedYears.includes(startYear);
      });
      setInfo(filteredInfo);
    } else {
      // If no years are selected, reset the data to its original state
      getInfo();
    }
  };


  const applyYearFilterProposal = () => {
    if (selectedYearsProposal.length > 0) {
      const filteredInfo = proposals.filter(proposal =>
        selectedYearsProposal.includes(new Date(proposal.date).getFullYear())
      );
      setProposals(filteredInfo);
    } else {
      // If no years are selected, reset the data to its original state
      getProposal();
    }
  };

  const handleYearChange = (e, year) => {
    if (e.target.checked) {
      setSelectedYears(prevSelectedYears => [...prevSelectedYears, year]);
    } else {
      setSelectedYears(prevSelectedYears => prevSelectedYears.filter(y => y !== year));
    }
    // Note: Don't call refreshData here, as it will trigger a refresh every time a checkbox is clicked
  };

  const handleYearChangeProposal = (e, year) => {
    if (e.target.checked) {
      setSelectedYearsProposal(prevSelectedYears => [...prevSelectedYears, year]);
    } else {
      setSelectedYearsProposal(prevSelectedYears => prevSelectedYears.filter(y => y !== year));
    }
    // Note: Don't call refreshData here, as it will trigger a refresh every time a checkbox is clicked
  };

  let ongoingProjects = [];
  let newProjects = [];
  let completedProjects = [];
  let terminatedProjects = [];
  let totalProjects = [];

  if (info.length > 0) {
    totalProjects = info.length;
    ongoingProjects = info.filter((project) => project.remarks === 'Ongoing');
    newProjects = info.filter((project) => project.remarks === 'New');
    completedProjects = info.filter((project) => project.remarks === 'Completed');
    terminatedProjects = info.filter((project) => project.remarks === 'Terminated');
  }

  let totalProposals = 0;
  let approvedProposals = [];
  let disapprovedProposals = [];
  let resubmissionProposals = [];
  let underEvaluationProposals = [];
  let revisionProposals = [];

  if (proposals && proposals.length > 0) {
    totalProposals = proposals.length;
    approvedProposals = proposals.filter((project) => project.remarks === 'Approved');
    disapprovedProposals = proposals.filter((project) => project.remarks === 'Disapproved');
    resubmissionProposals = proposals.filter((project) => project.remarks === 'Resubmission');
    underEvaluationProposals = proposals.filter((project) => project.remarks === 'Under Evaluation');
    revisionProposals = proposals.filter((project) => project.remarks === 'Revision');
  }

  const truncateLabel = (label, maxLength) => {
    if (label.length > maxLength) {
      return label.substring(0, maxLength) + '...';
    }
    return label;
  };

  const pieChartDataProposals = {
    labels: ['Approved', 'Disapproved', 'Resubmission', 'Under Evaluation', 'Revision'],
    datasets: [{
      data: [
        approvedProposals.length,
        disapprovedProposals.length,
        resubmissionProposals.length,
        underEvaluationProposals.length,
        revisionProposals.length
      ],
      backgroundColor: ['#7CC674', '#C9190B', '#EF9234', '#519DE9', '#8481DD'],
      hoverBackgroundColor: ['#4CB140', '#A30000', '#EC7A08', '#06C', '#5752D1']
    }]
  };

  const pieChartData = {
    labels: ['Ongoing', 'New', 'Completed'],
    datasets: [{
      data: [ongoingProjects.length, newProjects.length, completedProjects.length],
      backgroundColor: ['#519DE9', '#F6D173', '#7CC674'],
      hoverBackgroundColor: ['#06C', '#F4C145', '#4CB140']
    }]
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.parsed;
            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            label += `${value} (${percentage}%)`;
            return label;
          }
        }
      },
      legend: {
        display: true,
        position: 'bottom',
        align: 'start',
        fullSize: 'true',
      },
    }
  };

  const option = {
    plugins: {
      legend: {
        display: true // Hide the legend
      },
      scales: {
        x: {
          stacked: true // Stack bars on the x-axis
        },
        y: {
          stacked: true // Stack bars on the y-axis
        }
      },
    }
  };

  const getISPData = () => {
    const ispData = {};
    info.forEach((project) => {
        const isp = project.ISP;
        if (isp && !isp.includes('Inland Biodiversity')) {
            ispData[isp] = ispData[isp] ? ispData[isp] + 1 : 1;
        }
    });
    return ispData;
  };

  const getInlandBiodiversityData = () => {
    const inlandData = { new: 0, ongoing: 0, completed: 0 };
    info.forEach((project) => {
      const isp = project.ISP;
      // Check if the project matches any selected filters
      if (isp && isp.includes('Inland Biodiversity') && (selectedFilters.length === 0 || selectedFilters.some(filter => isp.includes(filter)))) {
        if (project.remarks === 'New') {
          inlandData.new += 1;
        } else if (project.remarks === 'Ongoing') {
          inlandData.ongoing += 1;
        } else if (project.remarks === 'Completed') {
          inlandData.completed += 1;
        }
      }
    });
    return inlandData;
  };

  const getISPPerData = () => {
    const ispData = {};
    info.forEach((project) => {
        const isp = project.ISP;
        // Exclude Inland Biodiversity from ISP per data
        if (isp && !isp.includes('Inland Biodiversity')) {
            if (!ispData[isp]) {
                ispData[isp] = { new: 0, ongoing: 0, completed: 0 };
            }
            if (project.remarks === 'New') {
                ispData[isp].new += 1;
            } else if (project.remarks === 'Ongoing') {
                ispData[isp].ongoing += 1;
            } else if (project.remarks === 'Completed') {
                ispData[isp].completed += 1;
            }
        }
    });
    return ispData;
  };

  const ispData = getISPData();
  const ispPerData = getISPPerData();
  const inlandBiodiversityData = getInlandBiodiversityData();

  const ispChartData = {
      labels: Object.keys(ispData),
      datasets: [{
          data: Object.values(ispData),
          backgroundColor: ['#519DE9', '#7CC674', '#73C5C5', '#8481DD', '#F6D173', '#C9190B'],
          hoverBackgroundColor: ['#06C', '#4CB140', '#009596', '#5752D1', '#F4C145', '#A30000']
      }]
  };

  
  
  // Extract unique ISP options that include 'Inland Biodiversity'
  const extractIspOptions = () => {
    const uniqueISPs = new Set();
    info.forEach((project) => {
      const isp = project.ISP;
      if (isp && isp.includes('Inland Biodiversity')) {
        uniqueISPs.add(isp);
      }
    });
    return [...uniqueISPs];
  };
  
  // Handle checkbox change for filters
  const handleFilterChange = (event, filter) => {
    if (event.target.checked) {
      setSelectedFilters([...selectedFilters, filter]);
    } else {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    }
  };
  
  // useEffect to update ispOptions whenever info changes
  useEffect(() => {
    setIspOptions(extractIspOptions());
  }, [info]);
  
  const generateChartData = (data) => {
    return {
      labels: ['New', 'Ongoing', 'Completed'],
      datasets: [{
        data: [data.new, data.ongoing, data.completed],
        backgroundColor: ['#F6D173', '#7CC674', '#519DE9'],
        hoverBackgroundColor: ['#F4C145', '#4CB140', '#06C']
      }]
    };
  };
  
  const generateInlandChartData = () => {
    return generateChartData(getInlandBiodiversityData());
  };


  const calculateTotalBudgetByISP = () => {
    const totalBudgetByISP = {};
    info.forEach((project) => {
      const isp = project.ISP;
      const budgetString = project.totalBudget;
      if (budgetString !== null) {
        const budget = parseFloat(budgetString.replace(/,/g, '') || 0);
        if (!totalBudgetByISP[isp]) {
          totalBudgetByISP[isp] = budget;
        } else {
          totalBudgetByISP[isp] += budget;
        }
      }
    });
    return totalBudgetByISP;
  };

  const totalBudgetByISP = calculateTotalBudgetByISP();
  const truncatedBLabels = Object.keys(totalBudgetByISP).map(label => truncateLabel(label)); // Adjust 15 according to your desired length

  const lineChartData = {
    labels: truncatedBLabels,
    datasets: [
      {
        label: 'Total Budget by ISP',
        data: Object.values(totalBudgetByISP),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };


  const calculateBudgetOverallTotal = () => {
    let overallTotal = 0;

    info.forEach(project => {
      if (project.totalBudget) {
        overallTotal += parseFloat(project.totalBudget.replace(/,/g, ''));
      }
    });

    return overallTotal;
  };

  const calculateNewBudgetOverallTotal = () => {
    let overallTotal = 0;

    const newProjects = info.filter((project) => project.remarks === 'New');
    newProjects.forEach(project => {
      if (project.totalBudget) {
        overallTotal += parseFloat(project.totalBudget.replace(/,/g, ''));
      }
    });

    return overallTotal;
  };

  const calculateOngoingBudgetOverallTotal = () => {
    let overallTotal = 0;

    const newProjects = info.filter((project) => project.remarks === 'Ongoing');
    newProjects.forEach(project => {
      if (project.totalBudget) {
        overallTotal += parseFloat(project.totalBudget.replace(/,/g, ''));
      }
    });

    return overallTotal;
  };

  const calculateProgrammedOverallTotal = () => {
    let overallTotal = 0;

    info.forEach(project => {
      const programmed = project.releaseData?.programmedAmount;
      if (programmed) {
        overallTotal += parseFloat(programmed.replace(/,/g, ''));
      }
    });

    return overallTotal;
  };

  const calculateActualOverallTotal = () => {
    let overallTotal = 0;

    info.forEach(project => {
      const actual = project.releaseData?.actualRelease;
      if (actual) {
        overallTotal += parseFloat(actual.replace(/,/g, ''));
      }
    });

    return overallTotal;
  };

  const sumOfReleasesData1 = {
    labels: ['New', 'Ongoing', 'Total Budget'],
    datasets: [
      {
        label: 'Total Budget',
        borderColor: '#FFF',
        borderWidth: 1,
        hoverBorderColor: '#FFF',
        data: [
          calculateNewBudgetOverallTotal(),
          calculateOngoingBudgetOverallTotal(),
          calculateBudgetOverallTotal()
        ]
      }
    ]
  };

  const sumOfReleasesData2 = {
    labels: ['Programmed Budget', 'Actual Releases'],
    datasets: [
      {
        label: 'Total Budget',
        borderColor: '#FFF',
        borderWidth: 1,
        hoverBorderColor: '#FFF',
        data: [
          calculateProgrammedOverallTotal(),
          calculateActualOverallTotal()
        ]
      }
    ]
  };

  const getProjectsByStatusAndAgency = () => {
    const projectsByStatusAndAgency = {};

    info.forEach((project) => {
      const status = project.remarks;
      const agency = project.implementingAgency;

      if (status !== 'Terminated' && agency) { // Exclude terminated projects and projects without an agency
        if (!projectsByStatusAndAgency[agency]) {
          projectsByStatusAndAgency[agency] = { New: 0, Ongoing: 0, Completed: 0 };
        }

        projectsByStatusAndAgency[agency][status]++;
      }
    });

    return projectsByStatusAndAgency;
  };

  const getProjectsByRegionAndStatus = () => {
    const projectsByRegionAndStatus = {};

    info.forEach((project) => {
      const status = project.remarks;
      const region = project.releaseData?.regionIA;

      if (status !== 'Terminated' && region) { // Exclude terminated projects and projects without a region
        if (!projectsByRegionAndStatus[region]) {
          projectsByRegionAndStatus[region] = { New: 0, Ongoing: 0, Completed: 0 };
        }

        projectsByRegionAndStatus[region][status]++;
      }
    });

    return projectsByRegionAndStatus;
  };

  const getTotalBudgetByRegionAndStatus = () => {
    const budgetByRegionAndStatus = {};

    info.forEach((project) => {
      const status = project.remarks;
      const region = project.releaseData?.regionIA;
      const budget = project.totalBudget ? parseFloat(project.totalBudget.replace(/,/g, '')) : 0;

      if (status !== 'Terminated' && region) { // Exclude terminated projects and projects without a region
        if (!budgetByRegionAndStatus[region]) {
          budgetByRegionAndStatus[region] = { New: 0, Ongoing: 0, Completed: 0 };
        }

        budgetByRegionAndStatus[region][status] += budget;
      }
    });

    return budgetByRegionAndStatus;
  };


  const projectsByStatusAndAgency = getProjectsByStatusAndAgency();

  const agencyLabels = Object.keys(projectsByStatusAndAgency);
  const newCounts = agencyLabels.map((agency) => projectsByStatusAndAgency[agency].New);
  const ongoingCounts = agencyLabels.map((agency) => projectsByStatusAndAgency[agency].Ongoing);
  const completedCounts = agencyLabels.map((agency) => projectsByStatusAndAgency[agency].Completed);

  // Use truncateLabel function to truncate long labels
  const truncatedLabels = agencyLabels.map(label => truncateLabel(label));

  const barChartData = {
    labels: truncatedLabels,
    datasets: [
      {
        label: 'New',
        data: newCounts,
      },
      {
        label: 'Ongoing',
        data: ongoingCounts,
      },
      {
        label: 'Completed',
        data: completedCounts,
      },
    ],
  };



  const projectsByRegionAndStatus = getProjectsByRegionAndStatus();

  const regionLabels = Object.keys(projectsByRegionAndStatus);
  const statusLabels = ['New', 'Ongoing', 'Completed'];

  const truncatedRLabels = regionLabels.map(label => truncateLabel(label, 10));

  const regionData = {
    labels: truncatedRLabels,
    datasets: statusLabels.map((status) => ({
      label: status,
      data: regionLabels.map((region) => projectsByRegionAndStatus[region][status] || 0),
    })),
  };


  const budgetByRegionAndStatus = getTotalBudgetByRegionAndStatus();

  const regionLabelss = Object.keys(budgetByRegionAndStatus);
  const statusLabelss = ['New', 'Ongoing', 'Completed'];

  const truncatedRSLabels = regionLabelss.map(label => truncateLabel(label, 10));

  const regionDataWithBudget = {
    labels: truncatedRSLabels,
    datasets: statusLabelss.map((status) => ({
      label: status,
      data: regionLabelss.map((region) => budgetByRegionAndStatus[region][status] || 0),
    })),
  };

  const calculateRegionWiseProjects = () => {
    const regionProjects = {};
    info.forEach((project) => {
      if (project.remarks !== 'Terminated') {
        const region = project.releaseData?.regionIA;
        if (region) {
          regionProjects[region] = (regionProjects[region] || 0) + 1;
        }
      }
    });
    return regionProjects;
  };

  const regionProjects = calculateRegionWiseProjects();

  return (
    <article className='pt-5 pb-5 pe-5'>

      <div className="d-flex justify-content-between align-items-center">
        <label className='h4 py-2 fw-bold'>Dashboard</label>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <h6 className='pt-1 fw-semibold'>Programs/Projects Summary</h6>
        <div className="d-flex align-items-center">
          <div className='sample dropdown me-3 filterTooltip' style={{ borderRadius: '50px', padding: '7px 2px 2px 2px' }}>
            <ReactTooltip anchorSelect=".filterTooltip" style={{ borderRadius: '10px', fontSize: '12px' }}>
              Filter
            </ReactTooltip>
            <button type="button" className="btn border-0" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
              <i className="fa-solid fa-filter fs-5"></i>
            </button>
            <ul className="dropdown-menu dropdown-submenu p-2 dropdown-menu-lg-end">
              <label className="pb-2">Year:</label>
              {validYears.map(year => (
                <div key={year} className="form-check">
                  <input
                    type="checkbox"
                    id={`yearCheckbox-${year}`}
                    value={year}
                    checked={selectedYears.includes(year)}
                    onChange={(e) => handleYearChange(e, year)}
                    className="form-check-input me-2"
                  />
                  <label htmlFor={`yearCheckbox-${year}`} className="form-check-label me-4">
                    {year}
                  </label>
                </div>
              ))}
              <div className="d-flex justify-content-end">
                <div className='resetTooltip me-auto'>
                  <Tooltip anchorSelect=".resetTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                    Reset
                  </Tooltip>
                  <button type="button" className="btn btn-outline rounded-circle py-1 px-2" onClick={clearFilter}><i className="fa-solid fa-arrow-rotate-right"></i></button>
                </div>
                <div className='applyTooltip'>
                  <Tooltip anchorSelect=".applyTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                    Apply
                  </Tooltip>
                  <button type="button" className="btn btn-outline rounded-circle py-1 px-2" onClick={applyYearFilter}><i className="fa-solid fa-check text-success"></i></button>
                </div>
              </div>
            </ul>
          </div>
          <div className='sample me-3 refreshTooltip' style={{ borderRadius: '50px', padding: '7px 2px 2px 2px' }}>
            <ReactTooltip anchorSelect=".refreshTooltip" style={{ borderRadius: '10px', fontSize: '12px' }}>
              Refresh
            </ReactTooltip>
            <button type="button" className="btn border-0" onClick={refreshData} data-bs-toggle="tooltip" data-bs-title="Refresh">
              <i className="fa-solid fa-sync fs-5"></i>
            </button>
          </div>
        </div>
      </div>

      <div className='row pb-4'>
        <div className='col-lg-4'>
          <div className='row row-cols-lg-2 g-3 pt-4'>
            <div className='col-lg-12'>
              <div className='card radius-10 border'>
                <div className='card-body' style={{ padding: '25px 20px 25px 35px' }}>
                  <div className='d-flex align-items-center'>
                    <div className='' style={{ backgroundColor: '#E0F2F1', borderRadius: '50px', padding: '10px' }}>
                      <i className='fa-solid fa-equals fs-5 p-1' style={{ color: '#009688' }}></i>
                    </div>
                    <div className='ps-4 text-truncate'>
                      <p className='mb-0 text-dark fs-4 fw-bold'>{totalProjects}</p>
                      <p className='text-secondary h6' style={{ fontSize: '15px' }}>Total Projects</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col'>
              <div className='card radius-10 border'>
                <div className='card-body' style={{ padding: '25px 20px 25px 35px' }}>
                  <div className='d-flex align-items-center'>
                    <div className='' style={{ backgroundColor: '#E1F5FE', borderRadius: '50px', padding: '10px' }}>
                      <i className='fa-solid fa-arrows-rotate fs-5 p-1' style={{ color: '#03A9F4' }}></i>
                    </div>
                    <div className='ps-4 text-truncate'>
                      <p className='mb-0 text-dark fs-4 fw-bold'>{ongoingProjects.length} ({((ongoingProjects.length / totalProjects) * 100).toFixed()}%)</p>
                      <p className='text-secondary h6' style={{ fontSize: '15px' }}>Ongoing</p>
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
                      <i className='fa-regular fa-square-plus fs-5 p-1' style={{ color: '#FF9800' }}></i>
                    </div>
                    <div className='ps-4 text-truncate'>
                      <p className='mb-0 text-dark fs-4 fw-bold'>{newProjects.length} ({((newProjects.length / totalProjects) * 100).toFixed()}%)</p>
                      <p className='text-secondary h6' style={{ fontSize: '15px' }}>New</p>
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
                      <p className='mb-0 text-dark fs-4 fw-bold'>{completedProjects.length} ({((completedProjects.length / totalProjects) * 100).toFixed()}%)</p>
                      <p className='text-secondary h6' style={{ fontSize: '15px' }}>Completed</p>
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
                      <p className='mb-0 text-dark fs-4 fw-bold'>{terminatedProjects.length} ({((terminatedProjects.length / totalProjects) * 100).toFixed()}%)</p>
                      <p className='text-secondary h6' style={{ fontSize: '15px' }}>Terminated</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col'>
          <div className="row g-3 pt-2 pt-4">
            <div className="col">
              <div className="card radius-10 border p-2">
                <div className="card-body text-center">
                  <h6 className="card-title fw-bold text-start">New, Ongoing, and Completed Programs/Projects</h6>
                  <div className="d-inline-block" style={{ minWidth: '60%', maxHeight: '289px' }}>
                    <Pie data={pieChartData} options={options} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card radius-10 border p-2">
                <div className="card-body text-center">
                  <h6 className="card-title fw-bold text-start">New, Ongoing, and Completed Programs/Projects</h6>
                  <div className="d-inline-block" style={{ minWidth: '60%', maxHeight: '289px' }}>
                    <Doughnut data={pieChartData} options={options} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h6 className='pt-4 pb-4 fw-bold'>Programs/Projects per ISP Summary</h6>
      <div className='row g-3 pt-2 pb-4'>


      <div className='row g-3 pt-2 pb-4'>
        <div className="col-lg-3">
            <div className="card radius-10 border p-2">
                <div className="card-body text-center">
                    <h6 className="card-title fw-bold text-start">New, Ongoing, and Completed Programs/Projects per ISP</h6>
                    <div className="d-inline-block" style={{ minWidth: '60%' }}>
                        <Pie data={ispChartData} options={options} />
                    </div>
                </div>
            </div>
        </div>
        {Object.keys(ispPerData).map((isp) => {
            const remarks = ispPerData[isp];
            if (isp && remarks && (remarks.new || remarks.ongoing || remarks.completed)) {
                return (
                    <div className="col-lg-3 col-md-4 col-sm-6" key={isp}>
                        <div className="card radius-10 border p-2 h-100">
                            <div className="card-body text-center">
                                <h6 className="card-title fw-bold text-start">{isp}</h6>
                                <div className="d-inline-block" style={{ minWidth: '64%' }}>
                                    <Pie data={generateChartData(remarks)} options={options} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            } else {
                return null; // If ISP or remarks are empty, don't render anything
            }
        })}

<div className="col-lg-3 col-md-4 col-sm-6">
    <div className="card radius-10 border p-2 h-100">
      <div className="card-body text-center">
        <h6 className="card-title fw-bold text-start d-flex justify-content-between align-items-center">
          Inland Biodiversity
          {/* Filter Button with Dropdown */}
          <div className="dropdown" style={{ fontWeight: 'normal' }}>
            <button
              type="button"
              className="btn border-0"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              data-bs-auto-close="outside"
            >
              <i className="fa-solid fa-filter"></i>
            </button>
            <ul className="dropdown-menu dropdown-submenu p-2 dropdown-menu-lg-end" style={{ width: '19rem' }}>
              <label className="pb-2">Select Filters:</label>
              {ispOptions.map((option, index) => (
                <div key={index} className="form-check">
                  <input
                    type="checkbox"
                    id={`filterCheckbox-${index}`}
                    value={option}
                    checked={selectedFilters.includes(option)}
                    onChange={(e) => handleFilterChange(e, option)}
                    className="form-check-input me-2"
                  />
                  <label htmlFor={`filterCheckbox-${index}`} className="form-check-label me-4">
                    {option}
                  </label>
                </div>
              ))}
            </ul>
          </div>
        </h6>

        {/* Pie Chart */}
        <div className="d-inline-block" style={{ minWidth: '64%' }}>
          <Pie data={generateInlandChartData()} options={options} />
        </div>
      </div>
    </div>
  </div>
      </div>

        <div className="col">

        </div>
        <div className="col">

        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <h6 className='pt-1 fw-bold'>Budget</h6>
        <div className="d-flex align-items-center">

        </div>
      </div>

      <div className='row pt-2 pb-4'>
        <div className=''>
          <div className='row g-3 pt-4'>
            <div className='col'>
              <div className='card radius-10 border'>
                <div className='card-body' style={{ padding: '25px 20px 25px 35px' }}>
                  <div className='d-flex align-items-center'>
                    <div className='' style={{ backgroundColor: '#E0F2F1', borderRadius: '50px', padding: '10px' }}>
                      <i className='fa-solid fa-equals fs-5 p-1' style={{ color: '#009688' }}></i>
                    </div>
                    <div className='ps-4 text-truncate'>
                      <p className='mb-0 text-dark fs-5 fw-bold'>{calculateBudgetOverallTotal().toLocaleString()}</p>
                      <p className='text-secondary h6' style={{ fontSize: '15px' }}>Overall Total Budget</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col'>
          <div className="row g-3 pt-2 pt-4">
            <div className="col">
              <div className="card radius-10 border p-2">
                <div className="card-body text-center">
                  <h6 className="card-title fw-bold text-start">Total Budget per ISP</h6>
                  <div className="d-inline-block" style={{ minWidth: '100%' }}>
                    <Line data={lineChartData} options={option} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card radius-10 border p-2">
                <div className="card-body text-center">
                  <h6 className="card-title fw-bold text-start">Total Budget per ISP</h6>
                  <div className="d-inline-block" style={{ minWidth: '100%' }}>
                    <Bar data={lineChartData} options={option} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <h6 className='pt-1 fw-bold'>Budget Releases</h6>
        <div className="d-flex align-items-center">

        </div>
      </div>

      <div className='row pt-2 pb-4'>
        <div className=''>
          <div className='row'>
            <div className='col'>
              <div className='card radius-10 border'>
                <div className='card-body' style={{ padding: '25px 20px 25px 35px' }}>
                  <div className='d-flex align-items-center'>
                    <div className='' style={{ backgroundColor: '#E0F2F1', borderRadius: '50px', padding: '10px' }}>
                      <i className='fa-solid fa-equals fs-5 p-1' style={{ color: '#009688' }}></i>
                    </div>
                    <div className='ps-4 text-truncate'>
                      <p className='mb-0 text-dark fs-5 fw-bold'>{calculateBudgetOverallTotal().toLocaleString()}</p>
                      <p className='text-secondary h6' style={{ fontSize: '15px' }}>Overall Total Budget</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col'>
              <div className='card radius-10 border'>
                <div className='card-body' style={{ padding: '25px 20px 25px 35px' }}>
                  <div className='d-flex align-items-center'>
                    <div className='' style={{ backgroundColor: '#E1F5FE', borderRadius: '50px', padding: '10px' }}>
                      <i className='fa-solid fa-arrows-rotate fs-5 p-1' style={{ color: '#03A9F4' }}></i>
                    </div>
                    <div className='ps-4 text-truncate'>
                      <p className='mb-0 text-dark fs-5 fw-bold'>{calculateProgrammedOverallTotal().toLocaleString()}</p>
                      <p className='text-secondary h6' style={{ fontSize: '15px' }}>Total Programmed Budget</p>
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
                      <i className='fa-regular fa-square-plus fs-5 p-1' style={{ color: '#FF9800' }}></i>
                    </div>
                    <div className='ps-4 text-truncate'>
                      <p className='mb-0 text-dark fs-4 fw-bold'>{calculateActualOverallTotal().toLocaleString()}</p>
                      <p className='text-secondary h6' style={{ fontSize: '15px' }}>Total Actual Releases</p>
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
                      <p className='mb-0 text-dark fs-4 fw-bold'>{calculateNewBudgetOverallTotal().toLocaleString()}</p>
                      <p className='text-secondary h6' style={{ fontSize: '15px' }}>Total for New</p>
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
                      <p className='mb-0 text-dark fs-5 fw-bold'>{calculateOngoingBudgetOverallTotal().toLocaleString()}</p>
                      <p className='text-secondary h6' style={{ fontSize: '15px' }}>Total for Ongoing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col'>
          <div className="row g-3 pt-2 pt-4">
            <div className="col">
              <div className="card radius-10 border p-2">
                <div className="card-body text-center">
                  <h6 className="card-title fw-bold text-start">Sum of Releases</h6>
                  <div className="d-inline-block" style={{ minWidth: '100%' }}>
                    <Bar data={sumOfReleasesData1} options={option} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card radius-10 border p-2">
                <div className="card-body text-center">
                  <h6 className="card-title fw-bold text-start">Sum of Releases</h6>
                  <div className="d-inline-block" style={{ minWidth: '100%' }}>
                    <Bar data={sumOfReleasesData2} options={option} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <h6 className='pt-1 fw-bold'>Implementing Agencies</h6>
        <div className="d-flex align-items-center">

        </div>
      </div>

      <div className='row g-3 pt-2 pb-4'>
        <div className="col">
          <div className="card radius-10 border p-2">
            <div className="card-body text-center">
              <h6 className="card-title fw-bold text-start">For New, Ongoing, and Completed Programs/Projects</h6>
              <div className="d-inline-block" style={{ minWidth: '100%' }}>
                <Bar data={barChartData} options={option} />
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card radius-10 border p-2">
            <div className="card-body text-center">
              <h6 className="card-title fw-bold text-start">Per Regions</h6>
              <div className="d-inline-block" style={{ minWidth: '100%' }}>
                <Bar data={regionData} options={option} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='row g-3 pt-2 pb-4'>
        <div className="col">
          <div className="card radius-10 border p-2">
            <div className="card-body text-center">
              <h6 className="card-title fw-bold text-start">GIA Funding Per Regions</h6>
              <div className="d-inline-block" style={{ minWidth: '100%' }}>
                <Bar data={regionDataWithBudget} options={option} />
              </div>
            </div>
          </div>
        </div>
        <div className="col">

        </div>
      </div>

      <div className="d-flex">
        <h6 className='pt-1 pb-4 fw-bold'>Projects per Regions</h6>
      </div>

      <div className='row pt-2 pb-4'>
        <div className='col-lg-4'>
          <div className='row row-cols-lg-2 g-3 pt-4'>
            <div className='col-lg-12'>
              <div className='card radius-10 border' style={{ maxHeight: '756px', overflowY: 'auto' }}>
                <div className='card-body'>
                  <table className='table'>
                    <thead>
                      <tr>
                        <th>Region</th>
                        <th>Total Projects</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(regionProjects).map(([region, totalProjects], index) => (
                        <tr key={index}>
                          <td>{region}</td>
                          <td>{totalProjects}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col'>
          <div className="row g-3 pt-2 pt-4">
            <div className="col">
              <div className="card radius-10 border" style={{ height: '80vh' }}> {/* Set card height */}
                <div className="card-body p-0" style={{ height: '100%' }}> {/* Ensure card-body fills the card */}
                  <div className="" style={{ height: '100%', minWidth: '100%' }}> {/* Ensure full width and height */}
                    <div ref={mapContainerRef} style={{ height: '100%', width: '100%', borderRadius: '10px' }} /> {/* Ensure map container fills the parent */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <h6 className='pt-1 fw-bold'>Proposals</h6>
        <div className="d-flex align-items-center">
          <div className='sample dropdown me-3 filterTooltip' style={{ borderRadius: '50px', padding: '7px 2px 2px 2px' }}>
            <ReactTooltip anchorSelect=".filterTooltip" style={{ borderRadius: '10px', fontSize: '12px' }}>
              Filter
            </ReactTooltip>
            <button type="button" className="btn border-0" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
              <i className="fa-solid fa-filter fs-5"></i>
            </button>
            <ul className="dropdown-menu dropdown-submenu p-2 dropdown-menu-lg-end">
              <label className="pb-2">Year:</label>
              {validYearsProposal.map(year => (
                <div key={year} className="form-check">
                  <input
                    type="checkbox"
                    id={`yearCheckbox-${year}`}
                    value={year}
                    checked={selectedYearsProposal.includes(year)}
                    onChange={(e) => handleYearChangeProposal(e, year)}
                    className="form-check-input me-2"
                  />
                  <label htmlFor={`yearCheckbox-${year}`} className="form-check-label me-4">
                    {year}
                  </label>
                </div>
              ))}
              <div className="d-flex justify-content-end">
                <div className='resetTooltip me-auto'>
                  <Tooltip anchorSelect=".resetTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                    Reset
                  </Tooltip>
                  <button type="button" className="btn btn-outline rounded-circle py-1 px-2" onClick={clearFilterProposal}><i className="fa-solid fa-arrow-rotate-right"></i></button>
                </div>
                <div className='applyTooltip'>
                  <Tooltip anchorSelect=".applyTooltip" style={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
                    Apply
                  </Tooltip>
                  <button type="button" className="btn btn-outline rounded-circle py-1 px-2" onClick={applyYearFilterProposal}><i className="fa-solid fa-check text-success"></i></button>
                </div>
              </div>
            </ul>
          </div>
          <div className='sample me-3 refreshTooltip' style={{ borderRadius: '50px', padding: '7px 2px 2px 2px' }}>
            <ReactTooltip anchorSelect=".refreshTooltip" style={{ borderRadius: '10px', fontSize: '12px' }}>
              Refresh
            </ReactTooltip>
            <button type="button" className="btn border-0" onClick={refreshData} data-bs-toggle="tooltip" data-bs-title="Refresh">
              <i className="fa-solid fa-sync fs-5"></i>
            </button>
          </div>
        </div>
      </div>

      <div className='row pt-2 pb-4'>
        <div className='col-lg-4'>
          <div className='row row-cols-lg-2 g-3 pt-4'>
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
                    <div className='' style={{ backgroundColor: '#EDE7F6', borderRadius: '50px', padding: '10px' }}>
                      <i className='fa-solid fa-file-pen fs-5 p-1 pe-0' style={{ color: '#7E57C2' }}></i>
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
        </div>
        <div className='col'>
          <div className="row g-3 pt-2 pt-4">
            <div className="col">
              <div className="card radius-10 border p-2">
                <div className="card-body text-center">
                  <h6 className="card-title fw-bold text-start">Proposals</h6>
                  <div className="d-inline-block" style={{ minWidth: '60%', maxHeight: '289px' }}>
                    <Pie data={pieChartDataProposals} options={options} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card radius-10 border p-2">
                <div className="card-body text-center">
                  <h6 className="card-title fw-bold text-start">Proposals</h6>
                  <div className="d-inline-block" style={{ minWidth: '60%', maxHeight: '289px' }}>
                    <Doughnut data={pieChartDataProposals} options={options} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Dashboard;
