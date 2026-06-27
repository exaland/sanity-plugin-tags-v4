import { TagsInput } from '../components/TagsInput';
export const tagsSchema = {
    name: 'tags',
    title: 'Tags',
    type: 'array',
    components: {
        input: TagsInput,
    },
    of: [{ type: 'tag' }],
};
