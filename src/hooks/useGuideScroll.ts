import { useRef, useCallback, useEffect, useState } from 'react';

// Virtualization constant - number of items to render outside visible area
const OVERSCAN_COUNT = 10;

interface UseGuideScrollProps {
  totalLines: number;
  initialLine: number;
  fontSize: number;
  zoomLevel: number;
  isLoading: boolean;
  onLineChange: (line: number) => void;
  onScrollingStateChange: (isScrolling: boolean) => void;
}

interface UseGuideScrollReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  visibleRange: { start: number; end: number };
  showFloatingProgress: boolean;
  lineHeight: number;
  scrollToLine: (line: number, behavior?: ScrollBehavior) => void;
  handleScroll: () => void;
}

export const useGuideScroll = ({
  totalLines,
  initialLine,
  fontSize,
  zoomLevel,
  isLoading,
  onLineChange,
  onScrollingStateChange
}: UseGuideScrollProps): UseGuideScrollReturn => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 });
  const [showFloatingProgress, setShowFloatingProgress] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitiallyScrolled = useRef(false);
  const currentLineRef = useRef(1);
  
  // Calculate line height based on font size
  const lineHeight = Math.ceil(fontSize * 1.5);
  const scaledLineHeight = lineHeight * zoomLevel;

  // Scroll to a specific line
  const scrollToLine = useCallback((line: number, behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current) return;
    
    const targetScrollTop = (line - 1) * scaledLineHeight;
    containerRef.current.scrollTo({
      top: targetScrollTop,
      behavior
    });
    
    // Update current line immediately when programmatically scrolling
    currentLineRef.current = line;
    onLineChange(line);
  }, [scaledLineHeight, onLineChange]);

  // Calculate visible range for virtual scrolling
  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current || isLoading) return;
    
    const container = containerRef.current;
    const { scrollTop, clientHeight } = container;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / scaledLineHeight) - OVERSCAN_COUNT * 10);
    const endIndex = Math.min(totalLines, Math.ceil((scrollTop + clientHeight) / scaledLineHeight) + OVERSCAN_COUNT * 10);
    
    setVisibleRange(prev => {
      if (Math.abs(prev.start - startIndex) > OVERSCAN_COUNT || Math.abs(prev.end - endIndex) > OVERSCAN_COUNT) {
        return { start: startIndex, end: endIndex };
      }
      return prev;
    });

    // Calculate current line based on scroll position
    const viewportMiddle = scrollTop + (clientHeight / 2);
    const newCurrentLine = Math.max(1, Math.min(totalLines, Math.floor(viewportMiddle / scaledLineHeight) + 1));
    
    // Update current line if it has changed
    if (newCurrentLine !== currentLineRef.current) {
      currentLineRef.current = newCurrentLine;
      onLineChange(newCurrentLine);
      onScrollingStateChange(true);
    }

    // Show floating progress on mobile when scrolling
    if (window.innerWidth < 640) {
      setShowFloatingProgress(true);
    }
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set timeout to hide progress and reset scrolling state
    scrollTimeoutRef.current = setTimeout(() => {
      setShowFloatingProgress(false);
      onScrollingStateChange(false);
    }, 1500);
  }, [isLoading, totalLines, scaledLineHeight, onLineChange, onScrollingStateChange]);

  // Prevent browser scroll restoration
  useEffect(() => {
    const previousScrollRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    
    return () => {
      history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  // Update visible range when dependencies change
  useEffect(() => {
    updateVisibleRange();
  }, [fontSize, zoomLevel, updateVisibleRange]);

  // Initial scroll to saved position
  useEffect(() => {
    if (!hasInitiallyScrolled.current && initialLine > 1 && totalLines > 0 && containerRef.current) {
      hasInitiallyScrolled.current = true;
      // Use immediate scroll for initial position
      scrollToLine(initialLine, 'auto');
    }
  }, [initialLine, totalLines, scrollToLine]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    contentRef,
    visibleRange,
    showFloatingProgress,
    lineHeight,
    scrollToLine,
    handleScroll: updateVisibleRange
  };
};