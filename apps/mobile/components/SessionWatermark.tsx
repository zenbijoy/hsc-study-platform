import { MotiText } from 'moti';

export function SessionWatermark({ session = 'DEMO-82F4C7' }: { session?: string }) {
  return (
    <MotiText
      from={{ opacity: 0.05, translateX: -80, translateY: -120 }}
      animate={{ opacity: 0.11, translateX: 80, translateY: 150 }}
      transition={{ type: 'timing', duration: 9000, loop: true, repeatReverse: true }}
      pointerEvents="none"
      style={{ position: 'absolute', alignSelf: 'center', top: '40%', transform: [{ rotate: '-22deg' }], zIndex: 30 }}
      className="text-base font-bold tracking-[3px] text-white"
    >
      HSC STUDY · {session}
    </MotiText>
  );
}
