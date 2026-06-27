import { useClient as useSanityClient } from 'sanity';
/**
 * Default listen options to be used with the `listen` method provided by the sanity client
 */
export const listenOptions = {
    includeResult: false,
    includePreviousRevision: false,
    visibility: 'query',
    events: ['welcome', 'mutation', 'reconnect'],
};
export function useClient() {
    return useSanityClient({ apiVersion: '2023-02-01' });
}
