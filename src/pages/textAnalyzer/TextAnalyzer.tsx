import { useEffect, useRef, useState } from "react";
import { getEventListeners } from "events";

const TextAnalyzer = () => {

  const [currentMode, setCurrentMode] = useState("select");

  const [selection, setSelection] = useState<Selection | null>(null);
  const [rangeCount, setRangeCount] = useState<number>(0);
  const [rangePosition, setRangePosition] = useState<number>(0);
  const [selectedText, setSelectedText] = useState<string>('');
  let lastSelectedTokenRef = useRef(null)
  const useSelectionCountRef = useRef(0);

  useEffect(() => {
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

 
  // --- --- ---

  let textboxRef = useRef<HTMLDivElement>(null); 
  
  // initialized textboxRef on componentDidMount since textbox is not available on componentHasRendered on first mount.

  useEffect(() => {
    const textboxElement = document.getElementById("textbox");
    textboxRef.current = textboxElement as HTMLDivElement;
    if (textboxRef.current) {
      textboxRef.current.focus();
    }
  }, []);
  
  // --- --- ---

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
          `<span data-pos="${tokenInfo.pos}" data-dependency="${tokenInfo.dependency}" class="token">${tokenInfo.text}</span>`;
    
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
    const target = e.target;

    // add selected class
    if (target.tagName==="SPAN" && target.classList.contains("token")) {
      target.classList.add("selected");
      
      if (target.classList.contains("hovering")) {
        target.classList.remove("hovering");
      };
      lastSelectedTokenRef.current = target;
      useSelectionCountRef.current += 1;
    };

    if (useSelectionCountRef.current > 1 ) {
      //find other selected tags and remove them.
      const selectedTags = document.getElementsByClassName("selected");
      for (let i = 0; i < selectedTags.length; i++) {
        if (selectedTags[i] !== target) {
          selectedTags[i].classList.remove("selected");
        }
      }

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
  const target = e.target as HTMLElement;

  if (
    !(target.id === "textbox") &&
    !target.classList.contains('token')
  ) {
    const selectedTags = document.getElementsByClassName("selected");
    for (let i = 0; i < selectedTags.length; i++) {
      selectedTags[i].classList.remove("selected");
    }
  }
};

useEffect(() => {
  document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
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
}

const handleRemoveHighlightedNeighbours = (e) => {
  const selectedToken = document.getElementsByClassName("selected")[0];
  if (selectedToken) {
    const prevToken = selectedToken.previousElementSibling;
    const nextToken = selectedToken.nextElementSibling;
    if (prevToken) {
      prevToken.classList.remove("combine-target");
    }
    if (nextToken) {
      nextToken.classList.remove("combine-target");
    }
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
        onKeyDown={ (e) => {
          if (currentMode !== "edit") {
            return
          }

          if (e.ctrlKey && e.key === 's') {

            e.preventDefault();
              handleSplitting(e);
          } else if (e.ctrlKey && e.key === 'c') {

            e.preventDefault();
            handlehighlightNeighbours(e);
            // TODO !!!
            // merges the selected token with the sibling next to it

            // if (e.key === 'leftArrow') {
            //   handleLeftCombine();
            // }
            // if (e.key === 'rightArrow') {
            //   handleRightCombine();
            }
            
          }
        }
        onKeyUp={(e) => {
          if (currentMode !== "edit") {
            return
          }

          if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            handleRemoveHighlightedNeighbours(e);
          }
        }}
        onMouseDown={(e) => {
          if (currentMode === "edit") {
            handleMouseDown(e);
          }
        }}
        onMouseOver={(e) => {
          if (currentMode === "edit") {
            handleMouseOver(e);
          }
        }}
        onMouseOut={(e) => {
          if (currentMode === "edit") {
            handleMouseOut(e);
          }
        }}
        >
        </div>
        <div
        className="flex justify-between w-1/2"
        >
          <button
          className="text-sm p-1 border-1 border-orange-100 hover:bg-yellow-800 px-2"
          onClick={addText}
          >
            Paste
          </button>
          <button 
          className="text-sm p-1 border-1 border-orange-100 hover:bg-yellow-800 px-2"
          onClick={handleSendToFastAPI}
          >
            Scan
          </button>
          <button 
          className="text-sm p-1 border-1 border-orange-100 hover:bg-yellow-800 px-2"
          onClick={() => {
            if (currentMode === "select") {
              setCurrentMode("edit") ;
            } else {
              setCurrentMode("select")

            }
          }}
          >
            {currentMode === "select" ? "Current mode: select" : "Current mode: edit"}
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