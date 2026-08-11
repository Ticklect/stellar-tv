import org.gradle.api.tasks.Copy

plugins {
    id("com.android.application")
}

val appVersion = "0.5.0"
val generatedNavigationAssets = layout.buildDirectory.dir("generated/tv-navigation-assets")

val syncTvNavigation by tasks.registering(Copy::class) {
    description = "Copies the existing Tizen navigation module into the Android build."
    from(rootProject.file("../main.js"))
    into(generatedNavigationAssets)
    rename { "tv-navigation.js" }
}

android {
    namespace = "io.github.ticklect.goatedtv"
    compileSdk = 36

    defaultConfig {
        applicationId = "io.github.ticklect.goatedtv"
        minSdk = 23
        targetSdk = 36
        versionCode = 5
        versionName = appVersion

        testInstrumentationRunner = "android.test.InstrumentationTestRunner"
    }

    sourceSets.getByName("main").assets.directories.add(generatedNavigationAssets.get().asFile.absolutePath)

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    val releaseStoreFile = providers.environmentVariable("GOATED_ANDROID_KEYSTORE").orNull
    val releaseStorePassword = providers.environmentVariable("GOATED_ANDROID_STORE_PASSWORD").orNull
    val releaseKeyAlias = providers.environmentVariable("GOATED_ANDROID_KEY_ALIAS").orNull
    val releaseKeyPassword = providers.environmentVariable("GOATED_ANDROID_KEY_PASSWORD").orNull
    val hasReleaseSigning = listOf(
        releaseStoreFile,
        releaseStorePassword,
        releaseKeyAlias,
        releaseKeyPassword,
    ).all { !it.isNullOrBlank() }

    signingConfigs {
        if (hasReleaseSigning) {
            create("release") {
                storeFile = file(requireNotNull(releaseStoreFile))
                storePassword = releaseStorePassword
                keyAlias = releaseKeyAlias
                keyPassword = releaseKeyPassword
            }
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.findByName("release")
        }
    }

    testOptions {
        unitTests.isIncludeAndroidResources = false
    }

    packaging {
        resources.excludes += setOf("META-INF/AL2.0", "META-INF/LGPL2.1")
    }
}

tasks.named("preBuild").configure {
    dependsOn(syncTvNavigation)
}

dependencies {
    testImplementation("junit:junit:4.13.2")
}
