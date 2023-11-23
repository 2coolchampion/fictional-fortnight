import { useEffect, useRef, useState } from "react";
import { handleSplit } from "./tokenEventHandlers";
import { getEventListeners } from "events";

const TextAnalyzer = () => {

  const [currentMode, setCurrentMode] = useState("select");

  const [selection, setSelection] = useState<Selection | null>(null);
  const [rangeCount, setRangeCount] = useState<number>(0);
  const [rangePosition, setRangePosition] = useState<number>(0);
  const [selectedText, setSelectedText] = useState<string>('');

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

  let textboxRef = useRef(null); 
  
  // initialized textboxRef on componentDidMount since textbox is not available on componentHasRendered on first mount.

  useEffect(() => {
    const textboxElement = document.getElementById("textbox");
    textboxRef.current = textboxElement;
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
          console.log('first child of newSpan1', newSpan1.firstChild)
          range.setStart(newSpan1.firstChild, newSpan1.textContent.length); // Set the start of the range to the end of newSpan1
          range.setEnd(newSpan1.firstChild, 0); // Set the end of the range to the start of newSpan2
          selection.addRange(range); // Add the new range

          newSpan1.after(newSpan2);
        }
      }
    }
  };

  const handleCombining = () => {
      }

  // add class to token on hover and move selection inbetween split tokens. Or change inserting ebhaviour.

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

  useEffect

  const handleClick = (e) => {
      const target = e.target;
      if (target.tagName==="SPAN" && target.classList.contains("token")) {
        target.classList.add("selected");
        if (target.classList.contains("hovering")) {
          target.classList.remove("hovering");
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
      target.classList.remove('selected');
    }
};

  const handleEditClick = () => {
    // Enable the editing functionality
    textboxRef.current.contentEditable = true;
    textboxRef.current.focus();
  };

  return (
    <>
      <div 
      className="flex flex-col justify-center items-center w-full h-full mt-10"
      >
        <div 
        id="textbox"
        ref={(node) => (textboxRef.current = node)}
        contentEditable={false} // Disable editing initially
        className="border-1 border-orange-100 p-14 w-1/2 mb-10 focus:outline-0"
        onKeyDown={ (e) => {
            if (e.ctrlKey && e.key === 's') {
              e.preventDefault();
            if (currentMode === "edit") {
              handleSplitting(e);
              // handleCombining(e)
            }
            }
            
          }
        }
        onClick={(e) => {
          if (currentMode === "edit") {
            handleClick(e);
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
            currentMode === "select" ? setCurrentMode("edit") : setCurrentMode("select");
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