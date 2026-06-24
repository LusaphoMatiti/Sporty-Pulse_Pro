export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) {
  // Only intercept the OAuth callback link. Every other deep link keeps
  // Expo Router's normal automatic handling.
  if (path.includes("/auth")) {
    return false;
  }

  return path;
}
