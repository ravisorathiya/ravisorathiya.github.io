---
title: "Jetpack Compose"
file: "GalleryScreen.kt"
caption: "Stateless, previewable UI: state flows down, events flow up. Tap the chips in the preview to fire onSelect."
order: 1
preview: compose-filter
relatedProjects: [gallery-pro, messages-compose, pdf-reader]
notes:
  - line: 2
    text: "Stateless composable: it receives state and reports events (state hoisting), so it is easy to preview, reuse and test."
  - line: 11
    text: "MediaType.entries drives the chips, so adding a new media type adds a chip with no UI changes."
  - line: 14
    text: "The chip doesn't change anything itself. It just reports the tap upwards, and the ViewModel decides what happens."
  - line: 23
    text: "collectAsStateWithLifecycle stops collecting when the screen goes to the background, which saves battery."
  - line: 24
    text: "A method reference (vm::setFilter) wires the event straight to the ViewModel."
---

```kotlin
@Composable
fun MediaFilterBar(
    selected: MediaType,
    onSelect: (MediaType) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        MediaType.entries.forEach { type ->
            FilterChip(
                selected = type == selected,
                onClick = { onSelect(type) },
                label = { Text(type.label) },
            )
        }
    }
}

@Composable
fun GalleryScreen(vm: GalleryViewModel = hiltViewModel()) {
    val state by vm.state.collectAsStateWithLifecycle()
    MediaFilterBar(state.filter, onSelect = vm::setFilter)
    MediaGrid(state.visibleItems)
}
```
