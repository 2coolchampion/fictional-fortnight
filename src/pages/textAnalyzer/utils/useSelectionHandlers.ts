import { useEffect } from "react";

// Import this customHook to enable token selection functionality

const getSelectionDirection = () => {
  // dones't include cases where selection is within same node. 

  const sel = window.getSelection();

  if (!sel) {
    return
  };

  if (sel.rangeCount === 0) {
    return
  };

  const anchorNode = sel.anchorNode;
  const focusNode = sel.focusNode;

  const position = anchorNode.compareDocumentPosition(focusNode);

  if (!position && sel.anchorOffset < sel.focusOffset || position === Node.DOCUMENT_POSITION_PRECEDING) {
    return 'backward'
  } else {
    return 'forward'
  }
}

const handleTokenSelection = (spanElement, currentModeRef) => {

    spanElement.classList.add('selected');

    if (spanElement.classList.contains("hovering")) {
      spanElement.classList.remove("hovering");
    };

    const selectionList = document.getElementsByClassName("selected");  

    if (currentModeRef.current !== 'editTokenList') {
      for (let i = 0; i < selectionList.length; i++) {
        if (selectionList[i] !== spanElement)
        selectionList[i].classList.remove("selected");
      };
    }

}

const useSelectionHandlers = (currentModeRef) => {
  const sel = window.getSelection();

  const handleSelection = (e, currentModeRef) => {

    if (!sel || sel.rangeCount === 0) return;

    // add or remove the .selected class

      const range = sel.getRangeAt(0);
      const spanElement = range.commonAncestorContainer.parentElement as HTMLElement;

      const isSpanToken = spanElement.classList.contains('token');
      const isSpanSelected = spanElement.classList.contains('selected');


      if ((spanElement.tagName) === 'SPAN' && isSpanToken && !isSpanSelected) {
        handleTokenSelection(spanElement, currentModeRef);
      }
  }

  type SelectionDirection = 'backward' | 'forward'

  const handleMultiSelect = (e) => {
    const sel = document.getSelection();

    if (!sel || sel.rangeCount === 0) {
      return;
    }

    const anchorNode = sel.anchorNode.parentElement as Element;
    const focusNode = sel.focusNode.parentElement as Element;

    
    if (
      anchorNode === focusNode ||
      !anchorNode ||
      !focusNode ||
      !anchorNode.classList ||
      !focusNode.classList ||
      (!anchorNode.classList.contains("token") ||
      !focusNode.classList.contains("token"))
      ) {
        return;
      }

    anchorNode.classList.add('selected');

    const selectSiblings = (currentSpan, finalSpan, siblingProperty) => {
      currentSpan.classList.add('selected');
      const sibling = currentSpan[siblingProperty];
  
      if (sibling && (sibling !== finalSpan)) {
        selectSiblings(sibling, finalSpan, siblingProperty);
      } else {
        finalSpan.classList.add('selected');
      }
    }

    const Direction = getSelectionDirection();

    if (Direction === 'forward')
      selectSiblings(anchorNode, focusNode, 'nextElementSibling');
    else {
      selectSiblings( anchorNode, focusNode, 'previousElementSibling');
    }

    sel.removeAllRanges();
  }

  useEffect(() => {
    const selection = window.getSelection();

    const handleSelectionWrapper = (e) => handleSelection(selection, currentModeRef);
    const handleMultiSelectWrapper = (e) => handleMultiSelect(currentModeRef);

    document.addEventListener('selectionchange', handleSelectionWrapper);
    document.addEventListener('mouseup', handleMultiSelectWrapper);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionWrapper);
      document.removeEventListener('mouseup', handleMultiSelectWrapper);
    };
  }, [currentModeRef]);

}

export default useSelectionHandlers;