import {ListenOptions} from '@sanity/client'
import {SanityClient} from 'sanity'

/**
 * Default listen options to be used with the `listen` method provided by the sanity client
 */
export declare const listenOptions: ListenOptions
export declare function useClient(): SanityClient
