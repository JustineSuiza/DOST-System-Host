import React from 'react';
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";

const ImageModal = ({ imageUrl, closeModal }) => {

    const Controls = () => {
        const { zoomIn, zoomOut, resetTransform } = useControls();
      
        return (
          <div className="tools">
            <button className='btn' onClick={() => zoomIn()}><i class="bi bi-plus-lg text-white"></i></button>
            <button className='btn' onClick={() => zoomOut()}><i class="bi bi-dash-lg text-white"></i></button>
            <button className='btn text-white' onClick={() => resetTransform()}>Reset</button>
          </div>
        );
    };

    return (
    <div className="modal fade show modal-overlay" tabIndex="-1" style={{ display: 'block' }}>
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content bg-dark">
          <div className="modal-header border-0">
            <button type="button" className="btn-close bg-white" onClick={closeModal}></button>
          </div>
          <div className="modal-body p-1 m-0">
            <TransformWrapper
            >
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <>
                <Controls />
                <TransformComponent>
                    <img src={imageUrl} alt="Image Preview" className="img-fluid" />
                </TransformComponent>
                </>
            )}
            </TransformWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
