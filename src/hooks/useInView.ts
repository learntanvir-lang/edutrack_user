
'use client';

import { useState, useEffect, useRef } from 'react';

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
}

export function useInView(options: IntersectionObserverOptions = {}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (options.triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else {
            if (!options.triggerOnce) {
                setInView(false);
            }
        }
      },
      {
        root: options.root,
        rootMargin: options.rootMargin,
        threshold: options.threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, inView];
}
