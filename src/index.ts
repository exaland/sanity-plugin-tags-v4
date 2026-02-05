import {definePlugin} from 'sanity'

import {tagSchema} from './schemas/tag'
import {tagsSchema} from './schemas/tags'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TagsPluginConfig {}

export const tags = definePlugin<TagsPluginConfig | void>(() => ({
  name: 'sanity-plugin-tags',
  schema: {
    types: [tagSchema, tagsSchema],
  },
}))
