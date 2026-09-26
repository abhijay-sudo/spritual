import assert from "node:assert/strict";
import test from "node:test";
import { manageNativeListener } from "../web/src/lib/nativeListeners.ts";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

type Handle = { remove(): Promise<void> };
const nextTurn = () => new Promise<void>((resolve) => setImmediate(resolve));

test("cleanup before registration resolves removes the late listener once", async () => {
  const pending = deferred<Handle>();
  let removed = 0;
  const cleanup = manageNativeListener(pending.promise);
  cleanup();
  cleanup();
  assert.equal(removed, 0);
  pending.resolve({
    async remove() {
      removed++;
    },
  });
  await nextTurn();
  assert.equal(removed, 1);
  cleanup();
  assert.equal(removed, 1);
});

test("resolved registration stays active until cleanup and removal preserves its receiver", async () => {
  const handle = {
    removed: 0,
    async remove() {
      this.removed++;
    },
  };
  const cleanup = manageNativeListener(Promise.resolve(handle));
  await nextTurn();
  assert.equal(handle.removed, 0);
  cleanup();
  cleanup();
  await nextTurn();
  assert.equal(handle.removed, 1);
});

test("StrictMode's old cleanup cannot dispose a newer registration", async () => {
  const old = deferred<Handle>();
  let oldRemoved = 0;
  let currentRemoved = 0;
  const oldCleanup = manageNativeListener(old.promise);
  oldCleanup();
  const currentCleanup = manageNativeListener(
    Promise.resolve({
      async remove() {
        currentRemoved++;
      },
    }),
  );
  old.resolve({
    async remove() {
      oldRemoved++;
    },
  });
  await nextTurn();
  oldCleanup();
  assert.equal(oldRemoved, 1);
  assert.equal(currentRemoved, 0);
  currentCleanup();
  await nextTurn();
  assert.equal(currentRemoved, 1);
});

test("registration rejection is handled after cleanup and reports only once", async () => {
  const pending = deferred<Handle>();
  let errors = 0;
  const cleanup = manageNativeListener(pending.promise, () => errors++);
  cleanup();
  pending.reject(new Error("Registration unavailable"));
  await nextTurn();
  cleanup();
  assert.equal(errors, 1);
});

test("removal rejection is handled without retrying the same handle", async () => {
  let removed = 0;
  let errors = 0;
  const cleanup = manageNativeListener(
    Promise.resolve({
      async remove() {
        removed++;
        throw new Error("Removal unavailable");
      },
    }),
    () => errors++,
  );
  await nextTurn();
  cleanup();
  await nextTurn();
  cleanup();
  assert.equal(removed, 1);
  assert.equal(errors, 1);
});

test("registration and removal rejection are handled with no error callback", async () => {
  const rejectedCleanup = manageNativeListener(
    Promise.reject(new Error("Registration unavailable")),
  );
  const cleanup = manageNativeListener(
    Promise.resolve({
      async remove() {
        throw new Error("Removal unavailable");
      },
    }),
  );
  rejectedCleanup();
  cleanup();
  // Node's test runner reports an unhandled rejection even without an assertion.
  await nextTurn();
});

test("synchronous removal or reporting failures cannot escape React cleanup", async () => {
  let errors = 0;
  const cleanup = manageNativeListener(
    Promise.resolve({
      remove(): Promise<void> {
        throw new Error("Synchronous bridge failure");
      },
    }),
    () => {
      errors++;
      throw new Error("Reporting failure");
    },
  );
  await nextTurn();
  assert.doesNotThrow(cleanup);
  await nextTurn();
  assert.equal(errors, 1);
});
