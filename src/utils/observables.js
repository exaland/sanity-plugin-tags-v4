import { defer, from, pipe } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { listenOptions } from './client';
import { filterUniqueTags } from './helpers';
import { prepareTagsAsList } from './mutators';
/**
 * A custom pipe function that can be used in an observable pipe to refine tags
 * @param client A Sanity client
 * @param customLabel a string with a custom label key to be swapped on the tag(s)
 * @param customValue a string with a value label key to be swapped on the tag(s)
 * @returns A custom pipe function
 */
const refineTagsPipe = ({ client, customLabel = 'label', customValue = 'value', }) => pipe(map((val) => (Array.isArray(val) ? val.flat(Infinity) : val)), switchMap((val) => prepareTagsAsList({ client, tags: val, customLabel, customValue })), map((val) => filterUniqueTags(val)));
/**
 * A generic observable that will watch a query and return refined tags
 * @param client A Sanity client
 * @param query A GROQ query for the sanity client
 * @param params A list of GROQ params for the sanity client
 * @param customLabel a string with a custom label key to be swapped on the tag(s)
 * @param customValue a string with a value label key to be swapped on the tag(s)
 * @returns An observable that watches for any changes on the query and params
 */
const getGeneralObservable = ({ client, query, params, customLabel = 'label', customValue = 'value', }) => {
    return client.listen(query, params, listenOptions).pipe(switchMap(() => client.fetch(query, params)), refineTagsPipe({ client, customLabel, customValue }));
};
export function getSelectedTags({ client, tags, isMulti, customLabel = 'label', customValue = 'value', }) {
    const tagFunction = async () => tags;
    return defer(() => from(tagFunction())).pipe(refineTagsPipe({ client, customLabel, customValue }), map((val) => (isMulti ? val : val[0])));
}
/**
 * Takes a function that can possibly return singleton tags and forces it to return an array of tags
 * @param predefinedTags A function that returns an unrefined tag(s)
 * @returns A list of the tags
 */
const predefinedTagWrapper = async (predefinedTags) => {
    const tags = await predefinedTags();
    if (!Array.isArray(tags))
        return [tags];
    return tags;
};
/**
 * Manipulate the predefined tags into a list of refined tags
 * @param client A Sanity client
 * @param predefinedTags A list or singleton of RefTag or GeneralTag that will act as predefined tags for react-select
 * @param customLabel a string with a custom label key to be swapped on the tag(s)
 * @param customValue a string with a value label key to be swapped on the tag(s)
 * @returns An observable that returns pre-refined tags received from the predefined tags option
 */
export const getPredefinedTags = ({ client, predefinedTags, customLabel = 'label', customValue = 'value', }) => {
    const tagFunction = predefinedTags instanceof Function ? predefinedTags : async () => predefinedTags;
    return defer(() => from(predefinedTagWrapper(tagFunction)).pipe(refineTagsPipe({ client, customLabel, customValue })));
};
/**
 * Observes changes to a referenced document and returns refined tags
 * @param client A Sanity client
 * @param document a string that matches a document type in the sanity schema
 * @param customLabel a string with a custom label key to be swapped on the tag(s)
 * @param customValue a string with a value label key to be swapped on the tag(s)
 * @returns An observable that returns pre-refined tags received from the referenced document
 */
export const getTagsFromReference = ({ client, document, customLabel = 'label', customValue = 'value', }) => {
    const query = `
  *[ _type == $document && defined(@[$customLabel]) && defined(@[$customValue])] {
    _id,
    "value": coalesce(@[$customValue].current,@[$customValue]),
    "label": @[$customLabel]
  }
  `;
    const params = {
        document,
        customLabel: customLabel.split('.')[0],
        customValue: customValue.split('.')[0],
    };
    return getGeneralObservable({
        client,
        query,
        params,
        customLabel,
        customValue,
    });
};
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
export const getTagsFromRelated = ({ client, documentType, field, isMulti, customLabel = 'label', customValue = 'value', }) => {
    const query = `
  *[
    _type == $documentType &&
    defined(@[$field]) &&
    defined(@[$field][]) == $isMulti &&
    (
      (!$isMulti && defined(@[$field]->[$customLabel]) && defined(@[$field]->[$customValue])) ||
      (!$isMulti && defined(@[$field][$customLabel]) && defined(@[$field][$customValue])) ||
      ($isMulti && defined(@[$field][]->[$customLabel]) && defined(@[$field][]->[$customValue])) ||
      ($isMulti && defined(@[$field][][$customLabel]) && defined(@[$field][][$customValue]))
    )
  ][$field]
  `;
    const params = {
        documentType,
        field,
        isMulti,
        customLabel: customLabel.split('.')[0],
        customValue: customValue.split('.')[0],
    };
    return getGeneralObservable({
        client,
        query,
        params,
        customLabel,
        customValue,
    });
};
