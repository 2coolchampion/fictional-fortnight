export const handleMouseDown = (e, lastSelectedTokenRef) => {
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

export const handleClickOutside = (
  e: MouseEvent,
  currentModeRef,
  IscombiningModeEngaged
) => {
  if (currentModeRef.current === "editTokenList") {
    return;
  }

  const target = e.target as HTMLElement;
  const selectedSpans = document.getElementsByClassName("selected");

  if (
    !(target.id === "textbox") &&
    !target.classList.contains("token") &&
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
