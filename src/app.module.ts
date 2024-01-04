import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotesModule } from './notes/notes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { SharesModule } from './shares/shares.module';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Note } from './notes/entities/note.entity';
import { Share } from './shares/entities/share.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseSanitizeInterceptor } from './core/interceptors/responseSanitize.interceptor';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './core/guards/auth.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        password: configService.get('DB_PASSWORD'),
        username: configService.get('DB_USERNAME'),
        entities: [User, Note, Share],
        database: configService.get('DATABASE'),
        synchronize: configService.get('DB_SYNCHRONIZE'),
        logging: configService.get('DB_LOGGING'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    JwtModule,
    NotesModule,
    UsersModule,
    SharesModule,
    CoreModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseSanitizeInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {
  // constructor(private dataSource: DataSource) {}
}
