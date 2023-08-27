export interface FieldWorkTypes {
    id: number;
    label: string;
    value: string;
    name: string;
    farmId?: string;
}

export function createFieldWorkType(
    id: number,
    label: string,
    value: string,
    name: string,
    farmId?: string,
): FieldWorkTypes {
    return {
        id,
        label,
        value,
        name,
        farmId
    }
}