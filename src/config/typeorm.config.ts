import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import * as config from 'config';

const dbConfig = config.get('db');

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: dbConfig.type,
    url: process.env.RDS_URL || dbConfig.url,
    username: process.env.RDS_USERNAME || dbConfig.username,
    password: process.env.RDS_PASSWORD || dbConfig.password,
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: true,
    useUnifiedTopology: true
};