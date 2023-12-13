import { useEffect, useState } from "react";

const SelectionDebugger = () => {

  const [selection, setSelection] = useState<Selection | null>(null);
  const [rangeCount, setRangeCount] = useState<number>(0);
  const [rangePosition, setRangePosition] = useState<number>(0);
  const [selectedText, setSelectedText] = useState<string>('');

  useEffect(() => {

    //display some live-data for debugging purposes
    const handleSelectionChange = () => {
      const newSelection = window.getSelection();
      setSelection(newSelection);
      setRangeCount(newSelection?.rangeCount || 0);
      if (newSelection && newSelection.rangeCount > 0) {
        const range = newSelection.getRangeAt(0);
        setRangePosition(range.startOffset);
        setSelectedText(range.toString());
      } else {
        setRangePosition(0);
        setSelectedText('');
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  return (
    <div className="bg-violet-700 p-4 text-base border-1">
      <div>Selection: {selection ? selection.toString() : 'None'}</div>
      <div>Range Count: {rangeCount}</div>
      <div>Range Position: {rangePosition}</div>
      <div>Selected Text: {selectedText}</div>
    </div>
  )
}

export default SelectionDebugger