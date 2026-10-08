---
title: "Gradle KTS"
file: "build.gradle.kts"
caption: "Multi-module builds in Kotlin DSL with one version catalog, so every module shares the same versions."
order: 10
relatedProjects: [pdf-reader, phone-call, messages-compose]
notes:
  - line: 3
    text: "Plugins come from gradle/libs.versions.toml, so versions are declared once and used everywhere."
  - line: 9
    text: "Even SDK levels live in the catalog, so a single edit upgrades every module."
  - line: 14
    text: "Feature modules depend on :domain only and never on each other. This keeps builds fast and boundaries clean."
  - line: 16
    text: "Bundles group related libraries (all of CameraX) into one line."
---

```kotlin
// presentation/scanner/build.gradle.kts
plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "app.scanner"
    compileSdk = libs.versions.compileSdk.get().toInt()
    buildFeatures { compose = true }
}

dependencies {
    implementation(project(":domain"))
    implementation(platform(libs.compose.bom))
    implementation(libs.bundles.camerax)
    implementation(libs.androidx.work.runtime)
    testImplementation(libs.junit)
}
```
