import React from 'react';

const PdfModal = ({ pdfUrl, closeModal }) => {
    return (
        <div className="modal modal-overlay fade show" tabIndex="-1" style={{ display: 'block' }} aria-labelledby="pdfModalLabel">
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content bg-dark">
                    <div className="modal-header border-0">
                        <button type="button" className="btn-close bg-light" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body p-1 m-0">
                        <embed src={pdfUrl} type="application/pdf" width="100%" height="823px" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PdfModal;
