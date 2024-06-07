// DeepL API key
const deeplApiKey = '28ee2af4-e7ae-52c4-fcb9-fabd7bed2456:fx';

// Function to translate text using DeepL API
export async function translateText(text, targetLang, context) {
    try {
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'DeepL-Auth-Key ' + deeplApiKey
            },
            mode: 'no-cors',
            body: JSON.stringify({
                text: [text],
                source_lang: 'EN',
                target_lang: targetLang,
                context: context || 'LiteFarm is the world’s first community-led, not-for-profit, digital platform joining farmers and scientists together for participatory assessment of social, environmental and economic outputs of farming systems. LiteFarm is the first application of its kind specifically tailored to the needs of diversified farmers with built-in pathways to provide expert decision support and help them earn additional income through payment for ecological services (PES) schemes and in-app certifications (such as organic). These approaches serve the multiple purposes of incentivizing adoption of sustainable land use practices through the provision of evidence-based decision support, and significantly increasing the amount of data being collected by diversified farming operations around the globe. It was developed with farmers at the center of the design process and built from the ground up with accessibility and approachability in mind. We are proud of our mission'
            })
        });
        const data = await response.json();
        console.log(data)
        const result = data.translations[0].text;
        return result
    } catch (error) {
        console.error('Error translating text:', error.message);
        return null;
    }
}

async function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export async function translateKey(value, language, context) {
    const pieces = value.split(/(\{\{.*?\}\})/g);
    const translated = await pieces.reduce(async (acc, piece) => {
        console.log(acc, piece)
        if (piece.match(/\{\{(.*)\}\}/g)) {
            acc += piece
        } else {
            await pause(200)
            acc += await translateText(piece, language, context)
            await pause(200)
            console.log(acc)
        }
        return acc
    }, '')

    console.log('translated: ', translated)
    if (translated !== '') {
        return translated;
    } else {
        console.error(`Failed to translate text: ${value}`);
    }
}

// Function to translate JSON object
export async function translateJSON(jsonData, targetLang) {
    for (const key in jsonData) {
        if (typeof jsonData[key] === 'string') {
            jsonData[key] = await translateKey(jsonData[key], targetLang)
        }
        else {
            const translated = await translateJSON(jsonData[key], targetLang)
            jsonData[key] = translated
        }

    }
    return jsonData;
}