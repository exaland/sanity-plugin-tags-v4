import {SanityClient} from '@sanity/client'
import {Observable} from 'rxjs'

import {PredefinedTags, Tag, UnrefinedTags} from '../types'
interface GetSelectedTagsInput<IsMulti extends boolean = boolean> {
  // eslint-disable-next-line prettier/prettier
    client: SanityClient
  tags: UnrefinedTags
  isMulti: IsMulti
  customLabel?: string
  customValue?: string
}
/**
 * Manipulate the selected tags into a list of refined tags
 * @param client A Sanity client
 * @param tags A list or singleton of RefTag or GeneralTag that will act as the selected tags for react-select
 * @param customLabel a string with a custom label key to be swapped on the tag(s)
 * @param customValue a string with a value label key to be swapped on the tag(s)
 * @returns An observable that returns pre-refined tags received from the predefined tags option
 */
export declare function getSelectedTags<IsMulti extends true>(
  params: GetSelectedTagsInput<IsMulti>,
): Observable<Tag[]>
export declare function getSelectedTags<IsMulti extends false>(
  params: GetSelectedTagsInput<IsMulti>,
): Observable<Tag>
export declare function getSelectedTags<IsMulti extends boolean>(
  params: GetSelectedTagsInput<IsMulti>,
): Observable<Tag | Tag[]>
interface GetPredefinedTagsInput {
  client: SanityClient
  predefinedTags: PredefinedTags
  customLabel?: string
  customValue?: string
}
/**
 * Manipulate the predefined tags into a list of refined tags
 * @param client A Sanity client
 * @param predefinedTags A list or singleton of RefTag or GeneralTag that will act as predefined tags for react-select
 * @param customLabel a string with a custom label key to be swapped on the tag(s)
 * @param customValue a string with a value label key to be swapped on the tag(s)
 * @returns An observable that returns pre-refined tags received from the predefined tags option
 */
export declare const getPredefinedTags: ({
  client,
  predefinedTags,
  customLabel,
  customValue,
}: GetPredefinedTagsInput) => Observable<Tag[]>
interface GetTagsFromReferenceInput {
  client: SanityClient
  document: string
  customLabel?: string
  customValue?: string
}
/**
 * Observes changes to a referenced document and returns refined tags
 * @param client A Sanity client
 * @param document a string that matches a document type in the sanity schema
 * @param customLabel a string with a custom label key to be swapped on the tag(s)
 * @param customValue a string with a value label key to be swapped on the tag(s)
 * @returns An observable that returns pre-refined tags received from the referenced document
 */
export declare const getTagsFromReference: ({
  client,
  document,
  customLabel,
  customValue,
}: GetTagsFromReferenceInput) => Observable<Tag[]>
interface GetTagsFromRelatedInput {
  client: SanityClient
  documentType: string
  field: string
  isMulti: boolean
  customLabel?: string
  customValue?: string
}
/**
 * Observes changes to related objects and returns refined tags
 * @param client A Sanity client
 * @param documentType a string that matches the current document type
 * @param field a string that matches the name of the field to pull from
 * @param isMulti whether or not the related field is an array or an object
 * @param customLabel a string with a custom label key to be swapped on the tag(s)
 * @param customValue a string with a value label key to be swapped on the tag(s)
 * @returns An observable that returns pre-refined tags received from the related field within the document
 */
export declare const getTagsFromRelated: ({
  client,
  documentType,
  field,
  isMulti,
  customLabel,
  customValue,
}: GetTagsFromRelatedInput) => Observable<Tag[]>
export {}
