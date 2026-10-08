---
title: "Flow & StateFlow"
file: "AlbumsViewModel.kt"
caption: "One reactive UI state, rebuilt whenever the data, the settings or the search text change."
order: 2
relatedProjects: [gallery-pro, gallery-photo-album, phone-call]
notes:
  - line: 6
    text: "User input is a StateFlow too, so it can be combined like any other source."
  - line: 8
    text: "combine re-runs the block whenever any source emits, so there is no manual refresh code."
  - line: 11
    text: "debounce(300) waits for the user to stop typing before filtering."
  - line: 18
    text: "WhileSubscribed(5_000) keeps the flow alive through a screen rotation, but stops it when the app is in the background."
---

```kotlin
class AlbumsViewModel(
    repository: MediaRepository,
    settings: SettingsRepository,
) : ViewModel() {

    private val query = MutableStateFlow("")

    val state: StateFlow<AlbumsState> = combine(
        repository.albums(),
        settings.sortOrder,
        query.debounce(300),
    ) { albums, sort, q ->
        AlbumsState(
            albums = albums
                .filter { it.name.contains(q, ignoreCase = true) }
                .sortedWith(sort.comparator),
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), AlbumsState())

    fun onSearch(text: String) { query.value = text }
}
```
