import React from 'react';
import { filterUniqueTags } from './helpers';
/**
 * Expands on a basic `isLoading` state by allowing multiple keyed options with separate loading states to be tracked
 * @param initialLoadingOptions An object with several keys, each defining a boolean state of loaded/not loaded
 * @param initialState The initial state (whether or not it should start in a loading state or a loaded state)
 * @returns An array containing the overall loading state, the individual loading states, and a function to change the loading states respectively
 */
export const useLoading = ({ initialLoadingOptions = {}, initialState = true, }) => {
    const [loadingOptions, setLoadingOptions] = React.useState(initialLoadingOptions);
    const [isLoading, setIsLoading] = React.useState(initialState);
    React.useMemo(() => {
        let loaded = false;
        if (Object.keys(loadingOptions).length) {
            for (const option in loadingOptions) {
                if (loadingOptions[option])
                    loaded = true;
            }
        }
        setIsLoading(loaded);
    }, [loadingOptions]);
    const setLoadOption = React.useCallback((properties) => {
        setLoadingOptions((oldValue) => {
            return { ...oldValue, ...properties };
        });
    }, []);
    return [isLoading, loadingOptions, setLoadOption];
};
/**
 * Expands on a basic list of tag options by allowing groups of tags to be passed
 * @param initialState A list of tags (i.e. {label: string, value: string})
 * @returns An array containing a full list of tags, a list of tags keyed by respective groups, and a function to change/add a group of tag options respectively
 */
export const useOptions = ({ initialState = [], }) => {
    const [options, setOptions] = React.useState(initialState);
    const [groupOptions, setGroupOptions] = React.useState({});
    React.useMemo(() => {
        const opts = [];
        for (const group in groupOptions) {
            if (Array.isArray(groupOptions[group]))
                opts.push(...groupOptions[group]);
        }
        setOptions(filterUniqueTags(opts));
    }, [groupOptions]);
    const setTagOption = React.useCallback((properties) => {
        setGroupOptions((oldValue) => ({ ...oldValue, ...properties }));
    }, []);
    return [options, groupOptions, setTagOption];
};
