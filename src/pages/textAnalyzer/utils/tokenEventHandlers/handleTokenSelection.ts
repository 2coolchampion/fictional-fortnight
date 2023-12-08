const selection = window.getSelection();

    // const handleSelectionAndMultiSelect = (e) => {

      export const handleSelection = (e, currentModeRef, selectedTokenList, setSelectedTokenList) => {
      // NOTE: Remember to use currentModeRef.current instead of state variable currentMode

        if (!selection || selection.rangeCount === 0) return;

        // add or remove selection class

          const range = selection.getRangeAt(0);
          const spanElement = range.commonAncestorContainer.parentElement as HTMLElement;

          const isSpanElementToken = spanElement.classList.contains('token');
          const isSpanElementSelected = spanElement.classList.contains('selected');


          if ((spanElement.tagName) === 'SPAN' && isSpanElementToken) {

            if (!isSpanElementSelected) {
              spanElement.classList.add('selected');

              if (currentModeRef.current === 'editTokenList') {
                // Add token to selected list
                setSelectedTokenList([...selectedTokenList, spanElement]);
                // console.log(`added to list ${selectedTokenList}`);
              }

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

          }
      }

      type SelectionDirection = 'backward' | 'forward'

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

      export const handleMultiSelect = (selectedTokenList, setSelectedTokenList) => {

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

          const newTokenList = [...selectedTokenList];
      
          anchorNode.classList.add('selected');

          const selectNextSibling = (currentSpan: Element, finalSpan: Element) => {
            currentSpan.classList.add('selected');

            if (!newTokenList.includes(currentSpan)) {
              newTokenList.push(currentSpan);
            }
            
            const nextSibbling: Element = currentSpan.nextElementSibling;
            
            if (nextSibbling !== finalSpan) {
              nextSibbling.classList.add('selected');
              selectNextSibling(nextSibbling, finalSpan);
            } else {
              finalSpan.classList.add('selected');

              if (!newTokenList.includes(finalSpan)) {
                newTokenList.push(finalSpan);
              }

              setSelectedTokenList(newTokenList);
            }
          }
  
          const selectPrevSibling = (currentSpan: Element, finalSpan: Element) => {
            currentSpan.classList.add('selected');

            if (!newTokenList.includes(currentSpan)) {
              newTokenList.push(currentSpan);
            }
  
            const prevSibbling: Element = currentSpan.nextElementSibling;
  
            if (prevSibbling !== finalSpan) {
              prevSibbling.classList.add('selected');
              selectPrevSibling(prevSibbling, finalSpan);
            } else {
              finalSpan.classList.add('selected');
              
              if (!newTokenList.includes(finalSpan)) {
                newTokenList.push(finalSpan);
              }

              setSelectedTokenList(newTokenList);
            }
          }
  
          const Direction = getSelectionDirection();
  
          if (Direction === 'forward')
            selectNextSibling(anchorNode, focusNode);
          else {
            selectPrevSibling(focusNode, anchorNode);
          }

          sel.removeAllRanges();
    }