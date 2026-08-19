import { describe, it, expect, beforeEach } from "vitest";
import type { InternalAxiosRequestConfig } from "axios";
import { AUTH_TOKEN_KEY } from "./constants";
import api from "./api";

interface InterceptorManagerWithHandlers<T> {
  handlers: Array<{ fulfilled: (value: T) => T | Promise<T> } | null>;
}

function getRequestInterceptor() {
  const manager = api.interceptors
    .request as unknown as InterceptorManagerWithHandlers<InternalAxiosRequestConfig>;
  const handler = manager.handlers[0]?.fulfilled;
  if (!handler) throw new Error("No request interceptor registered");
  return handler;
}

describe("api client auth interceptor", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("attaches the Authorization header when a token is stored", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "test-token-123");
    const handler = getRequestInterceptor();
    const config = await handler({ headers: {} } as InternalAxiosRequestConfig);
    expect(config.headers.Authorization).toBe("Bearer test-token-123");
  });

  it("does not attach an Authorization header when no token is stored", async () => {
    const handler = getRequestInterceptor();
    const config = await handler({ headers: {} } as InternalAxiosRequestConfig);
    expect(config.headers.Authorization).toBeUndefined();
  });
});
