---
title: "Clean Architecture"
file: "GetRecentCallsUseCase.kt"
caption: "Business rules live in a pure-Kotlin :domain module. Android, Room and the SDKs stay in :data."
order: 4
relatedProjects: [phone-call, pdf-reader, gallery-pro, messages-compose]
notes:
  - line: 1
    text: "The domain module has no Android imports, so its logic runs in fast plain JVM unit tests."
  - line: 7
    text: "operator fun invoke lets callers write getRecentCalls(), so a use case reads like a function."
  - line: 14
    text: "The data layer implements the domain interface. Dependencies point inwards, never outwards."
  - line: 18
    text: "Room entities are mapped to domain models here, so database types never reach the UI."
---

```kotlin
// :domain (pure Kotlin, no Android imports)
interface CallLogRepository {
    fun recentCalls(): Flow<List<Call>>
}

class GetRecentCallsUseCase(private val repo: CallLogRepository) {
    operator fun invoke(): Flow<List<CallGroup>> =
        repo.recentCalls().map { calls ->
            calls.groupBy { it.number to it.date.toLocalDate() }
                .map { (_, group) -> CallGroup(group) }
        }
}

// :data (Android + Room live here)
class CallLogRepositoryImpl(
    private val dao: CallLogDao,
) : CallLogRepository {
    override fun recentCalls() = dao.observeAll().map { rows -> rows.map { it.toDomain() } }
}
```
