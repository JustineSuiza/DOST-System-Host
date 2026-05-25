import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [filesList, setFilesList] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:8080/UploadFile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('File uploaded successfully');
      // After successful upload, fetch the updated files list
      fetchFilesList();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const fetchFilesList = async () => {
    try {
      const response = await axios.get('http://localhost:8080/Upload');
      setFilesList(response.data);
    } catch (error) {
      console.error('Error fetching files list:', error);
    }
  };

  useEffect(() => {
    // Fetch the initial files list when component mounts
    fetchFilesList();
  }, []);

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      <h2>Uploaded Files:</h2>
      <ul>
        {filesList.map((file, index) => (
          <li key={index}>
            <a href={file.filepath} download={file.filename}>{file.filename}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileUpload;
