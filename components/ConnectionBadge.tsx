import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { AppTheme, Spacing, Radius } from '../constants/theme';

interface ConnectionBadgeProps {
  isConnected: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

export function ConnectionBadge({
  isConnected,
  lastUpdated,
  error,
}: ConnectionBadgeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isConnected, pulseAnim]);

  const dotColor = isConnected
    ? AppTheme.colors.secondary
    : AppTheme.colors.error;

  const label = isConnected ? 'ONLINE' : 'OFFLINE';
  const sub = isConnected
    ? lastUpdated
      ? `Last update: ${lastUpdated.toLocaleTimeString()}`
      : 'Connecting…'
    : error ?? 'Unable to reach rover';

  return (
    <View
      style={[
        styles.container,
        { borderColor: isConnected ? AppTheme.colors.secondary : AppTheme.colors.error },
      ]}
    >
      <Animated.View
        style={[styles.dot, { backgroundColor: dotColor, opacity: pulseAnim }]}
      />
      <View style={styles.textGroup}>
        <Text style={[styles.label, { color: dotColor }]} variant="labelMedium">
          {label}
        </Text>
        <Text style={styles.sub} variant="bodySmall">
          {sub}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  textGroup: {
    flex: 1,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  sub: {
    color: AppTheme.colors.onSurfaceVariant,
    marginTop: 2,
  },
});
