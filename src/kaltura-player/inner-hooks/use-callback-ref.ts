// inspired by https://github.com/theKashey/use-callback-ref
import {MutableRefObject, useEffect, useRef, useState} from 'react';

type Callback = () => void | (() => void);

export function useCallbackRef<T>(
  initialValue: T | null,
  callback: Callback,
): MutableRefObject<T | null> {

  const unMountedRef = useRef(false);

  const [ref] = useState<{
    value: T | null,
    onDestroy: null | (() => void),
    callback: Callback,
    facade: any,
  }>(() => ({
    value: initialValue,
    onDestroy: null,
    callback,
    // "memoized" public interface
    facade: {
      get current() {
        return ref.value;
      },
      set current(value) {
        if (unMountedRef.current) {
          return;
        }

        const last = ref.value;

        executeOnDestroy();

        ref.onDestroy = null;

        if (last !== value) {
          ref.value = value;
          ref.onDestroy = ref.callback() || null;
        }
      }
    }
  }));

  function executeOnDestroy() {
    const onDestroy = ref.onDestroy;
    ref.onDestroy = null;

    if (!onDestroy) {
      return;
    }
    onDestroy();
  }


  // update callback
  ref.callback = callback;


  useEffect(() => {
    if (ref.callback) {
      ref.onDestroy = ref.callback() || null
    }

    return () => {
      unMountedRef.current = true;

      if (!ref.onDestroy) {
        return;
      }

      executeOnDestroy();
      ref.value = null;
    }
  }, []);

  return ref.facade;
}
