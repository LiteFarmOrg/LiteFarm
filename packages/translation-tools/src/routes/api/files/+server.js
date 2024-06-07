import { files } from '$lib/server/files'

export function GET() {
    return {
        files
    }
}