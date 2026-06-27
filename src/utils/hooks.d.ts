import { Tag } from '../types';
type LoadingOptions = {
    [key: string]: boolean;
};
interface UseLoadingInput {
    initialLoadingOptions?: LoadingOptions;
    initialState?: boolean;
}
/**
 * Expands on a basic `isLoading` state by allowing multiple keyed options with separate loading states to be tracked
 * @param initialLoadingOptions An object with several keys, each defining a boolean state of loaded/not loaded
 * @param initialState The initial state (whether or not it should start in a loading state or a loaded state)
 * @returns An array containing the overall loading state, the individual loading states, and a function to change the loading states respectively
 */
export declare const useLoading: ({ initialLoadingOptions, initialState, }: UseLoadingInput) => [boolean, LoadingOptions, (properties: LoadingOptions) => void];
type Options = {
    [key: string]: Tag[];
};
interface UseOptionsInput {
    initialState?: Tag[];
}
/**
 * Expands on a basic list of tag options by allowing groups of tags to be passed
 * @param initialState A list of tags (i.e. {label: string, value: string})
 * @returns An array containing a full list of tags, a list of tags keyed by respective groups, and a function to change/add a group of tag options respectively
 */
export declare const useOptions: ({ initialState, }: UseOptionsInput) => [Tag[], Options, (properties: Options) => void];
export {};
