---
title: "Baseline Profiles"
file: "StartupBenchmark.kt"
caption: "Faster cold starts and smoother scrolling: the first-run code paths are compiled ahead of time and measured."
order: 9
relatedProjects: [phone-call, messages-compose, alarm-clock]
notes:
  - line: 3
    text: "BaselineProfileRule records which classes and methods the app uses on its hot paths."
  - line: 9
    text: "Scripted user journeys (start, then scroll) give the profile the code that matters most."
  - line: 14
    text: "MacrobenchmarkRule measures the real installed app on a real device."
  - line: 20
    text: "Compares startup with the profile applied, so the speed-up is a number rather than a guess."
---

```kotlin
@RunWith(AndroidJUnit4::class)
class BaselineProfileGenerator {
    @get:Rule val rule = BaselineProfileRule()

    @Test
    fun generate() = rule.collect(packageName = TARGET_PACKAGE) {
        pressHome()
        startActivityAndWait()             // cold-start path
        device.findObject(By.res("list")).scroll(Direction.DOWN, 2f)
    }
}

class StartupBenchmark {
    @get:Rule val rule = MacrobenchmarkRule()

    @Test
    fun coldStart() = rule.measureRepeated(
        packageName = TARGET_PACKAGE,
        metrics = listOf(StartupTimingMetric()),
        compilationMode = CompilationMode.Partial(BaselineProfileMode.Require),
        iterations = 10,
        startupMode = StartupMode.COLD,
    ) { pressHome(); startActivityAndWait() }
}
```
