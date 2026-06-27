import { definePlugin } from 'sanity';
import { tagSchema } from './schemas/tag';
import { tagsSchema } from './schemas/tags';
export const tags = definePlugin(() => ({
    name: 'sanity-plugin-tags',
    schema: {
        types: [tagSchema, tagsSchema],
    },
}));
