# Millicast React Native Expo Demo

This repo contains the base of a Expo sample app using the [Millicast Javascript SDK](https://github.com/millicast/millicast-sdk). We use expo so that people can get going very quickly without needing to know too much about react-native but the demo is so small, you could copy one component and a patch directory into a "bare" react-native app and everything would work fine.

## ❗ This demo app does not work in android _yet_ ❗

It will do, we just need to finalise the patch file that enables [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc) to work with the Millicast SDK.

## ❗ Even though this demo app uses expo, it will likely only ever support ios and android ❗

## Getting Started

To get started, setup your expo environment by [following the steps over in the expo docs](https://docs.expo.dev/)

Once, you've got your environment setup, clone down this repo and install it's dependencies using `yarn`; yes this project uses [Yarn](https://yarnpkg.com/) and will have the relevant lockfile for Yarn.

By running `yarn` you'll also patch both `@millicast/sdk` and `react-native-webrtc` with the relevant changes to both packages to make them run together.

You'll want to change the values in `millicastConfig.js` to the relevant values from your Millicast account for the stream you want to subscribe/publish to.

Then just run `expo run:ios` or `expo run:ios --device` to get going running it on an ios device or simulator.
## Running these changes in your own project.

You'll want to copy the `patches` directory into your project and add go through the necessary steps to add [patch-package](https://www.npmjs.com/package/patch-package) to your project as well as `react-native-webrtc@1.94.1` and `@millicast/sdk@0.1.19`

