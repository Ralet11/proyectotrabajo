import { PropsWithChildren } from 'react';
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { AppTheme, useAppTheme } from '@/theme';
import { paletteLabels, PaletteName, palettes } from '@/theme/palettes';

type SurfaceCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

type AppTextFieldProps = TextInputProps & {
  label?: string;
};

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

type PillProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

type ThemePickerProps = {
  visible: boolean;
  activePalette: PaletteName;
  onSelect: (paletteName: PaletteName) => void;
  onClose: () => void;
};

export function SurfaceCard({ children, style }: SurfaceCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return <View style={[styles.card, style]}>{children}</View>;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  style,
  textStyle,
}: AppButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary, style]}
    >
      <Text
        style={[
          styles.buttonLabel,
          variant === 'primary' ? styles.buttonPrimaryLabel : styles.buttonSecondaryLabel,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AppTextField({ label, style, placeholderTextColor, ...props }: AppTextFieldProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        {...props}
        placeholderTextColor={placeholderTextColor ?? theme.colors.textMuted}
        style={[styles.input, style]}
      />
    </View>
  );
}

export function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.headingWrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.headingTitle}>{title}</Text>
      {subtitle ? <Text style={styles.headingSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Pill({ label, selected = false, onPress }: PillProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={onPress} style={[styles.pill, selected ? styles.pillSelected : styles.pillIdle]}>
      <Text style={[styles.pillLabel, selected ? styles.pillLabelSelected : styles.pillLabelIdle]}>{label}</Text>
    </Pressable>
  );
}

export function ThemePicker({ visible, activePalette, onSelect, onClose }: ThemePickerProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Elegi un tema</Text>
          <Text style={styles.modalSubtitle}>Tocalo y la app cambia al instante.</Text>
          {Object.keys(palettes).map((key) => {
            const paletteName = key as PaletteName;
            const palette = palettes[paletteName];
            const selected = paletteName === activePalette;

            return (
              <Pressable
                key={paletteName}
                onPress={() => {
                  onSelect(paletteName);
                  onClose();
                }}
                style={[styles.themeOption, selected && styles.themeOptionSelected]}
              >
                <View style={styles.themeSwatches}>
                  <View style={[styles.swatch, { backgroundColor: palette.primary }]} />
                  <View style={[styles.swatch, { backgroundColor: palette.secondary }]} />
                  <View style={[styles.swatch, { backgroundColor: palette.surfaceAlt }]} />
                </View>
                <View style={styles.themeCopy}>
                  <Text style={styles.themeOptionTitle}>{paletteLabels[paletteName].title}</Text>
                  <Text style={styles.themeOptionSubtitle}>{paletteLabels[paletteName].subtitle}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      ...theme.effects.cardShadow,
    },
    button: {
      minHeight: 56,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    buttonPrimary: {
      backgroundColor: theme.colors.primary,
    },
    buttonSecondary: {
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonLabel: {
      fontSize: theme.typography.body,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    buttonPrimaryLabel: {
      color: theme.colors.textOnPrimary,
    },
    buttonSecondaryLabel: {
      color: theme.colors.text,
    },
    fieldWrap: {
      gap: theme.spacing.xs,
    },
    fieldLabel: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.caption,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    input: {
      minHeight: 56,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      color: theme.colors.text,
      fontSize: theme.typography.body,
    },
    headingWrap: {
      gap: theme.spacing.sm,
    },
    eyebrow: {
      color: theme.colors.primaryStrong,
      fontSize: theme.typography.caption,
      fontWeight: '800',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    headingTitle: {
      color: theme.colors.text,
      fontSize: theme.typography.title,
      fontWeight: '800',
      lineHeight: 32,
    },
    headingSubtitle: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.body,
      lineHeight: 24,
    },
    pill: {
      borderRadius: theme.radius.pill,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    pillIdle: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    pillSelected: {
      backgroundColor: theme.colors.primary,
    },
    pillLabel: {
      fontWeight: '700',
    },
    pillLabelIdle: {
      color: theme.colors.text,
    },
    pillLabelSelected: {
      color: theme.colors.textOnPrimary,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: '#00000044',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    modalCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      ...theme.effects.cardShadow,
    },
    modalTitle: {
      color: theme.colors.text,
      fontSize: theme.typography.heading,
      fontWeight: '800',
    },
    modalSubtitle: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.body,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      padding: theme.spacing.md,
    },
    themeOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceAlt,
    },
    themeSwatches: {
      flexDirection: 'row',
      gap: 6,
    },
    swatch: {
      width: 18,
      height: 42,
      borderRadius: 999,
    },
    themeCopy: {
      flex: 1,
      gap: 4,
    },
    themeOptionTitle: {
      color: theme.colors.text,
      fontSize: theme.typography.body,
      fontWeight: '800',
    },
    themeOptionSubtitle: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.caption,
    },
  });
}
