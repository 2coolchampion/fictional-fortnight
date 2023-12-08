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
