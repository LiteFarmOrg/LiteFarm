/*
	{
		"field_work_type_id": 1,
		"farm_id": null,
		"label": "ADD_TASK.FIELD_WORK_VIEW.TYPE.COVERING_SOIL",
		"value": "COVERING_SOIL",
		"field_work_name": "Covering soil"
	},
 */
import { ApiProperty } from '@nestjs/swagger';

export class FieldWorkTypesDto {
    @ApiProperty()
    fieldWorkTypeId: number;

    @ApiProperty()
    label: string;

    @ApiProperty()
    value: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    farmId?: string;
}

export function createFieldWorkTypes(types: FieldWorkType): FieldWorkTypesDto {
    const dto = new FieldWorkTypesDto();
    dto.fieldWorkTypeId = types.id;
    dto.label = types.label;
    dto.value = types.value;
    dto.name = types.name;
    dto.farmId = types.farmId;
    return dto;
}