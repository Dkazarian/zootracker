export interface AdminBootstrapConfig {
  name: string;
  email: string;
  password: string;
}

export interface ExistingAdminUser {
  role: string | null;
}

export interface AdminBootstrapDependencies {
  findUserByEmail(email: string): Promise<ExistingAdminUser | null>;
  createAdmin(config: AdminBootstrapConfig): Promise<void>;
}

export type AdminBootstrapResult = 'created' | 'already-present';

function requiredValue(
  environment: NodeJS.ProcessEnv,
  name: 'ADMIN_NAME' | 'ADMIN_EMAIL' | 'ADMIN_PASSWORD',
): string {
  const value = environment[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function readAdminBootstrapConfig(
  environment: NodeJS.ProcessEnv,
): AdminBootstrapConfig {
  const password = requiredValue(environment, 'ADMIN_PASSWORD');

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must contain at least 8 characters');
  }

  return {
    name: requiredValue(environment, 'ADMIN_NAME'),
    email: requiredValue(environment, 'ADMIN_EMAIL').toLowerCase(),
    password,
  };
}

export async function bootstrapAdmin(
  environment: NodeJS.ProcessEnv,
  dependencies: AdminBootstrapDependencies,
): Promise<AdminBootstrapResult> {
  const config = readAdminBootstrapConfig(environment);
  const existingUser = await dependencies.findUserByEmail(config.email);

  if (existingUser) {
    if (existingUser.role !== 'admin') {
      throw new Error(
        'A non-administrator user already exists with ADMIN_EMAIL',
      );
    }

    return 'already-present';
  }

  await dependencies.createAdmin(config);
  return 'created';
}
