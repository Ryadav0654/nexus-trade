function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

const env = {
  port: Number(getRequiredEnv("PORT")),
  jwtSecret: getRequiredEnv("JWT_SECRET"),
  databaseUrl: getRequiredEnv("DATABASE_URL"),
};

export default env;
