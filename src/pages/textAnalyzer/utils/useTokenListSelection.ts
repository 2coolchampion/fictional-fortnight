// useTokenSelection.ts

import { useEffect, useState } from 'react';


const useTokenSelection = (currentModeRef) => {
  const [selectedTokenList, setSelectedTokenList] = useState<Element[]>([]);

  const updateSelectedTokens = () => {
    // Retrieve all selected tokens
    const selectedTokens: Element[] = Array.from(document.getElementsByClassName('selected'));

    // Update selectedTokenList with the union of the current and newly selected tokens
    setSelectedTokenList(
      Array.from(new Set(selectedTokens))
    );
  };

  const handleAddToTokenList = () => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const spanElement = range.commonAncestorContainer.parentElement as HTMLElement;

    const isSpanElementToken = spanElement.classList.contains('token');
    const isSpanElementSelected = spanElement.classList.contains('selected');

    if (currentModeRef.current === 'editTokenList' && isSpanElementToken) {
      updateSelectedTokens();
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleAddToTokenList);

    return () => {
      document.removeEventListener('mouseup', handleAddToTokenList);
    };
  }, [currentModeRef]);

  return {
    updateSelectedTokens,
    selectedTokenList,
    
  };
};

export default useTokenSelection;

