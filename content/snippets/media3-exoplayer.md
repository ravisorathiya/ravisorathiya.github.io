---
title: "Media3 ExoPlayer"
file: "VideoPlayer.kt"
caption: "Video and audio playback wrapped in a Compose-friendly, leak-free player."
order: 7
relatedProjects: [gallery-pro, alarm-clock, messages-compose]
notes:
  - line: 4
    text: "remember keeps one player across recompositions instead of building a new one each frame."
  - line: 10
    text: "LaunchedEffect(uri) swaps the media when the uri changes and reuses the same player."
  - line: 15
    text: "release() in onDispose frees the hardware decoders when the composable leaves the screen."
  - line: 17
    text: "AndroidView embeds the classic PlayerView (controls, subtitles) inside Compose."
---

```kotlin
@Composable
fun VideoPlayer(uri: Uri, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val player = remember {
        ExoPlayer.Builder(context).build().apply {
            repeatMode = Player.REPEAT_MODE_ONE
            playWhenReady = true
        }
    }
    LaunchedEffect(uri) {
        player.setMediaItem(MediaItem.fromUri(uri))
        player.prepare()
    }
    DisposableEffect(Unit) {
        onDispose { player.release() }
    }
    AndroidView(
        factory = { PlayerView(it).apply { this.player = player } },
        modifier = modifier,
    )
}
```
