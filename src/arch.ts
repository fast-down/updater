const arm64Pattern = /(arm64|aarch64|armv[89]|apple-m\d+)/i;
const arm32Pattern = /(arm|armv[67]|armhf|armel|armv\d+l)/i;
const x86_64Pattern = /(x86_64|x64|amd64|intel64)/i;
const x86Pattern = /(x86|i\d86|ia32|win32)/i;

const generic64 = /64bit/i;
const generic32 = /32bit/i;

export function normalizeArch(arch: string): string {
  if (arm64Pattern.test(arch)) return "aarch64";
  if (arm32Pattern.test(arch)) return "arm";
  if (x86_64Pattern.test(arch)) return "x86_64";
  if (x86Pattern.test(arch)) return "x86";
  if (generic64.test(arch)) return "x86_64";
  if (generic32.test(arch)) return "x86";
  return "unknown";
}
