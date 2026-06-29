import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { userAc } from 'better-auth/plugins/admin/access';
import { requireEnvironment } from '../config/environment';
import { prisma } from '../database/prisma.service';

const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

export const auth = betterAuth({
  appName: 'Zootracker',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  basePath: '/api/auth',
  secret: requireEnvironment('BETTER_AUTH_SECRET'),
  trustedOrigins: [frontendUrl],
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [
    admin({
      defaultRole: 'keeper',
      adminRoles: ['admin'],
      roles: {
        keeper: userAc,
        admin: userAc,
      },
    }),
  ],
});
