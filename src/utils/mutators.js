import { get, isPlainObject, setAtPath } from './helpers';
/**
 * Prepares tags for react-select
 * @param customLabel a string with a custom label key to be swapped on the tag
 * @param customValue a string with a custom value key to be swapped on the tag
 * @returns a formatted tag that can be used with react-select without overriding custom labels or values
 */
const prepareTag = ({ customLabel = 'label', customValue = 'value' }) => {
    return (tag) => {
        const labelValue = get(tag, customLabel);
        const valueValue = get(tag, customValue);
        const labelSource = labelValue ?? tag.label;
        const valueSource = valueValue ?? tag.value;
        const label = labelSource === null ? '' : String(labelSource);
        const value = valueSource === null ? '' : String(valueSource);
        const tempTag = {
            ...tag,
            _type: 'tag',
            _key: value,
            _labelTemp: tag.label,
            _valueTemp: tag.value,
            label,
            value,
        };
        return tempTag;
    };
};
function revertTag({ customLabel = 'label', customValue = 'value', isReference, }) {
    return (tag) => {
        if (isReference === true) {
            const tempTag = {
                _ref: tag._id,
                _type: 'reference',
            };
            return tempTag;
        }
        const tempTag = {
            ...tag,
            label: tag._labelTemp,
            value: tag._valueTemp,
        };
        setAtPath(tempTag, customLabel, tag.label);
        setAtPath(tempTag, customValue, tag.value);
        delete tempTag._labelTemp;
        delete tempTag._valueTemp;
        if (tempTag.label === undefined)
            delete tempTag.label;
        if (tempTag.value === undefined)
            delete tempTag.value;
        return tempTag;
    };
}
/**
 * Prepares a list of tag(s) for react-select
 * @param tags A list of tags that need to be prepared for react-select (general objects or references)
 * @returns A prepared list of tag(s) that preserves any custom labels or values
 */
export const prepareTags = async ({ client, tags, customLabel = 'label', customValue = 'value', }) => {
    const prepare = prepareTag({ customLabel, customValue });
    // undefined single
    if (tags === undefined || tags === null)
        return undefined;
    // undefined array
    if (Array.isArray(tags) && !tags.length)
        return [];
    // normalize primitive arrays (e.g. ['GRS', 'ABC'])
    if (Array.isArray(tags) && tags.length && !isPlainObject(tags[0])) {
        const normalized = tags.map((tag) => {
            const value = String(tag);
            const tempTag = { label: value, value };
            setAtPath(tempTag, customLabel, value);
            setAtPath(tempTag, customValue, value);
            return tempTag;
        });
        return normalized.map(prepare);
    }
    // reference array
    if (Array.isArray(tags) && isPlainObject(tags[0]) && '_ref' in tags[0] && '_type' in tags[0]) {
        return (await client.fetch('*[_id in $refs]', {
            refs: tags.map((tag) => tag._ref),
        })).map(prepare);
    }
    // object array
    if (Array.isArray(tags))
        return tags.map(prepare);
    // normalize primitive singleton (e.g. 'GRS')
    if (!isPlainObject(tags)) {
        const value = String(tags);
        const tempTag = { label: value, value };
        setAtPath(tempTag, customLabel, value);
        setAtPath(tempTag, customValue, value);
        return prepare(tempTag);
    }
    // reference singleton
    if (isPlainObject(tags) && '_ref' in tags && '_type' in tags)
        return prepare(await client.fetch('*[_id == $ref][0]', { ref: tags._ref }));
    // object singleton
    return prepare(tags);
};
/**
 * Prepares a list of tags for react-select
 * @param tags A list of tags or single tag that need to be prepared for react-select (general objects or references)
 * @returns A prepared list of tags that preserves any custom labels or values
 */
export const prepareTagsAsList = async (preparedTagsOptions) => {
    const preparedTags = await prepareTags(preparedTagsOptions);
    if (preparedTags === undefined)
        return [];
    if (!Array.isArray(preparedTags))
        return [preparedTags];
    return preparedTags;
};
export function revertTags({ tags, customLabel = 'label', customValue = 'value', isMulti, isReference, }) {
    const revert = revertTag({ customLabel, customValue, isReference });
    // if tags are undefined or null (e.g. cleared via isClearable in react-select)
    if (tags === undefined || tags === null)
        return undefined;
    if (isMulti) {
        // ensure it is actually an array
        const tagsArray = Array.isArray(tags) ? tags : [tags];
        // revert and return array
        if (isReference)
            return tagsArray.map(revert);
        return tagsArray.map(revert);
    }
    // not multi, so ensure is a single tag
    const tag = Array.isArray(tags) ? tags[0] : tags;
    // revert tag
    if (isReference)
        return revert(tag);
    return revert(tag);
}
