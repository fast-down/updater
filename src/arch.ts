export function normalizeArch(arch: string): string {
  switch (arch.trim().toLowerCase()) {
    case "64bit":
    case "x86_64":
    case "x64":
    case "amd64":
      return "x86_64";
    case "32bit":
    case "x86":
    case "i686":
    case "i386":
      return "i686";
    case "arm64":
    case "aarch64":
    case "armv8":
      return "aarch64";
    default:
      return "unknown";
  }
}
