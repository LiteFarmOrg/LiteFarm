import { files, main } from '$lib/server/files';

export function load() {
    return {
        files,
        main    
    };
}

export const prerender = false