import {Card} from '@sanity/ui'
import React from 'react'

export const ReferenceCreateWarning = (): React.ReactElement => (
  <Card padding={[3, 3, 4]} marginBottom={[3, 3, 4]} radius={2} shadow={1} tone="caution">
    Tag References cannot be created inline. Please set the <code>allowCreate</code> option
    explicitly to <code>false</code> to remove this warning message.
  </Card>
)

export const ReferencePredefinedWarning = (): React.ReactElement => (
  <Card padding={[3, 3, 4]} marginBottom={[3, 3, 4]} radius={2} shadow={1} tone="caution">
    Tag References cannot have predefined tags. Please unset the <code>predefinedTags</code> option
    to remove this warning message.
  </Card>
)
