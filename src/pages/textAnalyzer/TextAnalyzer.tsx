import { useState } from "react";
import attachEventHandlers from "./tokenEventHandlers";

const TextAnalyzer = () => {

  const [IsContentEditable, setContentEditable] = useState(true)
  const [splitMode, setSplitMode] = useState(false);
  const [combineMode, setCombineMode] = useState(false);

  const handleSendToFastAPI = () => {
    const textBox = document.getElementById("textbox");
    const data = textBox.innerText;

    console.log('this is data being sent: ', data);

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
          `<span 
            data-pos="${tokenInfo.pos}" 
            data-dependency="${tokenInfo.dependency}" 
            class="token hover:bg-green-400">
            ${tokenInfo.text}
          </span>`;
    
          currentIndex = tokenInfo.end;
        });

        // disable editing of text
        setContentEditable(false);
    
        // Add any remaining text after the last token
        formattedText += originalText.slice(currentIndex);
    
        // Replace the original text with the formatted text
        document.getElementById("textbox").innerHTML = formattedText;

        // Attach event handlers
        attachEventHandlers();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleSplitMode = () => {
    setSplitMode(!splitMode);
    setCombineMode(false);
  };

  const handleCombineMode = () => {
    setCombineMode(!combineMode);
    setSplitMode(false);
  };

  return (
    <>
      <div 
      className="flex flex-col justify-center items-center w-full h-full mt-10"
      >
        <div 
        id="textbox"
        contentEditable={IsContentEditable}
        className="border-1 border-black p-14 w-1/2 mb-10"

        >
        </div>
        <div
        className="flex justify-between w-1/2"
        >
          <button 
          className="text-sm p-1 border-1 border-black hover:bg-gray-200"
          onClick={handleSendToFastAPI}
          >send to FastAPI
          </button>
          <button
          className="text-sm p-1 border-1 border-black hover:bg-gray-200"
          onClick={handleSplitMode}
          >Split
          </button>
          <button
          className="text-sm p-1 border-1 border-black hover:bg-gray-200"
          onClick={handleCombineMode}
          >Combine
          </button>
        </div>
        <div
        id="tokenData"
        className="w-1/2 mt-10"
        ></div>
      </div>
    </>
  );
};

export default TextAnalyzer;