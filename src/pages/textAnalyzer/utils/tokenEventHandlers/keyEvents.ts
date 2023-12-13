export const handleSplitting = (e) => {

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

export const handleCombining = (side: 'left' | 'right') => {
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

export const handlehighlightNeighbours = (IscombiningModeEngaged) => {
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

export const handleRemoveHighlightedNeighbours = (e, IscombiningModeEngaged) => {
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