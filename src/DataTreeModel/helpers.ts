import { FieldData, FieldListData } from "./Field.js";

export function newField<T>(
  value: FieldData<T> | T | undefined,
  defaultValue: T | (() => T)
): FieldData<T> {
  if (value instanceof FieldData) return value;
  return new FieldData(
    value === undefined
      ? defaultValue instanceof Function
        ? defaultValue()
        : defaultValue
      : value
  );
}

export function newFieldList<T>(
  value: FieldListData<T> | T[] | undefined,
  defaultValue?: T[]
): FieldListData<T> {
  if (value instanceof FieldListData) return value;
  return new FieldListData(value === undefined ? defaultValue ?? [] : value);
}
