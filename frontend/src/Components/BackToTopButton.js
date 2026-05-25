import React, { useState, useEffect } from 'react'; 
import './BackToTopButton.css'

const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleScroll = () => {
    if (window.pageYOffset > 300) {
        setIsVisible(true);
    } else {
        setIsVisible(false);
    }
    };

    useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
    }, []);

    return (
        <div>
            {isVisible && 
                <div className=''>
                    <button type='button' className='btnn position-fixed bottom-0 end-0 rounded-circle m-4' onClick={scrollToTop}>
                        <i className="fa-solid fa-arrow-up fs-5 mt-1"></i>
                    </button>
                </div>
            }
        </div>
  )
}

export default BackToTopButton