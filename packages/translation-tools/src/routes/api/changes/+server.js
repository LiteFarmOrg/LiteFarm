import { json } from '@sveltejs/kit';
import { files, write } from '$lib/server/files'

export async function POST({ request }) {
    const changes = await request.json();

    changes.map(change => {
        if (change.value === '__REMOVED__') {
            delete files[change.locale][change.file][change.key]
        } else {
            files[change.locale][change.file][change.key] = change.value
        }
    })

    write(files)

    return json({
        status: 200,
        message: 'Data received successfully'
    })
}
