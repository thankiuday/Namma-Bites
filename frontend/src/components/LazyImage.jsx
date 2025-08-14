import React, { useEffect, useRef, useState } from 'react';

const Spinner = ({ className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-300 border-t-orange-600" />
  </div>
);

const LazyImage = ({
  src,
  alt = '',
  className = '',
  fallbackSrc = '/logo.png',
  loader = null,
  imgClassName = '',
  ...imgProps
}) => {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const imageSrc = hasError ? fallbackSrc : src;

  return (
    <div ref={containerRef} className={className}>
      {!loaded && (loader || <Spinner className="w-full h-full" />)}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${imgClassName} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
          loading="lazy"
          {...imgProps}
        />)
      }
    </div>
  );
};

export default LazyImage;


