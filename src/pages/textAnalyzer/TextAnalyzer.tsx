import { useEffect, useRef, useState } from "react";
import { getEventListeners } from "events";

const TextAnalyzer = () => {

  const [currentMode, setCurrentMode] = useState<'select' | 'editToken' | 'editTokenList' | null>('select');
  const currentModeRef = useRef<'select' | 'editToken' | 'editTokenList' | null>(currentMode); // This is necessary for the handleSelection eventHandler since value of currentMode state variable is enclosed in the scope of the handleSelection function, and it doesn't get updated when currentMode changes because the function retains a reference to the original value of currentMode from when it was first created. Refs provide a way to persist values across renders without triggering a re-render themselves.

  const [selection, setSelection] = useState<Selection | null>(null);
  const [rangeCount, setRangeCount] = useState<number>(0);
  const [rangePosition, setRangePosition] = useState<number>(0);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedTokenList, setSelectedTokenList] = useState<Element[] | null>([]);
  let lastSelectedTokenRef = useRef(null)
  let IscombiningModeEngaged = useRef(false)
  let isCTRLPressed = useRef(false)

  useEffect(() => {
    currentModeRef.current = currentMode;
  }, [currentMode]);

  useEffect(() => {

    //display some live-data for debugging purposes
    const handleSelectionChange = () => {
      const newSelection = window.getSelection();
      setSelection(newSelection);
      setRangeCount(newSelection?.rangeCount || 0);
      if (newSelection && newSelection.rangeCount > 0) {
        const range = newSelection.getRangeAt(0);
        setRangePosition(range.startOffset);
        setSelectedText(range.toString());
      } else {
        setRangePosition(0);
        setSelectedText('');
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  useEffect(() => {

    const selection = window.getSelection();

    // const handleSelectionAndMultiSelect = (e) => {

      const handleSelection = (e) => {
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

      const handleMultiSelect = (e) => {
        const sel = document.getSelection();

        if (!sel || !sel.getRangeAt(0)) {
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

          const selectNextSibling = (currentSpan: Element, finalSpan: Element) => {
            currentSpan.classList.add('selected');
  
            const nextSibbling: Element = currentSpan.nextElementSibling;
  
            if (nextSibbling !== finalSpan) {
              nextSibbling.classList.add('selected');
              selectNextSibling(nextSibbling, finalSpan);
            } else {
              finalSpan.classList.add('selected');
            }
          }
  
          const selectPrevSibling = (currentSpan: Element, finalSpan: Element) => {
            currentSpan.classList.add('selected');
  
            const prevSibbling: Element = currentSpan.nextElementSibling;
  
            if (prevSibbling !== finalSpan) {
              prevSibbling.classList.add('selected');
              selectPrevSibling(prevSibbling, finalSpan);
            } else {
              finalSpan.classList.add('selected');
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

    document.addEventListener('selectionchange', handleSelection);
    document.addEventListener('mouseup', handleMultiSelect);

    return () => {
      document.removeEventListener('selectionchange', handleSelection);
      document.removeEventListener('mouseup', handleMultiSelect);
    }
  }, [])

  useEffect(() => {

    const handleAddToTokenList = () => {

      const selection = window.getSelection();
  
      if (!selection || selection.rangeCount === 0) return;
  
      // add or remove selection class
  
      const range = selection.getRangeAt(0);
      const spanElement = range.commonAncestorContainer.parentElement as HTMLElement;
  
      const isSpanElementToken = spanElement.classList.contains('token');
      const isSpanElementSelected = spanElement.classList.contains('selected');
  
      // Add selected to token list
      if (currentModeRef.current === 'editTokenList') {

        // spanElement.classList.remove("selected");
  
        let selectedTokens: Element[] = [...document.getElementsByClassName("selected")];
        // console.log(document.getElementsByClassName("selected"));
        // console.log(selectionList);
        if (selectedTokenList.includes(spanElement)) {
          // remove from list
          // selectedTokenList.splice(selectedTokens.indexOf(spanElement), 1);
  
          // remove from list usinf filter method
          setSelectedTokenList(selectedTokenList.filter((token) => token !== spanElement));
        }          
        setSelectedTokenList(selectedTokens);
      };
    };

    document.addEventListener('mouseup', handleAddToTokenList);

    return () => {
      document.removeEventListener('mouseup', handleAddToTokenList);
    }
    }, []);
  

  // --- --- --- 🥱

  let textboxRef = useRef<HTMLDivElement>(null);

  // initialized textboxRef on componentDidMount since textbox is not available on componentHasRendered on first mount.

  useEffect(() => {
    const textboxElement = document.getElementById("textbox");
    textboxRef.current = textboxElement as HTMLDivElement;
    if (textboxRef.current) {
      textboxRef.current.focus();
    }
  }, []);

  // --- --- --- 🥱

  const handleSplitting = (e) => {

    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const spanElement = range.commonAncestorContainer.parentElement;

      // Check if the caret is inside the span element
      if (spanElement.className.includes('token')) {
        const text = spanElement.innerText;
        const caretOffset = range.startOffset;

        // Check if the caret position is not at the start or end of the text
        if (caretOffset > 0 && caretOffset < text.length) {
          const beforeText = text.slice(0, caretOffset);
          const afterText = text.slice(caretOffset);

          // Create two new span elements with the 'token' class
          const newSpan1 = document.createElement('span');
          newSpan1.className = 'token';
          newSpan1.innerText = beforeText;

          const newSpan2 = document.createElement('span');
          newSpan2.className = 'token';
          newSpan2.innerText = afterText;

          // Replace the original span element with the two new span elements
          spanElement.parentNode.replaceChild(newSpan1, spanElement);

          // Move selection in between two new tokens for better UX
          selection.removeAllRanges()
          const range = document.createRange();
          range.setStart(newSpan1.firstChild, newSpan1.textContent.length); // Set the start of the range to the end of newSpan1
          selection.addRange(range); // Add the new range

          newSpan1.after(newSpan2);
        }
      }
    }
  };


  const handleSendToFastAPI = () => {
    const textBox = document.getElementById("textbox");
    const data = textBox.innerText;

    fetch("http://127.0.0.1:8000/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: data }), // send data as JSON object with key "data"
    })
      .then((response) => response.json())
      .then((data) => {
        let originalText = document.getElementById("textbox").innerText;
        let formattedText = "";
        let currentIndex = 0;

        data.forEach(tokenInfo => {
          // Add the text before the token
          formattedText += originalText.slice(currentIndex, tokenInfo.start);

          // Add the token as a span element
          formattedText +=
          `<span data-id="${tokenInfo.id}" data-pos="${tokenInfo.pos}" data-dependency="${tokenInfo.dependency}" class="token">${tokenInfo.text}</span>`;

          currentIndex = tokenInfo.end;
        });

        // Add any remaining text after the last token
        formattedText += originalText.slice(currentIndex);

        // Replace the original text with the formatted text
        document.getElementById("textbox").innerHTML = formattedText;

      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const addText = () => {
    textboxRef.current.innerText = "Here goes another mistake I know I'm going to make tonight. Even If I wanted to. If I was you.";
  };

  const handleMouseDown = (e) => {
    // When token is selected and user is in combining mode (actively holding CTRL + C) and decides to click on a different token, the .combine-target class won't be automatically removed from the previously selected token's combine targets. So we need to remove them manually

    const target = e.target;

    // // clear combining-target class from *soon to be* PREVIOUSLY SELECTED token
    const previousSibling = lastSelectedTokenRef.current?.previousElementSibling;
    if (previousSibling) {
      previousSibling.classList.remove("combine-target");
    }

    const nextSibling = lastSelectedTokenRef.current?.nextElementSibling;
    if (nextSibling) {
      nextSibling.classList.remove("combine-target");
    }

  };

  const handleMouseOver = (e) => {
      const target = e.target;
      if (target.tagName==="SPAN" && target.classList.contains("token") && !target.classList.contains("selected")) {
        target.classList.add("hovering");
      }
  };

  const handleMouseOut = (e) => {
    const target = e.target;
    if (target.tagName==="SPAN" && target.classList.contains("token")) {
      target.classList.remove("hovering");
    }
};

const mainContainerRef = useRef<HTMLDivElement>(null);

const handleClickOutside = (e: MouseEvent) => {

  if ( currentModeRef.current === "editTokenList") {
    return;
  }

  const target = e.target as HTMLElement;
  const selectedSpans = document.getElementsByClassName("selected")

  if (
    !(target.id === "textbox") &&
    !target.classList.contains('token') &&
    selectedSpans.length > 0
  ) {
    //Remove combining-target class if user was in combining mode
    if (IscombiningModeEngaged.current) {
      const selectedToken = document.getElementsByClassName("selected")[0];
      if (selectedToken) {
        const prevToken = selectedToken.previousElementSibling;
        const nextToken = selectedToken.nextElementSibling;
        if (prevToken && prevToken.classList.contains("combine-target")) {
          prevToken.classList.remove("combine-target");
        }
        if (nextToken && nextToken.classList.contains("combine-target")) {
          nextToken.classList.remove("combine-target");
        }

        IscombiningModeEngaged.current = false;
      }
    }

    // remove .selected class from all selected tokens
    const selectedSpans = document.getElementsByClassName("selected");
    for (let i = 0; i < selectedSpans.length; i++) {
      selectedSpans[i].classList.remove("selected");
    }
  }


};


useEffect(() => {
  document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);

const handlehighlightNeighbours = (e) => {
  const selectedToken = document.getElementsByClassName("selected")[0];
  if (selectedToken) {
    const prevToken = selectedToken.previousElementSibling;
    const nextToken = selectedToken.nextElementSibling;
    if (prevToken) {
      prevToken.classList.add("combine-target");
    }
    if (nextToken) {
      nextToken.classList.add("combine-target");
    }
  }
  IscombiningModeEngaged.current = true;
}

const handleRemoveHighlightedNeighbours = (e) => {
  const selectedToken = document.getElementsByClassName("selected")[0];
  if (selectedToken) {
    const prevToken = selectedToken.previousElementSibling;
    const nextToken = selectedToken.nextElementSibling;
    if (prevToken && prevToken.classList.contains("combine-target")) {
      prevToken.classList.remove("combine-target");
    }
    if (nextToken && nextToken.classList.contains("combine-target")) {
      nextToken.classList.remove("combine-target");
    }
  }
  IscombiningModeEngaged.current = false;
}

useEffect(() => {
  // Bug -> Without this code, when user changes tab or right-clicks on another token WHILE still holding CTRL + C (combiningMode), the previous and next tokens of the selected token would not get cleared of the .combining-target class.
  const handleBlur = () => {
    const prevToken = document.querySelector('.combine-target');
    if (prevToken) {
      prevToken.classList.remove('combine-target');
    }
    const nextToken = document.querySelector('.combine-target');
    if (nextToken) {
      nextToken.classList.remove('combine-target');
    }
    IscombiningModeEngaged.current = false;
  };

  const handleContextMenu = (e) => {
    const selectedToken = document.querySelector('.selected');
    const tokens = document.querySelectorAll('.token');

    tokens.forEach((token) => {
      if (token !== selectedToken) {
        token.classList.remove('combine-target');
      }
    });

    IscombiningModeEngaged.current = false;
  };

  window.addEventListener('blur', handleBlur);
  document.addEventListener('contextmenu', handleContextMenu);

  return () => {
    window.removeEventListener('blur', handleBlur);
    document.removeEventListener('contextmenu', handleContextMenu);
  };
}, []);

const handleCombining = (side: 'left' | 'right') => {
  if (side === 'left') {
    const selectedToken = document.getElementsByClassName("selected")[0];
    const prevToken = selectedToken.previousElementSibling;


    // add text from token being merged to the selected token
    const formattedText = (prevToken as HTMLElement).innerText + (selectedToken as HTMLElement).innerText;
    (selectedToken as HTMLElement).innerText = formattedText;

    // remove token being merged
    (prevToken as HTMLElement).remove();

    const newPrevToken = selectedToken.previousElementSibling;
    newPrevToken.classList.add("combine-target");

    } else {
    const selectedToken = document.getElementsByClassName("selected")[0];
    const nextToken = selectedToken.nextElementSibling;


    // add text from token being merged to the selected token
    (selectedToken as HTMLElement).innerText += (nextToken as HTMLElement).innerText;

    // remove token being merged
    (nextToken as HTMLElement).remove();

    const newNextToken = selectedToken.nextElementSibling;
    newNextToken.classList.add("combine-target");
    }
}

  return (
    <>
      <div
      className="main-container flex flex-col justify-center items-center w-full h-full mt-10"
      ref={mainContainerRef}
      >
        <div
        id="textbox"
        ref={(node) => (textboxRef.current = node)}
        contentEditable
        className="border-1 border-orange-100 p-14 w-1/2 mb-10 focus:outline-0 text-3xl"
        onKeyDownCapture={(e: React.KeyboardEvent) => {
          if (currentMode !== "editToken") {
            return;
          }

          if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            handleSplitting(e);
          } else if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            handlehighlightNeighbours(e);
            isCTRLPressed.current = true;
          }

          if (IscombiningModeEngaged.current) {
            e.preventDefault()

            switch (e.key) {
              case 'ArrowLeft':
                handleCombining('left');
                break;
              case 'ArrowRight':
                handleCombining('right');
                break;
            }
          }
        }}
        onKeyUpCapture={(e) => {
          const firstCondition = e.ctrlKey && e.key === 'c';
          const secondCondition = e.key === 'c' && e.ctrlKey;
          if (firstCondition || secondCondition) {
            e.preventDefault();
          }
          if (currentMode === "editToken") {
            if ((isCTRLPressed && e.key === 'c') ) {
              handleRemoveHighlightedNeighbours(e);
              isCTRLPressed.current = false;
            }
          }
        }}
        onMouseDown={(e) => {
          if (currentModeRef.current === "editToken") {
            handleMouseDown(e);
          }
        }}
        onMouseOver={(e) => {
          if (currentModeRef.current === "editToken") {
            handleMouseOver(e);
          }
        }}
        onMouseOut={(e) => {
          const target = e.target as Element;

          if (target.tagName==="SPAN" && target.classList.contains("token")) {
            if (currentModeRef.current === "editToken") {
              handleMouseOut(e);
            }
          }
          
        }}
        >
        </div>
        <div
        className="flex justify-between w-1/2"
        >
          <button
          className="text-sm p-1 border-1 border-orange-100 hover:bg-purple-900 px-2"
          onClick={addText}
          >
            Paste
          </button>
          <button
          className="text-sm p-1 border-1 border-orange-100 hover:bg-purple-900 px-2"
          onClick={handleSendToFastAPI}
          >
            Scan
          </button>
          <button
          className={`text-sm p-1 border-1 border-orange-100 hover:bg-purple-900 px-2 ${currentMode === 'editTokenList' ? 'bg-purple-900' : ''}`}
          onClick={() => {
            switch (currentMode) {
              case "editTokenList":
                setCurrentMode("select");
                const textbox =document.querySelector("#textbox")
                const selectedSpans = textbox.querySelectorAll(".selected")
                selectedSpans.forEach((span) => {
                  span.classList.remove("selected")
                })
                break;
              case "editToken":
                setCurrentMode("editTokenList");
                break;
              case "select":
                setCurrentMode("editTokenList");
                break;
              case null:
                setCurrentMode("editTokenList");
                break;
            };
          }}
          >
            Edit token Lists
          </button>
          <button
          className={`text-sm p-1 border-1 border-orange-100 hover:bg-purple-900 px-2 ${currentMode === 'editToken' ? 'bg-purple-900' : ''}`}
          onClick={() => {
            switch (currentMode) {
              case "editTokenList":
                setCurrentMode("editToken");
                break;
              case "editToken":
                setCurrentMode("select");
                break;
              case "select":
                setCurrentMode("editToken");
                break;
              case null:
                setCurrentMode("editToken");
                break;
            };
          }}
          >
            Edit tokens
          </button>
        </div>
        <div
        id="tokenData"
        className="w-1/2 mt-10"
        ></div>
        <div>Selection: {selection ? selection.toString() : 'None'}</div>
      <div>Range Count: {rangeCount}</div>
      <div>Range Position: {rangePosition}</div>
      <div>Selected Text: {selectedText}</div>
      </div>
    </>
  );
};

export default TextAnalyzer;