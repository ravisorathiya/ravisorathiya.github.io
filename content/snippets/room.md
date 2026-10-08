---
title: "Room"
file: "AlarmDao.kt"
caption: "A typed SQLite layer whose queries return Flows, so the UI updates itself when data changes."
order: 5
relatedProjects: [alarm-clock, phone-call, messages-compose, pdf-reader]
notes:
  - line: 6
    text: "A TypeConverter stores Set<DayOfWeek> in a single column."
  - line: 13
    text: "Returning Flow means Room re-emits whenever the alarms table changes, so the list never goes stale."
  - line: 15
    text: "@Upsert inserts a new alarm or updates an existing one in a single call."
  - line: 19
    text: "suspend functions run off the main thread automatically."
---

```kotlin
@Entity(tableName = "alarms")
data class AlarmEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val hour: Int,
    val minute: Int,
    val days: Set<DayOfWeek>,
    val enabled: Boolean = true,
)

@Dao
interface AlarmDao {
    @Query("SELECT * FROM alarms ORDER BY hour, minute")
    fun observeAll(): Flow<List<AlarmEntity>>

    @Upsert
    suspend fun upsert(alarm: AlarmEntity)

    @Query("UPDATE alarms SET enabled = :on WHERE id = :id")
    suspend fun setEnabled(id: Long, on: Boolean)
}
```
