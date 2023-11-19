const attachEventHandlers = () => {
  const tokenList = document.querySelectorAll(".token");
  tokenList.forEach((token: HTMLElement) => {

    token.addEventListener("click", (event) => {

      const target = event.target as Element;
      const pos = target.getAttribute('data-pos');
      const dependency = target.getAttribute('data-dependency');
      document.getElementById('tokenData').innerText = `POS: ${pos}, Dependency: ${dependency}`;
    });
    
  });
};

export default attachEventHandlers;

      