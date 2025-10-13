"use client";

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (typeof window !== 'undefined') {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
        window.addEventListener('scroll', toggleVisibility);

        return () => {
          window.removeEventListener('scroll', toggleVisibility);
        };
    }
  }, []);

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6">
      <Button
        variant="default"
        size="icon"
        onClick={scrollToTop}
        className={cn(
          'rounded-full h-12 w-12 transition-opacity duration-300 shadow-lg',
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <ArrowUp className="h-6 w-6" />
        <span className="sr-only">Go to top</span>
      </Button>
    </div>
  );
}
