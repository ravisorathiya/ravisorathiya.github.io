---
title: "Hilt"
file: "RepositoryModule.kt"
caption: "Dependency injection with compile-time checks: no factories and no hand-wired singletons."
order: 3
relatedProjects: [gallery-pro, messages-compose]
notes:
  - line: 1
    text: "@HiltAndroidApp creates the app-wide dependency graph when the app starts."
  - line: 7
    text: "@Binds maps an interface to its implementation. Hilt generates the code."
  - line: 11
    text: "@Inject on the constructor tells Hilt how to build this class, with nothing else to register."
  - line: 16
    text: "@HiltViewModel lets screens get a ready-made ViewModel with hiltViewModel()."
---

```kotlin
@HiltAndroidApp
class GalleryApp : Application()

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds @Singleton
    abstract fun bindMediaRepository(impl: MediaRepositoryImpl): MediaRepository
}

class MediaRepositoryImpl @Inject constructor(
    private val dao: MediaDao,
    @ApplicationContext private val context: Context,
) : MediaRepository { /* … */ }

@HiltViewModel
class AlbumsViewModel @Inject constructor(
    private val getAlbums: GetAlbumsUseCase,
) : ViewModel()
```
