---
title: "CameraX"
file: "ScannerCamera.kt"
caption: "Document scanning: a lifecycle-aware camera feeding frames to on-device edge detection."
order: 8
relatedProjects: [pdf-reader]
notes:
  - line: 2
    text: "MINIMIZE_LATENCY makes the shutter feel instant, which suits scanning many pages in a row."
  - line: 10
    text: "bindToLifecycle opens and closes the camera with the screen. There is no manual cleanup."
  - line: 17
    text: "Each frame goes to on-device edge detection, then crop, filters and finally the PDF."
  - line: 18
    text: "Closing the ImageProxy frees the buffer. Forgetting it stalls the camera."
---

```kotlin
val imageCapture = ImageCapture.Builder()
    .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
    .build()

val preview = Preview.Builder().build().also {
    it.setSurfaceProvider(previewView.surfaceProvider)
}

cameraProvider.unbindAll()
val camera = cameraProvider.bindToLifecycle(
    lifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageCapture,
)

fun capturePage(onPage: (Bitmap) -> Unit) =
    imageCapture.takePicture(executor, object : ImageCapture.OnImageCapturedCallback() {
        override fun onCaptureSuccess(image: ImageProxy) {
            onPage(image.toBitmap())   // → edge detection → crop → PDF
            image.close()
        }
    })
```
