export type CustomFieldType = "text" | "number" | "date" | "boolean" | "select";
export type CustomFieldEntity = "employee" | "branch" | "department";

export interface CustomFieldDefinition {
  id: string;
  organizationId: string;
  entityType: CustomFieldEntity;
  label: string;
  fieldKey: string;
  fieldType: CustomFieldType;
  required: boolean;
  isActive: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: string[]; // for select type
  orderIndex: number;
}
