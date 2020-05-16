/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import {PermissionsAndroid} from 'react-native';
import {Recorder} from '@react-native-community/audio-toolkit';
import RNFetchBlob from 'rn-fetch-blob';

import {StyleSheet, View, Text, Button} from 'react-native';

// https://reactnative.dev/docs/permissionsandroid

function App() {
  const [isRecordBtnDisabled, disableRecordBtn] = useState(false);
  const [isStopBtnDisabled, disableStopBtn] = useState(true);
  const [isUploadBtnDisabled, disableUploadBtn] = useState(true);
  const [statusText, setStatusText] = useState(
    'Status updates will appear here!',
  );
  const [recordingFspath, setRecordingFspath] = useState(null);

  var recorder = null;

  async function handleRecordBtnClick() {
    // check and request microphone access
    let canRecord = await requestMicrophone(); //.then(res => console.log(res));

    if (canRecord) {
      // disable record and upload btn
      updateBtnStatus({recordBtn: true, stopBtn: false, uploadBtn: true});

      // setup recorder
      reloadRecorder();

      setStatusText('Recording Started.');
    } else {
      // disable stop and upload btn
      updateBtnStatus({recordBtn: false, stopBtn: true, uploadBtn: true});
    }
  }

  const handleStopBtnClick = () => {
    this.recorder.stop();

    setStatusText('Recording Stopped.');

    // this.recorder.destroy();
    updateBtnStatus({recordBtn: false, stopBtn: true, uploadBtn: false});
  };

  async function handleUploadBtnClick() {
    let fileExist = await RNFetchBlob.fs.exists(recordingFspath).then(exist => {
      return exist;
    });

    if (fileExist) {
      uploadFile();
    } else {
      setStatusText('File not recorded properly\nRecord Again!');
      // updateBtnStatus({recordBtn: false, stopBtn: true, uploadBtn: true});
    }
  }

  // unified location to disable btns
  // will modify later with better logic based on recorder status
  const updateBtnStatus = statusObj => {
    disableRecordBtn(
      statusObj.hasOwnProperty('recordBtn')
        ? statusObj.recordBtn
        : isRecordBtnDisabled,
    );

    disableStopBtn(
      statusObj.hasOwnProperty('stopBtn')
        ? statusObj.stopBtn
        : isStopBtnDisabled,
    );

    disableUploadBtn(
      statusObj.hasOwnProperty('uploadBtn')
        ? statusObj.uploadBtn
        : isUploadBtnDisabled,
    );
  };

  async function requestMicrophone() {
    let isAccessAvailable = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ).then(boolVal => boolVal);

    let granted;

    if (!isAccessAvailable) {
      granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'ExampleApp needs access to your microphone to record Audio',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
    } else {
      granted = PermissionsAndroid.RESULTS.GRANTED;
    }

    switch (granted) {
      case PermissionsAndroid.RESULTS.GRANTED:
        setStatusText('Microphone access available\nRecording will start now.');
        break;
      case PermissionsAndroid.RESULTS.DENIED:
        setStatusText('Microphone access denied\nRequest Again!!');
        break;console.log
      case PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN:
        setStatusText(`Microphone access denied.\nPlease change from system settings.`);
        break;
    }

    if (granted === PermissionsAndroid.RESULTS.GRANTED)
      return true;
    else 
      return false;
  }

  const reloadRecorder = () => {
    // docs mention to destroy bt
    //  I am getting unhandled promise error
    // if commented then works
    // if (this.recorder) {
    //   this.recorder.destroy();
    //   // this.recorder = null;
    // }

    const recorderConfig = {
      // bitrate: 256000,
      channels: 2,
      // sampleRate: 44100,
      quality: 'max',
    };

    const filename = 'test.wav';

    // can improve but its working :p :(
    this.recorder = new Recorder(filename, recorderConfig)
      .prepare((err, fsPath) => {
        if (err) {
          console.log(err);
          return;
        }
        setRecordingFspath(fsPath);
        this.recorder.on('error', handleRecorderError);
      })
      .record(err => {
        if (err) console.log(`err in record(): ${{err}}`);
        setStatusText('Recording');
        // console.log(`in record() ${this.recorder._state}`);
      });
  };

  const handleRecorderError = errObj => {
    console.log(
      `Error in recorder: [err: ${errObj.err}, msg: ${errObj.message}]`,
    );
  };

  const uploadFile = () => {
    updateBtnStatus({recordBtn: true, stopBtn: true, uploadBtn: true});

    const uploadData = RNFetchBlob.wrap(recordingFspath);
    const uploadUrl = 'http://192.168.43.226:3020/upload';

    setStatusText('Uploading...');

    RNFetchBlob.fetch(
      'POST',
      uploadUrl,
      {
        'Content-Type': 'multipart/form-data',
      },
      [
        {
          name: 'avatar',
          filename: 'test.wav',
          type: 'audio/wav',
          data: uploadData,
        },
      ],
    )
      .then(res => {
        console.log(res.text());
        setStatusText('Upload Completed!');
      })
      .catch(err => {
        setStatusText('Upload Error.');
        console.log(err);
      })
      .finally(() => {
        updateBtnStatus({recordBtn: false, stopBtn: true, uploadBtn: false});
      });
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'stretch',
        padding: 10,
      }}>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
      <View style={styles.btnContainer}>
        <Button
          title="Record"
          onPress={handleRecordBtnClick}
          disabled={isRecordBtnDisabled}
        />
      </View>
      <View style={styles.btnContainer}>
        <Button
          title="Stop"
          onPress={handleStopBtnClick}
          disabled={isStopBtnDisabled}
        />
      </View>
      <View style={styles.btnContainer}>
        <Button
          color="#737373"
          title="Upload"
          onPress={handleUploadBtnClick}
          disabled={isUploadBtnDisabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    padding: 5,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 150,
    backgroundColor: 'lavender',
    padding: 10,
    margin: 5,
    // marginBottom: 10,
  },
  statusText: {
    fontSize: 20,
  },
});

export default App;
