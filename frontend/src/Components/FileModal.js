import React from 'react';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

const FileModal = ({ fileUrl, closeModal }) => {
  const docs = [
    { uri: fileUrl }
  ];

  return (
    <div className="modal fade show modal-overlay" tabIndex="-1" style={{ display: 'block' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-dark">
          <div className="modal-header border-0">
            <h5 className="modal-title">Document Preview</h5>
            <button type="button" className="btn-close bg-white" onClick={closeModal}></button>
          </div>
          <div className="modal-body" style={{ height: '500px' }}>
            <DocViewer 
              documents={docs} 
              pluginRenderers={DocViewerRenderers}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileModal;
