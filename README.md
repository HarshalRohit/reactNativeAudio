# reactNativeAudio
A simple react-native app to record audio and send to server.


## Description
This project is part of my attempt to learn React-Native. <br />
It is similar to [reactAudio](https://github.com/HarshalRohit/reactAudio). <br />


## Screenshot
![Image](./appImage.png)


## Features
Request permission for microphone access (tested on Android). <br />
Start/Stop recording <br />
Disable buttons based on the recording state. <br />
Show user various status updates while recording and uploading files. <br />
Upload files to server using `multipart/form-data` (looking for better solutions). <br />
Input field to changes Upload Url 


## Third-party libraries used
Special thanks to developers of following libraries <br />
* [react-native-audio-toolkit](https://github.com/react-native-community/react-native-audio-toolkit)
* [rn-fetch-blob](https://github.com/joltup/rn-fetch-blob)


## Environment Setup
Follow the steps mentioned [here](https://reactnative.dev/docs/environment-setup) for **React Native CLI Quickstart**.

## Usage
1. After environment setup, run `npm install` to install dependencies.
2. In the project directory, run `npm start` to start development server.
3. In another terminale, run `npx react-native run-android` to run on an android device or emulator.

## ISSUES

+ I tried the release variant by running `npx react-native run-android --variant=release` during which I faced the following issue:  
`Error: CLEARTEXT communication to **** not permitted by network security policy.`  
[Solution](https://stackoverflow.com/questions/45940861/android-8-cleartext-http-traffic-not-permitted): I fixed it by adding the following line in `./android/src/main/AndroidManifest.xml`  
```
<application
...
android:usesCleartextTraffic="true"
... >
```

## Note
Server setup required, Also modify `uploadUrl` in [App.js](./App.js) accordingly. <br />
You can use the [server](https://github.com/HarshalRohit/express-try) specifically created for this project.


## License
[MIT](LICENSE)
