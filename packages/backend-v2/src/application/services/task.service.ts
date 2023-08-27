import { Injectable } from '@nestjs/common';
import {FieldWorkTypes} from "../../domain/model/field.work.types.model";

@Injectable()
export class TaskService {
    fetchFieldWorkTypes({farmId, userId}: { farmId: string; userId: string; }): FieldWorkTypes {
        return {
            id: 1,
            label: "alan",
            value: "trevino",
            name: "example",
            farmId: "anskja"
        }
    }
}
