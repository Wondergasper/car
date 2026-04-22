/**
 * Build connector `config` dict from a single connection string / URL (onboarding & quick-add flows).
 * Must match backend seeder slugs: postgresql, mysql, mssql, mongodb, rest_api.
 */
export function buildConnectorConfigFromString(
  slug: string,
  raw: string
): Record<string, unknown> {
  const s = raw.trim();
  if (!s) {
    throw new Error("Connection details are required");
  }

  switch (slug) {
    case "mongodb":
      return { connection_string: s };
    case "rest_api": {
      const base =
        s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`;
      return { base_url: base, auth_type: "none" };
    }
    case "postgresql":
    case "mysql":
    case "mssql": {
      const normalized =
        slug === "postgresql" ? s.replace(/^postgresql:/i, "postgres:") : s;
      let u: URL;
      try {
        u = new URL(normalized);
      } catch {
        throw new Error("Invalid connection URL. Example: postgresql://user:pass@host:5432/dbname");
      }
      const defaultPort = slug === "mysql" ? 3306 : slug === "mssql" ? 1433 : 5432;
      const pathDb = decodeURIComponent(u.pathname.replace(/^\//, ""));
      const database = pathDb.split("/")[0];
      if (!database) {
        throw new Error("Database name is missing in the URL path");
      }
      const out: Record<string, unknown> = {
        host: u.hostname,
        port: u.port ? parseInt(u.port, 10) : defaultPort,
        database,
        username: decodeURIComponent(u.username || ""),
        password: decodeURIComponent(u.password || ""),
      };
      if (slug === "postgresql") {
        out.ssl_mode = "require";
      }
      if (slug === "mysql") {
        out.ssl = true;
      }
      if (slug === "mssql") {
        out.encrypt = true;
      }
      return out;
    }
    default:
      return { connection_string: s };
  }
}

/** Map onboarding company size label to approximate headcount for `Organization.size`. */
export function mapCompanySizeToInt(sizeLabel: string): number | undefined {
  const map: Record<string, number> = {
    "1–10": 5,
    "1-10": 5,
    "11–50": 25,
    "11-50": 25,
    "51–200": 125,
    "51-200": 125,
    "201–500": 350,
    "201-500": 350,
    "501–1,000": 750,
    "501-1,000": 750,
    "1,000+": 1500,
  };
  return map[sizeLabel];
}
