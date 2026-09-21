// Subscription guard — no longer hard-redirects from tabs.
// Free users can use the app with limited history (3 scans).
// The paywall is accessible via the Pro button in the History header.
export function useSubscriptionGuard() {
  // Intentionally a no-op: soft gating is handled per-screen.
}
