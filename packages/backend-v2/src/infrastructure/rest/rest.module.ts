import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import {TaskService} from "../../application/services/task.service";

@Module({
    controllers: [TaskController],
    providers: [TaskService],
})
export class RestModule {}
