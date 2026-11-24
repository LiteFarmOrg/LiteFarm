<script>
	import { onMount } from 'svelte';

	let { data } = $props();
	let keySearch = $state('');
	let localeSearch = $state(Object.fromEntries(Object.keys(data.files).map((key) => [key, ''])));
	let activeColums = $state(Object.keys(data.files));
	let filenames = $state(Object.keys(data.files[data.main]));
	let activeFiles = $state(new Set(filenames));

	let selectedLocale = $state('');
	let selectedFile = $state('');
	let selectedKey = $state('');
	let selectedText = $state('');
	let ENText = $state('');
	let customContext = $state('');

	let dialog;

	const tryRegexp = (string) => {
		try {
			return new RegExp(string, 'i');
		} catch (e) {
			return string.length ? tryRegexp(string.slice(0, -1)) : new RegExp('', 'i');
		}
	};

	let keyRegexp = $derived(tryRegexp(keySearch));
	let localeRegexps = $derived(
		Object.fromEntries(Object.entries(localeSearch).map(([key, value]) => [key, tryRegexp(value)]))
	);

	onMount(() => {
		dialog = document.querySelector('dialog#i18nson-dialog');

		window.addEventListener('message', (message) => {
			const text = message.data;
			console.log(message);
			if (text) {
				for (let locale of activeColums) {
					localeSearch[locale] = text;
				}
			}
		});

		window.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') window.parent.postMessage('close', '*');
		});

		activeColums = ['de', 'en'];
	});

	const changeRequest = (...changes) => {
		return fetch('/api/changes', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify([...changes])
		});
	};

	const translateDeepl = (value, locale, context) => {
		return fetch('/api/translate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ value, locale, context })
		}).then((res) => res.json());
	};

	async function dialogSave() {
		await changeRequest({
			locale: selectedLocale,
			file: selectedFile,
			key: selectedKey,
			value: selectedText
		});
		data.files[selectedLocale][selectedFile][selectedKey] = selectedText;

		dialog.close();
	}

	function dialogCancel() {
		dialog.close();
	}
</script>

<dialog
	id="i18nson-dialog"
	on:keydown={(event) => {
		if (event.key === 'Escape') dialogCancel();
		if (event.key === 'Enter') dialogSave();
		event.stopPropagation();
	}}
>
	<p>
		Key
		{selectedKey} ({selectedLocale}/{selectedFile})
	</p>

	<p>
		EN Text: {data?.files?.en?.[selectedFile]?.[selectedKey]}
	</p>

	<div>
		<div>
			<label for="translated"
				>Translated to <b>
					{selectedLocale}
				</b>
			</label>
			<textarea id="translated" bind:value={selectedText} />
		</div>
		<div>
			<label for="context">Context</label>
			<textarea id="context" bind:value={customContext} />
		</div>
	</div>

	<div class="buttons">
		<button
			on:click={async () => {
				const translation = await translateDeepl(ENText, selectedLocale, customContext);

				selectedText = translation.result;
			}}>Translate (Deepl)</button
		>

		<button
			disabled
			on:click={async () => {
				// const translation = await translateOpenAI(ENText, selectedLocale, customContext);
				// selectedText = translation.result;
			}}
			>Translate (OpenAI)
		</button>

		<button on:click={dialogSave}>Save</button>

		<button on:click={dialogCancel}>Cancel</button>
	</div>
</dialog>

<div
	class="grid header"
	style={`
    grid-template-columns: repeat(${activeColums.length + 1}, calc(90% / ${activeColums.length + 1})
    `}
>
	<div>
		{#each Object.keys(data.files) as locale}
			<button
				class={activeColums.includes(locale) ? 'active' : ''}
				on:click={() => {
					if (activeColums.includes(locale)) {
						activeColums = activeColums.filter((column) => column !== locale);
					} else {
						activeColums = [...activeColums, locale];
					}
				}}
				>{locale}
			</button>
		{/each}
	</div>
	{#each activeColums as locale}
		<b>{locale}</b>
	{/each}

	<input type="text" bind:value={keySearch} />
	{#each activeColums as locale}
		<input type="text" bind:value={localeSearch[locale]} />
	{/each}
</div>

<div
	class="grid"
	style={`grid-template-columns: repeat(${activeColums.length + 1}, calc(90% / ${activeColums.length + 1}) `}
>
	{#each Object.entries(data.files[data.main]) as [file, json]}
		{#each Object.keys(json).filter((key, index) => {
			// if (index > 20) return false;
			if (keySearch !== '') {
				if (key.match(keyRegexp)) return true;
			}
			for (const [locale, filter] of Object.entries(localeSearch)) {
				if (filter !== '') {
					if (data.files[locale][file][key].match(localeRegexps[locale])) return true;
				}
			}
			if (keySearch === '' && Object.values(localeSearch).every((value) => value === '')) {
				return true;
			}
		}) as key}
			<div class="container">
				<button
					on:click={() =>
						changeRequest(
							...activeColums.map((locale) => {
								data.files[locale][file][key] = '__REMOVED__';
								return { locale, file, key, value: '__REMOVED__' };
							})
						)}>x</button
				>
				<b class="break">{key}</b>
				<div>
					({file})
				</div>
			</div>
			{#each activeColums as locale}
				<button
					on:click={() => {
						selectedText = data.files[locale][file][key];
						ENText = data.files.en[file][key];

						selectedLocale = locale;
						selectedKey = key;
						selectedFile = file;

						dialog.showModal();
					}}
					>{data.files[locale][file][key]}
				</button>
			{/each}
		{/each}
	{/each}
</div>

<style>
	.header {
		position: sticky;
		top: 0;
		background-color: lightgray;
		z-index: 100;
	}

	.grid {
		display: grid;
		gap: 1rem;
		width: 100%;
		overflow: hidden;
	}

	.container {
		width: 100%;
		height: 100%;
		overflow: visible;
		position: relative;
		padding: 5px;
	}

	button {
		cursor: pointer;
		margin: 3px;
		box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.3); /* This gives the button a slight shadow */
		transition: box-shadow 0.3s ease; /* This makes the shadow change smoothly */
	}

	button.active {
		background-color: lightgreen;
		transform: translateY(2px);
		box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.5); /* This insets the shadow when the button is pressed */
	}

	/* .container:hover .break {
		background-color: white;
        z-index: 100;
        position: absolute;
        word-break: keep-all;
    } */

	.break {
		word-break: break-all;
	}

	dialog {
		font-size: 150%;
		border-radius: 5px;
		border-width: 1px;
		transition: all 2s;
	}

	textarea {
		width: 100%;
		height: 100px;
	}

	dialog::backdrop {
		background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7));
		animation: fade-in 1s;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
