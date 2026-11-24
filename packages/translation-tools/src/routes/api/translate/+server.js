import { json } from '@sveltejs/kit';
import { translateKey } from '../../../lib/deepl.js'

export async function POST({ request }) {
    const data = await request.json()
    console.log(data)
    const result = await translateKey(data.value,  data.locale, data.context);

    return json({ result });
}