interface Target {
  signature: string;
  url: string;
}

interface Latest {
  version: string;
  notes: string;
  pub_date: string;
  platforms: Record<string, Target>;
}
