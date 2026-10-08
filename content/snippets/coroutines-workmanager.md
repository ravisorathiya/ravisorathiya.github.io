---
title: "Coroutines & WorkManager"
file: "TrashCleanupWorker.kt"
caption: "Reliable background jobs that survive app restarts and reboots, written as plain suspend code."
order: 6
relatedProjects: [pdf-reader, messages-compose, gallery-pro]
notes:
  - line: 4
    text: "CoroutineWorker lets doWork() be a suspend function, with no callbacks or threads to manage."
  - line: 6
    text: "File work moves to Dispatchers.IO so the main thread is never blocked."
  - line: 9
    text: "A failure returns retry(), and WorkManager tries again later with backoff."
  - line: 18
    text: "Unique work with KEEP means scheduling it twice never creates duplicate jobs."
---

```kotlin
class TrashCleanupWorker(
    context: Context,
    params: WorkerParameters,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val cutoff = System.currentTimeMillis() - 30.days.inWholeMilliseconds
        runCatching { TrashStore.from(applicationContext).deleteOlderThan(cutoff) }
            .fold(onSuccess = { Result.success() }, onFailure = { Result.retry() })
    }
}

fun scheduleTrashCleanup(context: Context) {
    val request = PeriodicWorkRequestBuilder<TrashCleanupWorker>(1, TimeUnit.DAYS)
        .setConstraints(Constraints.Builder().setRequiresBatteryNotLow(true).build())
        .build()
    WorkManager.getInstance(context)
        .enqueueUniquePeriodicWork("trash-cleanup", ExistingPeriodicWorkPolicy.KEEP, request)
}
```
