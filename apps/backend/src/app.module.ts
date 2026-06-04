import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { EmbeddingsModule } from './embeddings';
import { CategoriesModule } from './categories';
import { ChatModule } from './chat/chat.module';
import { ConversationsModule } from './conversations/conversations.module';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM con PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // SOLO en desarrollo - auto-crea las tablas
        logging: true, // Ver queries en consola
      }),
    }),

    CategoriesModule,
    ProductsModule,
    EmbeddingsModule,
    ChatModule,
    ConversationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
