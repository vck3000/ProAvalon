import {
  transformAndValidate as tAndV,
  ClassType,
  TransformValidationOptions,
} from 'class-transformer-validator';

export * from './proto/lobbyProto';

export function transformAndValidate<T extends object, V extends object>(
  type: ClassType<T>,
  object: V,
  options?: TransformValidationOptions,
) {
  return tAndV(type, object, options);
}
