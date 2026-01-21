import {definePlugin} from 'sanity'

import {tagSchema} from './schemas/tag'
import {tagsSchema} from './schemas/tags'

interface TagsPluginConfig {}

export const tags = definePlugin<TagsPluginConfig | void>(() => ({
  name: 'sanity-plugin-tags',
  schema: {
    types: [tagSchema, tagsSchema],
  },
}))
