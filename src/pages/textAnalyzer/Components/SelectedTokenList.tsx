const SelectedTokenList = (selectedTokenList) => {
  return (
    <div className="border-1 bg-violet-700 p-4 text-base">
      <h1>Tokens in token list:</h1>
      {selectedTokenList && selectedTokenList.length > 0 ? (
        <ul>
          {selectedTokenList.map((token, i) => (
            <li key={i}>{token.innerHTML}</li>
          ))}
        </ul>
      ) : (
        <p>No tokens found.</p>
      )}
    </div>
  );
};

export default SelectedTokenList;
