import { useCallback, useEffect, useRef, useState } from "react";
import handleSendToFastAPI from "./utils/api";
import { handleSelection, handleMultiSelect } from "./utils/tokenEventHandlers/handleTokenSelection";
import { handleCombining, handleRemoveHighlightedNeighbours, handleSplitting, handlehighlightNeighbours } from "./utils/tokenEventHandlers/keyEvents";
import { handleBlur, handleContextMenu } from "./utils/bugFixers";
import { handleClickOutside, handleMouseDown } from "./utils/tokenEventHandlers/mouseEvents";
import SelectionDebugger from "./Components/SelectionDebugger";

const TextAnalyzer = () => {
  
  const [currentMode, setCurrentMode] = useState<'select' | 'editToken' | 'editTokenList' | null>('select');
  const currentModeRef = useRef<'select' | 'editToken' | 'editTokenList' | null>(currentMode); // This is necessary for the handleSelection eventHandler since value of currentMode state variable is enclosed in the scope of the handleSelection function, and it doesn't get updated when currentMode changes because the function retains a reference to the original value of currentMode from when it was first created. Refs provide a way to persist values across renders without triggering a re-render themselves.
  
  const [selectedTokenList, setSelectedTokenList] = useState<Element[] | null>([]);
  
  let lastSelectedTokenRef = useRef(null)
  let IscombiningModeEngaged = useRef(false)
  let isCTRLPressed = useRef(false)
  
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

  useEffect(() => {
    currentModeRef.current = currentMode;
  }, [currentMode]);

  const handleSingleTokenSelection = useCallback((e) => {
    handleSelection( e, currentModeRef, selectedTokenList, setSelectedTokenList );
    if (currentMode !== 'editTokenList') return;

    // console.log(selectedTokenList)
  }, [currentMode, selectedTokenList]);

  // console.log('two: ',selectedTokenList)

  const handleMultiTokenSelection = useCallback((e) => {
    if (currentMode !== 'editTokenList') return;
    handleMultiSelect( selectedTokenList, setSelectedTokenList );
  }, [currentMode, selectedTokenList]);
  

  useEffect(() => {
    document.addEventListener('selectionchange', handleSingleTokenSelection);
    document.addEventListener('mouseup', handleMultiTokenSelection);

    return () => {
      document.removeEventListener('selectionchange', handleSingleTokenSelection);
      document.removeEventListener('mouseup', handleMultiTokenSelection);
    }
  }, [handleSingleTokenSelection, handleMultiTokenSelection])

  const addText = () => {
    textboxRef.current.innerText = "Here goes another mistake I know I'm going to make tonight. Even If I wanted to. If I was you.";
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
 
  const handleClickOutsideWrapepr = useCallback(
    (e) => {
      handleClickOutside(e, currentModeRef, IscombiningModeEngaged);
    }, []
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutsideWrapepr);

        return () => {
          document.removeEventListener('mousedown', handleClickOutsideWrapepr);
        };
    }, []);

  useEffect(() => {
    // Bug Fix -> Without this code, when user changes tab or right-clicks on another token WHILE STILL HOLDING CTRL + C 🤦 (in combiningMode), the previous and next tokens of the selected token .combining-target class wouldn't be removed.

    const blurHandler = () => handleBlur(IscombiningModeEngaged);
    const contextMenuHandler = (e) => handleContextMenu(IscombiningModeEngaged);
  
    window.addEventListener('blur', blurHandler);
    document.addEventListener('contextmenu', contextMenuHandler);
  
    return () => {
      window.removeEventListener('blur', blurHandler);
      document.removeEventListener('contextmenu', contextMenuHandler);
    };
  }, []);

  return (
    <>
      <div
      className="main-container flex flex-col justify-center items-center w-full h-full mt-10"
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
            handlehighlightNeighbours(IscombiningModeEngaged);
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
              handleRemoveHighlightedNeighbours(e, IscombiningModeEngaged);
              isCTRLPressed.current = false;
            }
          }
        }}
        onMouseDown={(e) => {
          if (currentModeRef.current === "editToken") {
            handleMouseDown(e, lastSelectedTokenRef);
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
                });
                setSelectedTokenList([]);
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
        <SelectionDebugger />
      </div>
      <div>
        <h1>Tokens in token list:</h1>
        {selectedTokenList && selectedTokenList.length > 0 ? (
          <ul>
            {selectedTokenList.map((token, i) => (
              <li key={i}>{token.innerHTML}</li>
            ))}
          </ul>
        ) : (
          <p>No tokens found.</p>
        )}
      </div>
    </>
  );
};

export default TextAnalyzer;