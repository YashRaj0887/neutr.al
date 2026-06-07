import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(), // loads .env file
    MongooseModule.forRoot(process.env.MONGODB_URI!), // connects to MongoDB
  ],
})
export class AppModule {}