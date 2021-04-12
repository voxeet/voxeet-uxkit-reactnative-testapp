# Voxeet UXKit React Native Test App

## SDK License agreement

Before using the react-native plugin, please review and accept the [Dolby Software License Agreement](SDK_LICENSE.md).

## Getting started

Clone the current repository into your local environment, then :

```
npm install
```

## Mandatory modifications

### iOS

1. Open the Xcode workspace ios/testappvoxeet.xcworkspace

2. Go to the target settings -> 'Signing & Capabilities' -> '+ Capability' -> 'Background Modes'
    - Turn on 'Audio, AirPlay and Picture in Picture'  
    - Turn on 'Voice over IP'

    Check should be already checked

    If you want to support CallKit (receiving incoming call when application is killed) with VoIP push notification, enable 'Push Notifications' (you will need to upload your [VoIP push certificate](https://developer.apple.com/account/ios/certificate/) to the [Dolby.io Dashboard](https://dolby.io/dashboard/)).

3. Open a terminal and go to ios
    ```bash
    pod install
    ```
    
    There is a known bug from the library FBReactNativeSpec. You have to go into your `Pods` project in Xcode workspace, select `FBReactNativeSpec` target, "Build Phases" section, drag and drop "[CP-User] Generate Specs" step just under "Dependencies" step (2nd position). You have to do this step after every pod install or pod update.

### Android

1. Two possibilities regarding the libraries of libc++_shared here :

    - **Option 1**

    Patch the AAR directly to remove the outdated libc++_shared using :

    ```
    bash ./node_modules/@voxeet/react-native-voxeet-conferenceki/patch.react.aar.sh
    ```

    - **Option 2**

    If patching is an issue for you, a pickFirst option must be used for the libc++ shared object but it may introduce some issues in some versions of React-Native due to different ABIs :

    ```gradle
    android { //WARNING : don't use it if you already patched the react native env using above script
        packagingOptions {
            pickFirst '**/armeabi-v7a/libc++_shared.so'
            pickFirst '**/x86/libc++_shared.so'
            pickFirst '**/arm64-v8a/libc++_shared.so'
            pickFirst '**/x86_64/libc++_shared.so'
        }
    }
    ```