import React from 'react';
import { NativeTabs, Label } from 'expo-router/unstable-native-tabs';
import { IconSymbol } from '@/components/IconSymbol';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <IconSymbol
          ios_icon_name="camera.viewfinder"
          android_material_icon_name="camera-alt"
          size={24}
          color="#8B4513"
        />
        <Label>Identify</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(history)">
        <IconSymbol
          ios_icon_name="clock.arrow.circlepath"
          android_material_icon_name="history"
          size={24}
          color="#8B4513"
        />
        <Label>History</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
