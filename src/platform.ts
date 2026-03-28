const linuxPattern = /(linux|ubuntu|debian|alpine|centos|fedora|redhat|suse)/i;
const macPattern = /(darwin|osx|mac|apple)/i;
const windowsPattern = /(win)/i;

export function normalizePlatform(arch: string): string {
  if (linuxPattern.test(arch)) return "linux";
  if (macPattern.test(arch)) return "macos";
  if (windowsPattern.test(arch)) return "windows";
  return "unknown";
}
