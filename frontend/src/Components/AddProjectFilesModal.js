import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddProjectFilesModal = ({ isAddFileModalOpen, closeModal, project, refresh, showToastF }) => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [error, setError] = useState('');
  const [implementationFilename, setImplementationFilename] = useState('');
  const [implementationFilepath, setImplementationFilepath] = useState('');
  const [extensionFilename, setExtensionFilename] = useState('');
  const [extensionFilepath, setExtensionFilepath] = useState('');
  const [realignmentFilename, setRealignmentFilename] = useState('');
  const [realignmentFilepath, setRealignmentFilepath] = useState('');

  useEffect(() => {
    if (project && project.fileData) {
      setImplementationFilename(project.fileData.implementationFilename || '');
      setImplementationFilepath(project.fileData.implementationFilepath || '');
      setExtensionFilename(project.fileData.extensionFilename || '');
      setExtensionFilepath(project.fileData.extensionFilepath || '');
      setRealignmentFilename(project.fileData.realignmentFilename || '');
      setRealignmentFilepath(project.fileData.realignmentFilepath || '');
    }
  }, [project]);

  const handleFileChange = (event, fileType) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFiles(prevState => ({ ...prevState, [fileType]: file }));
      if (fileType === 'implementationFile') {
        setImplementationFilename(file.name);
        setImplementationFilepath(`C:\\xampp\\htdocs\\DOST-Project\\backend\\writable\\uploads/${file.name}`);
      } else if (fileType === 'extensionFile') {
        setExtensionFilename(file.name);
        setExtensionFilepath(`C:\\xampp\\htdocs\\DOST-Project\\backend\\writable\\uploads/${file.name}`);
      } else if (fileType === 'realignmentFile') {
        setRealignmentFilename(file.name);
        setRealignmentFilepath(`C:\\xampp\\htdocs\\DOST-Project\\backend\\writable\\uploads/${file.name}`);
      }
    } else {
      // Clear filename and filepath if no file is selected
      if (fileType === 'implementationFile') {
        setImplementationFilename('');
        setImplementationFilepath('');
      } else if (fileType === 'extensionFile') {
        setExtensionFilename('');
        setExtensionFilepath('');
      } else if (fileType === 'realignmentFile') {
        setRealignmentFilename('');
        setRealignmentFilepath('');
      }
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    // Check if at least one file is selected or at least one field is non-empty
    if (Object.keys(selectedFiles).length === 0 &&
        (!implementationFilename || !extensionFilename || !realignmentFilename)) {
      setError('Please select at least one file.');
      return;
    }

    const formData = new FormData();
    if (selectedFiles.implementationFile) {
      formData.append('implementationFile', selectedFiles.implementationFile);
    }
    if (selectedFiles.extensionFile) {
      formData.append('extensionFile', selectedFiles.extensionFile);
    }
    if (selectedFiles.realignmentFile) {
      formData.append('realignmentFile', selectedFiles.realignmentFile);
    }

    const data = {
      implementationFilename,
      implementationFilepath,
      extensionFilename,
      extensionFilepath,
      realignmentFilename,
      realignmentFilepath,
    };

    try {
      await axios.post(`http://localhost:8080/UploadFile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await axios.patch(`http://localhost:8080/UploadFile/${project.fileData.id}`, data);

      document.getElementById('fileInputImplementation').value = '';
      document.getElementById('fileInputExtension').value = '';
      document.getElementById('fileInputRealignment').value = '';

      setSelectedFiles({});
      setImplementationFilename('');
      setImplementationFilepath('');
      setExtensionFilename('');
      setExtensionFilepath('');
      setRealignmentFilename('');
      setRealignmentFilepath('');

      closeModal();
      refresh();
      showToastF();
    } catch (error) {
      setError('File upload failed. Please try again later.');
      console.error('Error uploading file:', error);
    }
  };


  return (
    <div>
      <form>
        <div className={`modal fade modal-overlay ${isAddFileModalOpen ? 'show' : ''}`} tabIndex="-1" style={{ display: isAddFileModalOpen ? 'block' : 'none' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '80rem' }}>
            <div className="modal-content p-2">
              <div className="modal-header border-0">
                <h1 className="modal-title fw-semibold" style={{ fontSize: '18px' }}>Add/Update Files</h1>
                <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="row pt-3">
                  <div className='col'>
                    <label className="pb-2">Change Implementation File</label>
                    <input id='fileInputImplementation' type="file" className='form-control' onChange={(e) => handleFileChange(e, 'implementationFile')} />
                    <label className='pt-2'><span className='fw-semibold'>File Uploaded: </span>{project?.fileData?.implementationFilename}</label>
                    {error && <div className="text-danger mt-2">{error}</div>}
                  </div>
                </div>
                <div className="row pt-3">
                  <div className='col'>
                    <label className="pb-2">Extension File</label>
                    <input id='fileInputExtension' type="file" className='form-control' onChange={(e) => handleFileChange(e, 'extensionFile')} />
                    <label className='pt-2'><span className='fw-semibold'>File Uploaded: </span>{project?.fileData?.extensionFilename}</label>
                    {error && <div className="text-danger mt-2">{error}</div>}
                  </div>
                </div>
                <div className="row pt-3">
                  <div className='col'>
                    <label className="pb-2">Budget Realignment File</label>
                    <input id='fileInputRealignment' type="file" className='form-control' onChange={(e) => handleFileChange(e, 'realignmentFile')} />
                    <label className='pt-2'><span className='fw-semibold'>File Uploaded: </span>{project?.fileData?.realignmentFilename}</label>
                    {error && <div className="text-danger mt-2">{error}</div>}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-outline px-3 py-2 border text-black" style={{ fontSize: '14px' }} onClick={closeModal}>Cancel</button>
                <button className="btn btn-dark px-3 py-2 border" style={{ fontSize: '14px' }} onClick={handleFileUpload}>Update</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProjectFilesModal;
