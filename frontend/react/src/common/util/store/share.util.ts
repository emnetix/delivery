export const createShareInKey = <T, P = never>(initData: (id: string, params?: P) => T, getKey: () => string) => {
  const contextRecord: Record<string, T> = {};
  return (params: P): T => {
    const key = getKey();
    let context: T | undefined = contextRecord[key];
    if (!context) {
      contextRecord[key] = context = initData(key, params);
    }
    return context;
  };
};

export const createShare = <T, P = never>(initData: (key: string|undefined, params: P) => T) => {
  const contextRecord: Record<string, T> = {};
  return  (key: string | undefined, params?: P): T => {
    // const key = getKey();
    if(!key) {
      return initData(key, params as P);
    }
    let context: T | undefined = contextRecord[key];
    if (!context) {
      contextRecord[key] = context = initData(key, params as P);
    }
    return context;
  };
};