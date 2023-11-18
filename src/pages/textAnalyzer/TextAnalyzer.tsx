

const TextAnalyzer = () => {

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
        console.log(data.processed_data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <>
      <div 
      className="flex flex-col justify-center items-center w-full h-full mt-10"
      >
        <div 
        id="textbox"
        contentEditable
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
          >Manual mode
          </button>
        </div>
      </div>
    </>
  );
};

export default TextAnalyzer;