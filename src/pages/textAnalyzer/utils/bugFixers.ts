export const handleBlur = (IscombiningModeEngaged) => {
  if (IscombiningModeEngaged.current === false) return;
  const prevToken = document.querySelector('.combine-target');
  if (prevToken) {
    prevToken.classList.remove('combine-target');
  }
  const nextToken = document.querySelector('.combine-target');
  if (nextToken) {
    nextToken.classList.remove('combine-target');
  }
  IscombiningModeEngaged.current = false;
}

export const handleContextMenu = (IscombiningModeEngaged) => {
  if (IscombiningModeEngaged.current === false) return;
  const selectedToken = document.querySelector('.selected');
  const tokens = document.querySelectorAll('.token');

  tokens.forEach((token) => {
    if (token !== selectedToken) {
      token.classList.remove('combine-target');
    }
  });

  IscombiningModeEngaged.current = false;
}