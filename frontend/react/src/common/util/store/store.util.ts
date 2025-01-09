import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { equals } from "../index.util";


type Store<T> = {
  get: () => T,
  set: (newValue: T) => void,
  subscribe: (fn: Dispatch<T>) => (() => void)
}
export type State<T> = [T, Dispatch<SetStateAction<T>>];
export type AttrsToStates<T extends object> = { [K in keyof T]: State<T[K]> };
export type AttrsToGetterSetter<T extends object> = {
  getter: { [K in keyof T]: State<T[K]>[0] };
  setter: { [K in keyof T]: State<T[K]>[1] };
}

export const createStore = <T>(initialValue: T): Store<T> => {
  let _value = initialValue;
  const subscribers = new Set<Dispatch<T>>();

  return {
    get: () => _value,
    set: (newValue: T, debug?: unknown) => {
      if (debug) {
        console.debug(`[CREATE_STORE]SET-[${debug}]`, [_value, newValue]);
      }
      _value = newValue;
      subscribers.forEach(fn => fn(_value))
    },
    subscribe: (fn: Dispatch<T>) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    }
  }
}

export const useStore = <T>(store: Store<T>, debug?: unknown): [T, Dispatch<SetStateAction<T>>] => {
  const [status, setStatus] = useState(store.get());
  const setValue = (dispatch: SetStateAction<T>) => {
    // console.log(`[USE_STORE] CUSTOM SET [${debug}]`, dispatch);
    if (dispatch && typeof dispatch === 'function' ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      store.set((dispatch as any)(status) as T);
    } else {
      store.set(dispatch as T);
    }
  }
  // console.log('[USE_STORE]', store.get());
  useEffect(() => {
    const unsubscribe = store.subscribe(setStatus);
    if (debug) {
      console.debug(`[USE_STORE]EFFECT-[${debug}]`, [status, store.get()], );
    }
    if (!equals(status, store.get())) {
      setStatus(store.get());
    //   store.set(store.get(), `${test}_EFFECT [[${value}, ${store.get()}]]`);
    }
    return unsubscribe;
  }, [status])

  return [status, setValue];
}
