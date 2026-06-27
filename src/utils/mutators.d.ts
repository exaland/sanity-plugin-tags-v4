import { SanityClient } from '@sanity/client';
import { GeneralTag, RefinedTags, RefTag, Tag, UnrefinedTags } from '../types';
interface PrepareTagsInput<TagType extends UnrefinedTags = UnrefinedTags> {
    client: SanityClient;
    tags: TagType;
    customLabel?: string;
    customValue?: string;
}
/**
 * Prepares a list of tag(s) for react-select
 * @param tags A list of tags that need to be prepared for react-select (general objects or references)
 * @returns A prepared list of tag(s) that preserves any custom labels or values
 */
export declare const prepareTags: <TagType extends UnrefinedTags>({ client, tags, customLabel, customValue, }: PrepareTagsInput<TagType>) => Promise<RefinedTags>;
/**
 * Prepares a list of tags for react-select
 * @param tags A list of tags or single tag that need to be prepared for react-select (general objects or references)
 * @returns A prepared list of tags that preserves any custom labels or values
 */
export declare const prepareTagsAsList: <TagType extends UnrefinedTags>(preparedTagsOptions: PrepareTagsInput<TagType>) => Promise<Tag[]>;
interface RevertTagsInput<IsReference extends boolean = boolean, IsMulti extends boolean = boolean> {
    tags: RefinedTags;
    customLabel?: string;
    customValue?: string;
    isMulti: IsMulti;
    isReference: IsReference;
}
/**
 * Reverts tag(s) for saving to sanity
 * @param customLabel a string with a custom label key to be swapped on the tag(s)
 * @param customValue a string with a custom value key to be swapped on the tag(s)
 * @param isReference whether or not the tag(s) should be saved as a reference or an object
 * @returns a formatted list of tag(s) that restores any custom labels or values while also preparing the tag(s) to be saved by sanity
 */
export declare function revertTags<IsReference extends true, IsMulti extends true>(params: RevertTagsInput<IsReference, IsMulti>): RefTag[];
export declare function revertTags<IsReference extends true, IsMulti extends false>(params: RevertTagsInput<IsReference, IsMulti>): RefTag | undefined;
export declare function revertTags<IsReference extends false, IsMulti extends true>(params: RevertTagsInput<IsReference, IsMulti>): GeneralTag[];
export declare function revertTags<IsReference extends false, IsMulti extends false>(params: RevertTagsInput<IsReference, IsMulti>): GeneralTag | undefined;
export declare function revertTags<IsReference extends boolean, IsMulti extends false>(params: RevertTagsInput<IsReference, IsMulti>): RefTag | GeneralTag | undefined;
export declare function revertTags<IsReference extends boolean, IsMulti extends true>(params: RevertTagsInput<IsReference, IsMulti>): RefTag[] | GeneralTag[];
export declare function revertTags<IsReference extends false, IsMulti extends boolean>(params: RevertTagsInput<IsReference, IsMulti>): GeneralTag | GeneralTag[] | undefined;
export declare function revertTags<IsReference extends true, IsMulti extends boolean>(params: RevertTagsInput<IsReference, IsMulti>): RefTag | RefTag[] | undefined;
export declare function revertTags<IsReference extends boolean, IsMulti extends boolean>(params: RevertTagsInput<IsReference, IsMulti>): UnrefinedTags;
export {};
