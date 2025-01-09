import { useEffect, useRef } from "react"


export const usePrevious = <T>(value: T) => {
  const valRef = useRef<T>();
  useEffect(() => {    
    return () => {
      valRef.current = value
    };
  })
  return valRef.current;
}