export function requireEnvironment(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getZooTimeZone(): string {
  const timeZone =
    process.env.ZOO_TIME_ZONE ?? 'America/Argentina/Buenos_Aires';

  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
  } catch {
    throw new Error(`Invalid ZOO_TIME_ZONE: ${timeZone}`);
  }

  return timeZone;
}
