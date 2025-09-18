/* eslint-disable no-console */
import React, {forwardRef, useCallback, useEffect} from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import StateManagedSelect from 'react-select/dist/declarations/src/stateManager'
import {set, unset, useFormValue, useSchema} from 'sanity'
import {usePrefersDark} from '@sanity/ui'
import {
  GeneralSubscription,
  GeneralTag,
  RefinedTags,
  SelectProps,
  Tag,
  TagsInputProps,
} from '../types'
import {useClient} from '../utils/client'
import {
  createDefaultOnCreateReference,
  isSchemaMulti,
  isSchemaReference,
  setAtPath,
} from '../utils/helpers'
import {useLoading, useOptions} from '../utils/hooks'
import {
  convertDocumentToTag,
  createReferenceDocument,
  syncReferencesAcrossStudio,
  prepareTags,
  revertTags,
} from '../utils/mutators'
import {
  getPredefinedTags,
  getSelectedTags,
  getTagsFromReference,
  getTagsFromRelated,
} from '../utils/observables'
import {ReferenceCreateWarning, ReferencePredefinedWarning} from './ReferenceWarnings'
import styles from './TagsInput.module.css'

export const TagsInput = forwardRef<StateManagedSelect, TagsInputProps>(
  (props: TagsInputProps, ref: React.Ref<Select>) => {
    const client = useClient()
    const schema = useSchema()
    const documentType = useFormValue(['_type']) as string
    const [selected, setSelected] = React.useState<RefinedTags>(undefined)
    const [isLoading, , setLoadOption] = useLoading({})
    const [options, groupOptions, setTagOption] = useOptions({})
    const prefersDark = usePrefersDark()

    const {
      schemaType, // Schema information
      value, // Current field value
      readOnly, // Boolean if field is not editable
      onChange, // Method to handle patch events
    } = props

    // get schema types (whether or not array, whether or not reference)
    const isMulti = isSchemaMulti(schemaType)
    const isReference = isSchemaReference(schemaType)

    // define all options passed to input
    const {
      predefinedTags = [],
      includeFromReference = false,
      includeFromRelated = false,
      customLabel = 'label',
      customValue = 'value',
      allowCreate = true,
      onCreate = async (val: string): Promise<GeneralTag> => {
        const tag: GeneralTag = {}
        setAtPath(tag, customLabel, val)
        setAtPath(tag, customValue, val)
        return tag
      },
      onCreateReference = createDefaultOnCreateReference(customLabel, customValue),
      checkValid = (inputValue: string, currentValues: string[]) =>
        !currentValues.includes(inputValue) && !!inputValue && inputValue.trim() === inputValue,
      reactSelectOptions = {} as SelectProps<typeof isMulti>,
    } = schemaType.options ? schemaType.options : {}

    // Track if global sync is running to avoid conflicts
    const [isGlobalSyncRunning, setIsGlobalSyncRunning] = React.useState(false)

    // check if reference warnings need to be generated
    const isReferenceCreateWarning =
      schemaType.options && allowCreate && isReference && !includeFromReference
    const isReferencePredefinedWarning =
      schemaType.options && !!schemaType.options.predefinedTags && isReference
    // Kick off a global cleanup pass across the studio (fire-and-forget)
    useEffect(() => {
      if (!includeFromReference || typeof includeFromReference !== 'string') return

      // Determine the field path string for this input
      const fieldPath = Array.isArray((props as any).path)
        ? (props as any).path.filter(Boolean).join('.')
        : (schemaType?.name as string)

      if (!fieldPath) return

      setIsGlobalSyncRunning(true)
      syncReferencesAcrossStudio({
        client,
        field: fieldPath,
        refSchemaType: includeFromReference,
        documentType,
        isReferenceField: isReference,
        isMulti,
        customLabel,
        customValue,
      }).finally(() => {
        setIsGlobalSyncRunning(false)
      })
      // intentionally no deps aside from the toggles to avoid reruns
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [includeFromReference])
    // check for and handle deleted references and value updates
    const checkAndSyncReferences = useCallback(
      (currentSelected: Tag[], availableReferences: Tag[]) => {
        if (!includeFromReference) {
          return currentSelected
        }

        const availableIds = new Set(availableReferences.map((tag) => tag._id))

        // Build lookup for value updates
        const referenceLookup = Object.fromEntries(
          availableReferences.map((reference) => [
            reference._id,
            {label: reference.label, value: reference.value},
          ])
        )

        const processedSelected = currentSelected
          .map((tag) => {
            // Remove deleted references
            if (tag._id && !availableIds.has(tag._id)) {
              return null // Will be filtered out
            }

            // Update values for existing references
            if (tag._id && referenceLookup[tag._id]) {
              const refData = referenceLookup[tag._id]
              const needsUpdate = refData.label !== tag.label || refData.value !== tag.value

              if (needsUpdate) {
                return {
                  ...tag,
                  label: refData.label,
                  value: refData.value,
                  _labelTemp: refData.label,
                  _valueTemp: refData.value,
                }
              }
            }

            return tag
          })
          .filter(Boolean) as Tag[]

        return processedSelected
      },
      [includeFromReference]
    )

    // Memoized identity keys to stabilize dependencies
    const selectedIdsKey = React.useMemo(() => {
      return Array.isArray(selected)
        ? selected
            .map((t) => t?._id)
            .filter(Boolean)
            .sort()
            .join(',')
        : ''
    }, [selected])

    const referenceIdsKey = React.useMemo(() => {
      const refs = groupOptions.referenceTags || []
      return Array.isArray(refs)
        ? refs
            .map((t) => t?._id)
            .filter(Boolean)
            .sort()
            .join(',')
        : ''
    }, [groupOptions.referenceTags])

    const runReferenceSync = useCallback(() => {
      if (!includeFromReference) return

      const selectedArr = Array.isArray(selected) ? selected : []
      const referenceArr = groupOptions.referenceTags || []
      if (!selectedArr.length || !referenceArr.length) return

      const syncedSelected = checkAndSyncReferences(selectedArr, referenceArr)

      // Check if anything changed (length or content)
      const hasChanges =
        syncedSelected.length !== selectedArr.length ||
        syncedSelected.some((tag, index) => {
          const original = selectedArr[index]
          return !original || tag.label !== original.label || tag.value !== original.value
        })

      if (hasChanges) {
        setSelected(syncedSelected)
      }
    }, [selectedIdsKey, referenceIdsKey, checkAndSyncReferences])

    const isDeletedReference = useCallback(
      (tag: Tag, availableReferences: Tag[]) => {
        if (!includeFromReference || !tag._id) return false
        const availableIds = new Set(availableReferences.map((reference) => reference._id))
        return !availableIds.has(tag._id)
      },
      [includeFromReference]
    )

    // Run reference sync whenever selected/reference IDs change
    // But only if we're not already running global sync
    useEffect(() => {
      if (!isGlobalSyncRunning) {
        runReferenceSync()
      }
    }, [runReferenceSync, isGlobalSyncRunning])

    // get all tag types when the component loads
    useEffect(() => {
      // set generic unsubscribe function in case not used later on
      const defaultSubscription: GeneralSubscription = {
        unsubscribe: () => {
          // Default no-op unsubscribe function
        },
      }

      let selectedSubscription: GeneralSubscription = defaultSubscription
      let predefinedSubscription: GeneralSubscription = defaultSubscription
      let relatedSubscription: GeneralSubscription = defaultSubscription
      let referenceSubscription: GeneralSubscription = defaultSubscription

      setLoadOption({
        selectedTags: true,
        predefinedTags: true,
        referenceTags: true,
        relatedTags: true,
      })

      let selectedRef: Tag[] = []
      let referenceRef: Tag[] = []

      // Auto-sync references once both lists are present
      const maybeSyncReferences = () => {
        if (typeof includeFromReference !== 'string') return
        if (!selectedRef.length || !referenceRef.length) return

        const synced = checkAndSyncReferences(selectedRef, referenceRef)

        // Check if anything changed
        const hasChanges =
          synced.length !== selectedRef.length ||
          synced.some((tag, index) => {
            const original = selectedRef[index]
            return !original || tag.label !== original.label || tag.value !== original.value
          })

        if (hasChanges) {
          setSelected(synced as RefinedTags)

          const tagsForEvent = revertTags({
            tags: synced as RefinedTags,
            customLabel,
            customValue,
            isMulti,
            isReference,
          })
          onChange(tagsForEvent ? set(tagsForEvent) : unset(tagsForEvent))
        }
      }

      // setup the selected observable
      selectedSubscription = getSelectedTags({
        client,
        tags: value,
        customLabel,
        customValue,
        isMulti,
      }).subscribe((tags: Tag[]) => {
        setSelected(tags)
        if (Array.isArray(tags)) {
          selectedRef = tags as Tag[]
        } else if (tags) {
          selectedRef = [tags] as unknown as Tag[]
        } else {
          selectedRef = []
        }
        maybeSyncReferences()
        setLoadOption({selectedTags: false})
      })

      // setup the predefined observable
      predefinedSubscription = getPredefinedTags({
        client,
        predefinedTags,
        customLabel,
        customValue,
      }).subscribe((tags: Tag[]) => {
        setTagOption({predefinedTags: tags})
        setLoadOption({predefinedTags: false})
      })

      // if true, setup the reference observable
      if (typeof includeFromReference === 'string') {
        referenceSubscription = getTagsFromReference({
          client,
          document: includeFromReference,
          customLabel,
          customValue,
        }).subscribe((tags: Tag[]) => {
          setTagOption({referenceTags: tags})
          // After reference updates, run sync for all field types
          const fieldPath = Array.isArray((props as any).path)
            ? (props as any).path.filter(Boolean).join('.')
            : (schemaType?.name as string)
          if (fieldPath) {
            setIsGlobalSyncRunning(true)
            syncReferencesAcrossStudio({
              client,
              field: fieldPath,
              refSchemaType: includeFromReference,
              documentType,
              isReferenceField: isReference,
              isMulti,
              customLabel,
              customValue,
            })
              .catch((err) => console.error('❌ Sync after reference update failed:', err))
              .finally(() => {
                setIsGlobalSyncRunning(false)
              })
          }
          if (Array.isArray(tags)) {
            referenceRef = tags as Tag[]
          } else if (tags) {
            referenceRef = [tags] as unknown as Tag[]
          } else {
            referenceRef = []
          }
          maybeSyncReferences()
          setLoadOption({referenceTags: false})
        })
      } else {
        setLoadOption({referenceTags: false})
      }

      // if true, setup the related observable
      if (typeof includeFromRelated === 'string') {
        relatedSubscription = getTagsFromRelated({
          client,
          documentType,
          field: includeFromRelated,
          isMulti,
          customLabel,
          customValue,
        }).subscribe((tags: Tag[]) => {
          setTagOption({relatedTags: tags})
          setLoadOption({relatedTags: false})
        })
      } else {
        setLoadOption({relatedTags: false})
      }

      // unsubscribe on unmount
      return () => {
        selectedSubscription.unsubscribe()
        predefinedSubscription.unsubscribe()
        relatedSubscription.unsubscribe()
        referenceSubscription.unsubscribe()
      }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // create a reference document and return the reference
    const createReferenceDocumentWithOptions = useCallback(
      (inputValue: string, refSchemaType: string) => {
        const refSchema = schema.get(refSchemaType)
        return createReferenceDocument({
          client,
          inputValue,
          refSchemaType,
          customLabel,
          customValue,
          onCreateReference,
          schema: refSchema,
        })
      },
      [client, onCreateReference, customLabel, customValue, schema]
    )

    // refresh reference options after creating a new document
    const refreshReferenceOptions = useCallback(() => {
      if (typeof includeFromReference === 'string') {
        setLoadOption({referenceTags: true})

        const referenceSubscription = getTagsFromReference({
          client,
          document: includeFromReference,
          customLabel,
          customValue,
        }).subscribe((tags: Tag[]) => {
          setTagOption({referenceTags: tags})
          setLoadOption({referenceTags: false})

          // Cleanup is handled by the dedicated useEffect to avoid re-render loops
        })

        // Clean up subscription after a short delay to allow for the update
        setTimeout(() => {
          referenceSubscription.unsubscribe()
        }, 1000)
      }
    }, [client, includeFromReference, customLabel, customValue, setLoadOption, setTagOption])

    // handle any change made to the select
    const handleChange = useCallback(
      (inputValue: RefinedTags) => {
        // set the new option
        setSelected(inputValue)

        // revert the tags to their initial values for saving
        const tagsForEvent = revertTags({
          tags: inputValue,
          customLabel,
          customValue,
          isMulti,
          isReference,
        })

        // save the values
        onChange(tagsForEvent ? set(tagsForEvent) : unset(tagsForEvent))
      },
      [onChange, customLabel, customValue, isMulti, isReference]
    )

    // when new options are created, use this to handle it
    const handleCreate = React.useCallback(
      async (inputValue: string) => {
        // since an await is used, briefly set the load state to true
        setLoadOption({handleCreate: true})

        try {
          let newCreateValue: RefinedTags

          // Check if we need to create a reference document
          // This works for both actual reference fields AND tag fields with includeFromReference
          if (includeFromReference && typeof includeFromReference === 'string') {
            // Create a reference document
            const createdDoc = await createReferenceDocumentWithOptions(
              inputValue,
              includeFromReference
            )

            // For tag fields, convert the document to a tag object
            // For reference fields, prepareTags will handle the reference conversion
            if (isReference) {
              // For reference fields, prepare as reference
              newCreateValue = await prepareTags({
                client,
                customLabel,
                customValue,
                tags: {
                  _ref: createdDoc._id,
                  _type: 'reference',
                },
              })
            } else {
              // Convert document to tag object for tag fields
              newCreateValue = convertDocumentToTag(createdDoc, customLabel, customValue)
            }

            // Refresh the reference options to include the newly created document
            refreshReferenceOptions()
          } else {
            // Standard tag creation
            const newTag = await onCreate(inputValue)

            // Prepare the tag for react-select
            newCreateValue = await prepareTags({
              client,
              customLabel,
              customValue,
              tags: newTag,
            })
          }

          if (Array.isArray(selected)) handleChange([...selected, newCreateValue] as RefinedTags)
          else handleChange(newCreateValue)
        } catch (error) {
          console.error('Failed to create tag:', error)
        } finally {
          // unset the load state
          setLoadOption({handleCreate: false})
        }
      },
      [
        handleChange,
        setLoadOption,
        selected,
        includeFromReference,
        isReference,
        createReferenceDocumentWithOptions,
        customLabel,
        customValue,
        client,
        refreshReferenceOptions,
        onCreate,
        allowCreate,
      ]
    )

    // format option labels to show deleted references
    const formatOptionLabel = (option: Tag) => {
      const isDeleted =
        includeFromReference &&
        option._id &&
        groupOptions.referenceTags &&
        isDeletedReference(option, groupOptions.referenceTags)

      if (isDeleted) {
        return (
          <div style={{color: '#ff6b6b', fontStyle: 'italic'}}>
            {option.label} <span style={{fontSize: '0.8em'}}>(deleted)</span>
          </div>
        )
      }

      return option.label
    }

    // set up the options for react-select
    const selectOptions = {
      isLoading,
      ref,
      isMulti,
      options,
      value: selected,
      formatOptionLabel,
      isValidNewOption: (inputValue: string, selectedValues: Tag[], selectedOptions: Tag[]) => {
        return checkValid(inputValue, [
          ...selectedOptions.map((opt) => opt.value),
          ...selectedValues.map((val) => val.value),
        ])
      },
      onCreateOption: handleCreate,
      onChange: handleChange,
      isDisabled: readOnly || isLoading,
      styles: {
        menu: (base) => ({
          ...base,
          zIndex: 15, // Adjusted dropdown menu z-index to prevent overlap with background items
        }),
      },
      classNames: prefersDark
        ? {
            container: () => styles.container,
            control: () => styles.control,
            input: () => styles.input,
            menu: () => styles.menu,
            option: () => styles.option,
            indicatorSeparator: () => styles.indicatorSeparator,
            placeholder: () => styles.placeholder,
            singleValue: () => styles.singleValue,
            multiValue: () => styles.multiValue,
            multiValueLabel: () => styles.multiValueLabel,
            multiValueRemove: () => styles.multiValueRemove,
          }
        : {
            container: () => styles.container,
            control: () => styles.control,
            input: () => styles.input,
            menu: () => styles.menu,
            option: () => styles.option,
            indicatorSeparator: () => styles.indicatorSeparator,
            placeholder: () => styles.placeholder,
            singleValue: () => styles.singleValue,
            multiValue: () => styles.multiValue,
            multiValueLabel: () => styles.multiValueLabel,
            multiValueRemove: () => styles.multiValueRemove,
          },
      ...reactSelectOptions,
    } as SelectProps

    return (
      <>
        {isReferenceCreateWarning && <ReferenceCreateWarning />}
        {isReferencePredefinedWarning && <ReferencePredefinedWarning />}
        {allowCreate ? <CreatableSelect {...selectOptions} /> : <Select {...selectOptions} />}
      </>
    )
  }
)

TagsInput.displayName = 'TagsInput'
