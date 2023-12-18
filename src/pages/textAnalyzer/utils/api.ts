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

      data.forEach((tokenInfo) => {
        // Add the text before the token
        formattedText += originalText.slice(currentIndex, tokenInfo.start);

        // Add the token as a span element
        formattedText += `<span data-id="${tokenInfo.id}" data-pos="${tokenInfo.pos}" data-dependency="${tokenInfo.dependency}" class="token">${tokenInfo.text}</span>`;

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

export default handleSendToFastAPI;
