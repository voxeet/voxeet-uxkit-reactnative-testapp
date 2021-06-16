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

3. Open a terminal and use the script 
    ```bash
    bash ./pod.sh
    ```
    
## Android - Enable FCM

**Create a Firebase project**

- navigate to `https://console.firebase.google.com/`
- create a new project
- Then configure the environment depending on the platform you want to use (if iOS and Android are required, use the same project)


**Add the android app declaration**

- create your own package name, change `com.testappvoxeet` to `your.own.package` in the `android/app/build.gradle` file
- from the dashboard, add a new Android app
- set the package you previously set in the build.gradle file
- download the `google-services.json` file and put it into `android/app/`

**Configure dolby.io portal**

- from the Firebase's project, navigate to the configuration,
- in the `Cloud Messaging` tab, copy the `server key` and paste it inside your dolby.io project IAPi configuration page from [Dolby.io's dashboard](https://dolby.io/dashboard/applications/summary)

*To receive invitation, always set your externalId when logging in the app, it's the identifier used to invite people and receive invitations*
