import { ManagerOptions, SocketOptions, io } from "socket.io-client";
import { createStore, useStore } from "../store/store.util";
import { useEffect } from "react";

type Status = 'WAITING' | 'INITIALIZING' | 'SUCCESS' | 'ERROR';

export const createUseSocket = (url: string, options?: Partial<ManagerOptions & SocketOptions>) => {
  const autoConnect = options?.autoConnect;
  const socket = io(url, options);
  let isMounted = false;

  // let status: Status = 'WAITING';
  const useStatus = createStore<Status>('WAITING');
  const onInitializing = () => useStatus.set('INITIALIZING');
  const onSuccess = () => useStatus.set('SUCCESS');
  const onError = () => useStatus.set('ERROR');
  const onWaiting = () => useStatus.set('WAITING');
  const init = () => {
    // onInitializing(setStatus);
    onInitializing();
    socket.connect();
  }
  const destroy = () => {
    onWaiting();
    // onWaiting(setStatus);
    socket.disconnect();
  }

  socket.on('connect', onSuccess);
  socket.on('reconnect', onSuccess);
  socket.on('connect_error', onError);
  socket.on('reconnect_failed', onError);
  socket.on('connecting', onInitializing);
  socket.on('reconnect_attempt', onInitializing);
  socket.on('disconnect', onWaiting);
  
  return () => {
    const [status] = useStore(useStatus);
    let listenerRecord: Record<string, (msg: never) => void> = {};
    // const beforeListenerRecord = usePrevious(listenerRecord);

    if (!isMounted) {
      isMounted = true;
      if ( useStatus.get() === 'WAITING' && (autoConnect === undefined || autoConnect)) {
        onInitializing();
      }
    }
    const release = () => { if (useStatus.get() === 'SUCCESS') destroy(); };

    const useOn = <T>(path: string, predict: (msg: T) => void) => {
      listenerRecord = { ...listenerRecord, [path]: predict };
    }

    useEffect(() => {
      if (status === 'SUCCESS') {
        Object.keys(listenerRecord).forEach((k) => {
          const predict = listenerRecord[k];
          socket.on(k, predict as never)
        });
        // console.log('[INIT]', socket.listeners());
      }
      return () => {
        // console.log('[RELEASE]', listenerRecord);
        Object.keys(listenerRecord).forEach((k) => {
          const predict = listenerRecord[k];
          socket.off(k, predict as never);
        })
      }
    }, [status, listenerRecord])
    
    return {
      socket,
      status: status as Readonly<typeof status>,
      init: () => {
        if (useStatus.get() !== 'WAITING') return release;

        init();

        return release;
      },
      release,
      useOn,
    }
  }
}


export const SOCKET_ENT = {
  SET_ID: (id: string) => ({
    path: 'set-id',
    data: { type: 'set-id', id }
  }),
  SEND_DATA: (from: string, to: string, data: unknown) => ({
    path: 'delivery',
    data: { from, to, payload: data }
  }),
  ON_DELIVERY: 'delivery'
};

// export const useSocket = createUseSocket('http://192.168.220.11:8000', { transports: ['websocket'], timeout: 7000, autoConnect: false, path: '/api/v1/ws/ent02delivery'});
// export const useSocket = createUseSocket('wss://delivery.emnetix.net', { transports: ['websocket'], timeout: 7000, autoConnect: false, path: '/api/v1/ws/ent02delivery'});
export const useSocket = createUseSocket('wss://test-delivery.emnetix.net', { transports: ['websocket'], timeout: 7000, autoConnect: false, path: '/api/v1/ws/ent02delivery'});
