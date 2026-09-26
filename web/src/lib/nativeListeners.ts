interface NativeListenerHandle {
  remove(): Promise<void>;
}

/** React cleanup may run before asynchronous native registration finishes. */
export function manageNativeListener(
  pending: Promise<NativeListenerHandle>,
  onError?: () => void,
): () => void {
  let disposed = false;
  let handle: NativeListenerHandle | undefined;
  const reportError = () => {
    try {
      onError?.();
    } catch {
      // Error reporting must not create a new unhandled listener rejection.
    }
  };
  const remove = () => {
    const registered = handle;
    handle = undefined;
    if (!registered) return;
    try {
      void registered.remove().catch(reportError);
    } catch {
      reportError();
    }
  };
  void pending.then((registered) => {
    handle = registered;
    if (disposed) remove();
  }, reportError);
  return () => {
    disposed = true;
    remove();
  };
}
