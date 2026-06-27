import {InputType, Tag} from '../types'
/**
 *
 * @param type type prop passed by sanity to input components
 * @returns boolean defining whether the schema is an array or not
 */
export declare const isSchemaMulti: (type: InputType) => boolean
/**
 *
 * @param type type prop passed by sanity to input components
 * @returns boolean defining whether the schema is a reference or not
 */
export declare const isSchemaReference: (type: InputType) => boolean
/**
 *
 * @param tags an array of tags (i.e. { label: string, value: string })
 * @returns a filtered and flattened version of the initial tags array by uniqueness
 */
export declare const filterUniqueTags: (tags?: Tag[]) => Tag[]
/**
 * Get value from object through string/array path
 * @param obj The object with the key you want to retrieve
 * @param path The path (either a string or an array of strings) to the key (i.e. a.b.c or ['a', 'b', 'c'])
 * @param defaultValue A value to return
 * @returns The value at the end of the path or a default value
 */
export declare const get: <DefaultValue = undefined>(
  object: Record<string, unknown> | unknown,
  path: string | string[],
  defaultValue?: DefaultValue,
) => unknown
/**
 * Set value from object through string/array path
 * @param obj The object you want to add to
 * @param path The path to store the new value (either a string or an array of strings) to the key (i.e. a.b.c or ['a', 'b', 'c'])
 * @param value The value to add to the object
 * @returns True or false defining whether it is sucessfully added
 */
export declare const setAtPath: <Value = unknown>(
  object: Record<string, unknown>,
  path: string | string[],
  value: Value,
) => boolean
export declare function isPlainObject(value: unknown): value is Record<string, unknown>
