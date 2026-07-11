import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle('Zootracker API')
    .setDescription(
      [
        'Developer reference for Zootracker animal-care operations.',
        'Protected product endpoints require a Better Auth cookie session.',
        'Application roles are Keeper and Administrator; endpoint role requirements are shown in each operation.',
        'Public registration is disabled. Administrators create personnel accounts.',
      ].join(' '),
    )
    .setVersion('1.0.0')
    .addServer('http://localhost:3000', 'Local development')
    .addCookieAuth(
      'better-auth.session_token',
      {
        type: 'apiKey',
        in: 'cookie',
        description:
          'Better Auth HttpOnly session cookie. Sign in through /api/auth/sign-in/email; public sign-up is disabled.',
      },
      'session',
    )
    .addTag('Health', 'Service health and status')
    .addTag('Authentication', 'Current user information and session management')
    .addTag('Personnel', 'Zoo staff management (admin only)')
    .addTag('Animals', 'Zoo animals and their information')
    .addTag('Feeding Plans', 'Feeding plans for animals')
    .addTag('Feeding Tasks', 'Feeding task queue, claims, and completion')
    .addTag('Dashboard', 'Role-specific dashboard data')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    jsonDocumentUrl: 'api-docs-json',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
