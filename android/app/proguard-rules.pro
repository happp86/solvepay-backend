# Add project specific ProGuard rules here.

# ─── React Native ───────────────────────────────────────────────────────────
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.swmansion.** { *; }
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**
-dontwarn com.facebook.jni.**

# ─── Kotlin ────────────────────────────────────────────────────────────────
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-dontwarn kotlin.**

# ─── Firebase ──────────────────────────────────────────────────────────────
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# ─── AsyncStorage ──────────────────────────────────────────────────────────
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# ─── Image Picker ──────────────────────────────────────────────────────────
-keep class com.imagepicker.** { *; }

# ─── Reanimated ────────────────────────────────────────────────────────────
-keep class com.swmansion.reanimated.** { *; }

# ─── OkHttp / Networking ───────────────────────────────────────────────────
-keep class okhttp3.** { *; }
-keep class okio.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# ─── Gson / JSON ───────────────────────────────────────────────────────────
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**

# ─── App entry point ───────────────────────────────────────────────────────
-keep class com.solvepay.** { *; }
-keep class com.solvepay.MainApplication { *; }
-keep class com.solvepay.MainActivity { *; }

# ─── General Android ───────────────────────────────────────────────────────
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
