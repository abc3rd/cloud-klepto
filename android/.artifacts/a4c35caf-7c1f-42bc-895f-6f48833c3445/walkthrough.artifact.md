# Walkthrough - Resolved "package com.getcapacitor.android does not exist" Error

I have fixed the build error that occurred when compiling the `:capacitor-android` library.

## Changes

### Capacitor Android Library

#### [MODIFY] [build.gradle](file:///C:/Users/tegdg/Documents/GitHub/cloud-klepto/node_modules/@capacitor/android/capacitor/build.gradle)

The `namespace` was incorrectly set to `com.cloudklepto.app` (the app's package name). I restored it to `com.getcapacitor.android`.

```diff
 android {
-    namespace = "com.cloudklepto.app"
+    namespace = "com.getcapacitor.android"
     compileSdk = project.hasProperty('compileSdkVersion') ? rootProject.ext.compileSdkVersion : 36
```

## Verification Results

### Automated Tests
- Executed `./gradlew :capacitor-android:compileDebugJavaWithJavac`.
- **Result:** Build finished successfully.

> [!NOTE]
> This change ensures that the generated `R` class for the Capacitor library is in the correct package (`com.getcapacitor.android`), which is what the library's Java source files expect.
