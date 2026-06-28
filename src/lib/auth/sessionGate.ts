interface SessionGate {
  promise: Promise<void>;
  resolve: () => void;
  reject: (reason?: unknown) => void;
}

function createPendingPromise(): SessionGate {
  let resolve!: () => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

let gate = createPendingPromise();
gate.resolve();

export function resetSessionGate(): void {
  gate = createPendingPromise();
}

export function resolveSessionGate(): void {
  gate.resolve();
}

export function rejectSessionGate(reason?: unknown): void {
  gate.reject(reason);
}

export function waitForSession(): Promise<void> {
  return gate.promise;
}
