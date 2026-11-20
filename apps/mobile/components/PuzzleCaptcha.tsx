import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  I18nManager,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";

type PuzzleChallenge = {
  challenge_id: string;
  target: number;
  y: number;
};

type PuzzleCaptchaProps = {
  challenge: PuzzleChallenge | null;
  busy: boolean;
  verified: boolean;
  onRefresh: () => void;
  onVerify: (value: number) => void;
};

const BOARD_HEIGHT = 152;
const PIECE_SIZE = 52;
const TOLERANCE = 3;
const MIN_DRAG_DISTANCE = 18;

export function PuzzleCaptcha({
  challenge,
  busy,
  verified,
  onRefresh,
  onVerify,
}: PuzzleCaptchaProps) {
  const [value, setValue] = useState(8);
  const [trackWidth, setTrackWidth] = useState(1);
  const [trackPageX, setTrackPageX] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const trackRef = useRef<View>(null);
  const valueRef = useRef(value);
  const verificationRequestedFor = useRef<string | null>(null);
  const pulse = useRef(new Animated.Value(0)).current;

  const target = challenge?.target ?? 56;
  const targetY = challenge?.y ?? 50;
  const isAligned = Math.abs(value - target) <= TOLERANCE;

  useEffect(() => {
    valueRef.current = 8;
    verificationRequestedFor.current = null;
    setValue(8);
    setHasDragged(false);
  }, [challenge?.challenge_id]);

  const requestVerification = (nextValue: number) => {
    if (
      !challenge ||
      verificationRequestedFor.current === challenge.challenge_id
    )
      return;
    verificationRequestedFor.current = challenge.challenge_id;
    onVerify(nextValue);
  };

  useEffect(() => {
    if (hasDragged && isAligned && !busy && !verified) {
      requestVerification(valueRef.current);
    }
  }, [busy, hasDragged, isAligned, value, verified]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const updateValue = (nextValue: number) => {
    const clamped = Math.max(8, Math.min(92, Math.round(nextValue)));
    valueRef.current = clamped;
    setValue(clamped);
  };

  const updateTrackPosition = () => {
    trackRef.current?.measureInWindow((x, _y, width) => {
      setTrackPageX(x);
      if (width > 0) setTrackWidth(width);
    });
  };

  const updateFromPageX = (pageX: number) => {
    if (trackWidth <= 1) return;
    updateValue(((pageX - trackPageX) / trackWidth) * 100);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () =>
          !busy && !verified && Boolean(challenge),
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dx) > 3,
        onPanResponderGrant: (event) => {
          updateTrackPosition();
          updateFromPageX(event.nativeEvent.pageX);
        },
        onPanResponderMove: (event, gesture) => {
          updateFromPageX(event.nativeEvent.pageX);
          if (Math.abs(gesture.dx) >= MIN_DRAG_DISTANCE) setHasDragged(true);
        },
        onPanResponderRelease: (_event, gesture) => {
          const dragged =
            hasDragged || Math.abs(gesture.dx) >= MIN_DRAG_DISTANCE;
          setHasDragged(dragged);
          if (dragged && Math.abs(valueRef.current - target) <= TOLERANCE)
            requestVerification(valueRef.current);
        },
      }),
    [busy, challenge, hasDragged, target, trackPageX, trackWidth, verified],
  );

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
    requestAnimationFrame(updateTrackPosition);
  };

  const adjustValue = (delta: number) => {
    if (busy || verified || !challenge) return;
    setHasDragged(true);
    const next = valueRef.current + delta;
    updateValue(next);
    if (Math.abs(next - target) <= TOLERANCE)
      requestVerification(Math.max(8, Math.min(92, Math.round(next))));
  };

  const boardWidth = Math.max(trackWidth, 1);
  // React Native swaps absolute left/right values in RTL. Mirroring the
  // percentage keeps the piece moving in the same direction as the finger.
  const visualValue = I18nManager.isRTL ? 100 - value : value;
  const visualTarget = I18nManager.isRTL ? 100 - target : target;
  const pieceLeft = (visualValue / 100) * boardWidth - PIECE_SIZE / 2;
  const targetLeft = (visualTarget / 100) * boardWidth - PIECE_SIZE / 2;
  const targetTop = (targetY / 100) * BOARD_HEIGHT - PIECE_SIZE / 2;
  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.08],
  });

  return (
    <View style={[styles.container, verified && styles.containerVerified]}>
      <View style={styles.headingRow}>
        <View style={styles.headingLabel}>
          <MaterialCommunityIcons
            name="puzzle-outline"
            size={20}
            color="#052651"
          />
          <Text style={styles.heading}>تأیید امنیتی</Text>
        </View>
        <Text
          style={[styles.state, (isAligned || verified) && styles.stateReady]}
        >
          {verified ? "تأیید شد" : isAligned ? "رها کن" : "قطعه را جابه‌جا کن"}
        </Text>
      </View>

      <View style={styles.board}>
        <View style={styles.sun} />
        <View style={[styles.hill, styles.hillOne]} />
        <View style={[styles.hill, styles.hillTwo]} />
        <Animated.View
          style={[
            styles.targetHalo,
            {
              left: targetLeft - 7,
              top: targetTop - 7,
              transform: [{ scale: pulseScale }],
            },
          ]}
        />
        <View style={[styles.target, { left: targetLeft, top: targetTop }]}>
          <MaterialCommunityIcons
            name="puzzle-outline"
            size={23}
            color="rgba(5, 38, 81, 0.38)"
          />
        </View>
        <View
          style={[
            styles.piece,
            { left: pieceLeft, top: targetTop },
            isAligned && styles.pieceAligned,
            verified && styles.pieceVerified,
          ]}
        >
          <MaterialCommunityIcons
            name={verified ? "check-bold" : "puzzle"}
            size={24}
            color="#ffffff"
          />
        </View>
      </View>

      <View
        ref={trackRef}
        onLayout={handleTrackLayout}
        style={styles.track}
        accessibilityRole="adjustable"
        accessibilityLabel="پازل امنیتی"
        accessibilityValue={{ min: 8, max: 92, now: value }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) =>
          adjustValue(event.nativeEvent.actionName === "increment" ? 2 : -2)
        }
        {...panResponder.panHandlers}
      >
        <View style={[styles.trackFill, { width: `${value}%` }]} />
        <View style={[styles.trackTarget, { left: `${visualTarget}%` }]} />
        <View style={[styles.handle, { left: `${visualValue}%` }]}>
          <MaterialCommunityIcons
            name="arrow-left-right"
            size={20}
            color="#087f79"
          />
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.helper}>
          {verified
            ? "انسان بودن شما تأیید شد."
            : hasDragged && !isAligned
              ? "کمی دقیق‌تر؛ قطعه باید داخل قاب قرار بگیرد."
              : "دسته را بکش و قطعه را روی قاب روشن رها کن."}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ساخت پازل تازه"
          disabled={busy}
          hitSlop={10}
          onPress={onRefresh}
          style={({ pressed }) => [styles.refresh, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="refresh" size={21} color="#52606d" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f2f8f6",
    borderColor: "#bed5cf",
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    marginTop: 16,
    padding: 12,
  },
  containerVerified: {
    backgroundColor: "#eff8f1",
    borderColor: "#8dc5a0",
  },
  headingRow: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  headingLabel: {
    alignItems: "center",
    flexDirection: "row-reverse",
    gap: 7,
  },
  heading: {
    color: "#052651",
    fontSize: 14,
    fontWeight: "800",
  },
  state: {
    color: "#66746d",
    fontSize: 12,
    fontWeight: "700",
  },
  stateReady: {
    color: "#217a45",
  },
  board: {
    backgroundColor: "#bde4e3",
    borderColor: "#a7cbc6",
    borderRadius: 8,
    borderWidth: 1,
    height: BOARD_HEIGHT,
    overflow: "hidden",
    position: "relative",
    direction: "ltr",
  },
  sun: {
    backgroundColor: "#ffc107",
    borderRadius: 22,
    height: 44,
    opacity: 0.78,
    position: "absolute",
    right: 26,
    top: 18,
    width: 44,
  },
  hill: {
    borderRadius: 999,
    bottom: -54,
    height: 120,
    position: "absolute",
    width: 210,
  },
  hillOne: {
    backgroundColor: "#17817d",
    left: -32,
    opacity: 0.82,
  },
  hillTwo: {
    backgroundColor: "#8c5661",
    opacity: 0.54,
    right: -38,
  },
  targetHalo: {
    borderColor: "rgba(255, 193, 7, 0.76)",
    borderRadius: 999,
    borderWidth: 2,
    height: PIECE_SIZE + 14,
    position: "absolute",
    width: PIECE_SIZE + 14,
  },
  target: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.48)",
    borderColor: "rgba(255,255,255,0.94)",
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 2,
    height: PIECE_SIZE,
    justifyContent: "center",
    position: "absolute",
    width: PIECE_SIZE,
  },
  piece: {
    alignItems: "center",
    backgroundColor: "#087f79",
    borderColor: "rgba(255,255,255,0.86)",
    borderRadius: 8,
    borderWidth: 1,
    elevation: 6,
    height: PIECE_SIZE,
    justifyContent: "center",
    position: "absolute",
    shadowColor: "#052651",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    width: PIECE_SIZE,
  },
  pieceAligned: {
    backgroundColor: "#c88909",
  },
  pieceVerified: {
    backgroundColor: "#217a45",
  },
  track: {
    backgroundColor: "#ffffff",
    borderColor: "#c8dad5",
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    direction: "ltr",
  },
  trackFill: {
    backgroundColor: "rgba(8, 127, 121, 0.14)",
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
  },
  trackTarget: {
    backgroundColor: "#ffc107",
    borderColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 2,
    height: 14,
    marginLeft: -7,
    position: "absolute",
    width: 14,
  },
  handle: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#9cc5bf",
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    marginLeft: -23,
    position: "absolute",
    width: 46,
  },
  footerRow: {
    alignItems: "center",
    flexDirection: "row-reverse",
    gap: 8,
    justifyContent: "space-between",
  },
  helper: {
    color: "#52606d",
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "right",
  },
  refresh: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  pressed: {
    opacity: 0.55,
  },
});
