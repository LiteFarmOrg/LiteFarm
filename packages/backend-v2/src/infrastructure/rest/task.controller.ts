import { Controller, Get } from '@nestjs/common';
import { TaskService } from '../../application/services/task.service';
import {FieldWorkTypesDto, createFieldWorkTypes} from "./fieldWorkTypesDto";

@Controller('task')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Get('fieldWorkTypes')
    fetchFieldWorkTypes(): FieldWorkTypesDto {
        const workTypes = this.taskService.fetchFieldWorkTypes({farmId: "abc", userId: "abc"});
        return createFieldWorkTypes(workTypes);

    }
}
