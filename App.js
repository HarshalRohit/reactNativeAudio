/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import {PermissionsAndroid, TextInput} from 'react-native';
import {Recorder} from '@react-native-community/audio-toolkit';
import RNFetchBlob from 'rn-fetch-blob';

import {StyleSheet, View, Text, Button} from 'react-native';

// https://reactnative.dev/docs/permissionsandroid

function App() {

  const defualtUploadUrl = 'http://192.168.43.226:3020/upload';
  const defaultStatusText = 'Status updates will appear here!';
  var recorderObj = null;

  const [isRecordBtnDisabled, disableRecordBtn] = useState(false);
  const [isStopBtnDisabled, disableStopBtn] = useState(true);
  const [isUploadBtnDisabled, disableUploadBtn] = useState(true);
  const [statusText, setStatusText] = useState(defaultStatusText);
  const [recordingFspath, setRecordingFspath] = useState(null);
  const [uploadUrl, setUploadUrl] = useState(defualtUploadUrl);

  async function handleRecordBtnClick() {
    // check and request microphone access
    let canRecord = await requestMicrophone();

    if (canRecord) {
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
    this.recorderObj.stop();

    setStatusText('Recording Stopped.');

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

  const validateUploadUrl = () => {
    const emailRegex = /^(https?):\/\/[^\s$.?#].[^\s]*$/gm;
    let isUrlValid = emailRegex.test(uploadUrl);

    if (isUrlValid) {
      setStatusText('Valid Upload URL.');
    } else {
      setStatusText('Invalid Upload URL\nSetting to default Value');
      setUploadUrl(defualtUploadUrl);
    }
  };

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

  async function reloadRecorder() {
    if (this.recorderObj) {
      this.recorderObj.destroy();
    }

    const recorderConfig = {
      // bitrate: 256000,
      channels: 2,
      // sampleRate: 44100,
      quality: 'max',
    };

    const filename = 'test.wav';

    this.recorderObj = new Recorder(filename, recorderConfig);
    this.recorderObj
      .prepare((err, fsPath) => {
        if (err) {
          console.log(err);
          return;
        }
        setRecordingFspath(fsPath);
      })
      .record(err => {
        if (err) console.log(`err in record(): ${{err}}`);
        setStatusText('Recording');
        // console.log(`in record() ${this.recorder._state}`);
      });
    this.recorderObj.on('error', handleRecorderError);
  }

  const handleRecorderError = errObj => {
    console.log(
      `Error in recorder: [err: ${errObj.err}, msg: ${errObj.message}]`,
    );
  };

  const uploadFile = () => {
    updateBtnStatus({recordBtn: true, stopBtn: true, uploadBtn: true});

    const uploadData = RNFetchBlob.wrap(recordingFspath);

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
        // console.log(res.text());
        console.log(res.respInfo.status);
        if (res.respInfo.status === 200) {
          setStatusText('Upload Completed!');
        } else {
          setStatusText('Upload Error');
        }
      })
      .catch(err => {
        setStatusText('Upload Error.\n' + err);
        console.log(err);
      })
      .finally(() => {
        updateBtnStatus({recordBtn: false, stopBtn: true, uploadBtn: false});
      });
  };

  return (
    <View style={styles.body}>
      {/*  Recorder UI */}
      <View style={styles.sectionMain}>
        <View style={styles.statusBox}>
          <Text style={styles.statusText}> {statusText} </Text>
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

      {/* Upload UI container */}
      <View style={styles.sectionBottom}>
        <Text style={styles.textUploadUrl}>Modify Upload Url:</Text>
        <TextInput
          style={styles.textInputUploadUrl}
          onChangeText={text => setUploadUrl(text)}
          value={uploadUrl}
          onFocus={() => setStatusText('Modifying upload URL.')}
          onEndEditing={validateUploadUrl}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    marginTop: 30,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  sectionMain: {
    flex: 3,
    // alignSelf: "flex-start",
    justifyContent: 'center',
    alignItems: 'stretch',
    // backgroundColor: 'powderblue',
    padding: 10,
  },
  sectionBottom: {
    flex: 1,
    // backgroundColor: 'skyblue',
    padding: 15,
    justifyContent: 'center',
    // alignItems: 'center',
    borderTopColor: 'skyblue',
    borderTopWidth: 1,
  },
  statusBox: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    // height: 150,
    flex: 1,
    backgroundColor: 'lavender',
    padding: 10,
    margin: 5,
    // marginBottom: 10,
  },
  statusText: {
    fontSize: 20,
  },
  btnContainer: {
    padding: 5,
  },
  textUploadUrl: {
    fontSize: 20,
  },
  textInputUploadUrl: {
    backgroundColor: 'lavender',
    fontSize: 15,
    // margin: 15,
    // padding: 10,
    // borderColor:
  },
});

export default App;
