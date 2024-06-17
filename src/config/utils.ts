export function getRequiredEnvVariable(variableName: string) {
  const envVariable = process.env[variableName];

  if (envVariable === undefined || envVariable === '') {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }

  return envVariable;
}
