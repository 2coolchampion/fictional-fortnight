const attachEventHandlers = () => {
  const tokens = document.querySelectorAll(".token");

  tokens.forEach((token: HTMLElement) => {
    // Add event listener to each token to display token data on click
    token.addEventListener("click", (event) => {

        const target = event.target as Element;
        const pos = target.getAttribute('data-pos');
        const dependency = target.getAttribute('data-dependency');
        document.getElementById('tokenData').innerText = `POS: ${pos}, Dependency: ${dependency}`;
    });
});
};

const enableSplitMode = () => {
  const tokens = document.querySelectorAll(".token");

  tokens.forEach((token: HTMLElement) => {
    
  });
}
export default attachEventHandlers;