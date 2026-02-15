export function redirectSystemPath({
  path,
  initial,
}: { path: string; initial: boolean }) {
  // Preservar o deep link de reset-password para que o usuário chegue na tela correta
  if (path && path.includes('reset-password')) {
    return '/(auth)/reset-password';
  }
  return '/';
}
