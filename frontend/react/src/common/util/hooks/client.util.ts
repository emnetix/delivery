
// const createUseDocument = () => {
//   const resizeStore = createStore<Resize|undefined>(undefined);
//   const getContext = createShare()
//   const predict = () => {
//     console.log('...?');
//   }
//   return () => {
//     const [] = useStore(resizeStore);
//     useEffect(() => {
//       document.addEventListener('resize', predict);
//       return () => {
//         document.removeEventListener('resize', predict);
//       }
//     }, [window])
//   }
// }

// export const useDocument = createUseDocument();

