import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, SafeAreaView, Button, Alert } from 'react-native';
import {
  RTCView,
  registerGlobals,
  mediaDevices
} from 'react-native-webrtc';
registerGlobals();
import { Director, View as MillicastView, Logger as MillicastLogger, Publish } from '@millicast/sdk';
import { useEffect, useState } from 'react';
import { Colors } from 'react-native/Libraries/NewAppScreen';

import config from './millicastConfig';

MillicastLogger.setLevel(MillicastLogger.DEBUG);  // Global logging level.

let millicastPublish = null;
let millicastView = null;

export default function App() {

  const [stream, setStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [connectionState, setConnectionState] = useState('');
  const [publishOrSubscribe, setPublishOrSubscribe] = useState('');

  useEffect(() => {

    async function receive() {

      const tokenGenerator = () => Director.getSubscriber({
        streamName: config.streamName,
        streamAccountId: config.streamAccountId
      });
      try {
        //Create a new instance
        millicastView = new MillicastView(config.streamName, tokenGenerator, null);

        millicastView.on('connectionStateChange', (state) => {
          setConnectionState(state);
        });

        millicastView.on('track', async (e) => {
          if (e.track.kind === 'video') {
            setStream(e.streams[0]);
          }
        })

        //Start connection to publisher
        console.log('connecting to millicast');
        await millicastView.connect();
        console.log('connected to millicast?');
      } catch (e) {
        Alert.alert(
          'Error subscribing to feed',
          e?.response?.data?.data?.message || e.message || null,
          [
            { text: "OK", onPress: () => setPublishOrSubscribe(null) }
          ]
        );
      }
    }

    if (publishOrSubscribe === 'subscribe') {
      receive();
    }
  }, [publishOrSubscribe]);


  useEffect(() => {
    async function send() {
      //Define callback for generate new tokens
      const tokenGenerator = () => Director.getPublisher({
        token: config.token,
        streamName: config.streamName
      });

      //Create a new instance
      try {
        millicastPublish = new Publish(config.streamName, tokenGenerator);

        millicastPublish.on('connectionStateChange', (state) => {
          setConnectionState(state);
        });

        //Publishing Options
        const broadcastOptions = {
          mediaStream: localStream
        };

        await millicastPublish.connect(broadcastOptions);
      } catch (e) {
        console.error('Connection failed, handle error', e);
        Alert.alert(
          'Error publishing feed',
          e?.response?.data?.data?.message || e.message || null
          [
            { text: "OK", onPress: () => setPublishOrSubscribe(null) }
          ]
        );
      }
    }

    async function start() {
      try {
        const s = await mediaDevices.getUserMedia({ video: true });
        setLocalStream(s);
      } catch(e) {
        console.error(e);
        Alert.alert(
          'Error getting camera',
          e.message
          [
            { text: "OK", onPress: () => console.log("OK Pressed") }
          ]
        );
      }
    }

    if (publishOrSubscribe === 'publish') {
      if (!localStream) {
        start();
        return;
      }

      send();
    }
  }, [publishOrSubscribe, localStream]);

  return (
    <>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.container}>
        {!publishOrSubscribe ?
          <>
            <Button title="Publish" onPress={() => {
              setPublishOrSubscribe('publish');
            }} />
            <Button title="Subscribe" onPress={() => {
              setPublishOrSubscribe('subscribe');
            }} />
          </>
        :
          <>
            <Text>Connection State: {connectionState}</Text>
            {localStream && publishOrSubscribe === 'publish' ? <RTCView style={{height: 150, width: 150}} zOrder={20} objectFit={"cover"} mirror={true} streamURL={localStream.toURL()}/> : null }
            {stream && publishOrSubscribe === 'subscribe' ? <RTCView style={{height: 150, width: 150}} zOrder={20} objectFit={"cover"} streamURL={stream.toURL()}/> : null }
            {connectionState === 'connected' ? <Button title="Disconnect" onPress={() => {
              if (publishOrSubscribe === 'publish') {
                millicastPublish.stop();
              } else {
                millicastView.stop();
              }
              setPublishOrSubscribe(null);
              setConnectionState('');
            }} /> : null }
          </>
        }
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.white,
    ...StyleSheet.absoluteFill
  },
  stream: {
    flex: 1,
  }
});
