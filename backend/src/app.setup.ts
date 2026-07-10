import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

  const config = new DocumentBuilder()
    .setTitle('Zootracker API')
    .setDescription('Zootracker API Reference - Zoo animal feeding management and tracking')
    .setVersion('1.0.0')
    .addCookieAuth('session', {
      type: 'apiKey',
      in: 'cookie',
      name: 'session',
      description: 'Better Auth session cookie for authenticated endpoints',
    })
    .addTag('Health', 'Service health and status')
    .addTag('Authentication', 'Current user information and session management')
    .addTag('Personnel', 'Zoo staff management (admin only)')
    .addTag('Animals', 'Zoo animals and their information')
    .addTag('Feeding Plans', 'Feeding plans for animals')
    .addTag('Feeding Tasks', 'Feeding task queue, claims, and completion')
    .addTag('Dashboard', 'Role-specific dashboard data')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
}
