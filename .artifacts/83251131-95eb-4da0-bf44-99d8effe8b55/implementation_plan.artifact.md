# Application ID Migration Plan

## Goal
Change the application ID from current value to `com.cloudklepto.app` for all Android Play Store releases.

## User Review Required

### ⚠️ Breaking Changes & Important Considerations

1. **Package Name Change**: This will change your app's package name in Google Play Console, which may require:
   - Creating a new app listing or transferring the existing one
   - Updating internal tracking URLs and deep links
   - Users with the old APK already installed won't see updates unless you use a package migration path

2. **Files That Will Be Updated**:
   - `app/build.gradle.kts` (or similar) - Application ID configuration
   - `src/main/AndroidManifest.xml` - Package attribute in manifest
   - Any resource files with hardcoded package references
   - ProGuard/R8 rules if they reference the old package
   - Test source files

3. **Backward Compatibility**: This is a breaking change. Users who already installed the old app will need to:
   - Uninstall before updating, OR
   - You implement a special compatibility layer (not recommended for major ID changes)

## Proposed Changes

### Files to Modify

#### [MODIFY] `app/build.gradle.kts` (or module-level build file)
Update `applicationId` from current value to `com.cloudklepto.app`

#### [MODIFY] `src/main/AndroidManifest.xml`
Update `android:package` attribute in the `<manifest>` tag

#### [CHECK] Resource & Code References
Search for any hardcoded references to the old package name that may need updating

## Open Questions

1. **What is the current application ID?** - Need to identify the exact current package name before making changes
2. **Do you want this change across all modules or just app module?**
3. **How do you plan to handle Google Play Console listing** (new app, transfer existing, etc.)?

## Verification Plan

1. Clean and rebuild the project
2. Build APK/AAB for upload to Play Console
3. Verify package name in build output
4. Check that all resources load correctly with new package
