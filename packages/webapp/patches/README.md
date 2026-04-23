# patches/

## terra-draw@1.28.8.patch

**Root cause of the bug this patches:**

Terra-draw's base adapter (`packages/terra-draw/src/common/base.adapter.ts`, line 326) guards its
`pointerup` handler with:

```js
if (event.target !== this.getMapEventElement('pointerup')) return;
```

This uses strict identity (`===`). On the Google Maps adapter, `getMapEventElement("pointerup")`
returns the specific overlay `<div>` with `z-index: 3` that terra-draw attaches its listeners to.

Intermittently — but always when placing the 3rd or 4th vertex (suggesting polygon fill plays a
part) — a `pointerup` event resolves to a child element of that div rather than the div itself. The
exact trigger conditions are not fully understood, but the pattern was observed consistently in
manual testing: the click is confirmed inside the `z-index: 3` subtree but the strict `===` check
against the root of that subtree fails, so terra-draw silently drops it. In practice this freezes
polygon drawing mode mid-draw until the user clicks again.

**What the patch changes:**

```diff
- event.target !== this.getMapEventElement("pointerup")
+ !this.getMapEventElement("pointerup").contains(event.target)
```

`.contains()` accepts any click whose target is anywhere inside the adapter's container subtree,
which is the semantically correct check. This is applied to all four minified dist bundles
(`terra-draw.cjs`, `.modern.js`, `.module.js`, `.umd.js`) because pnpm patches the published
package, not the source.

**Upstream status:**

TODO: A bug report should be filed with the terra-draw maintainer. Update this line with a link
to the issue once opened. Depending on the response, there may be a fix in a future terra-draw
release — check the changelog when bumping the version.

**Removal:**

When terra-draw ships a release that includes this fix upstream:

1. Remove the `"terra-draw@1.28.8"` entry from `patchedDependencies` in `package.json`
2. Delete this patch file
3. Bump `terra-draw` (and `terra-draw-google-maps-adapter` if needed) to the fixed version
4. Run `pnpm install` and manually test polygon drawing to confirm the fix is present
