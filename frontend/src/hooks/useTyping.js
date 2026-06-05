import { useState, useEffect } from "react";

export function useTyping(text, active) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  
  useEffect(() => {
    if (!active) { 
      setDisplayed(""); 
      setDone(false); 
      return; 
    }
    setDisplayed(""); 
    setDone(false);
    
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { 
        clearInterval(id); 
        setDone(true); 
      }
    }, 18);
    
    return () => clearInterval(id);
  }, [text, active]);
  
  return { displayed, done };
}