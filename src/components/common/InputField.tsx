import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TextInputProps } from 'react-native';
import { theme } from '../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../hooks/useScale';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: any;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  containerStyle,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const getBorderColor = () => {
    if (error) return theme.colors.danger;
    if (isFocused) return theme.colors.marigold;
    return theme.colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputWrapper, 
        { borderColor: getBorderColor() },
        props.multiline && { height: undefined, minHeight: verticalScale(50), paddingVertical: verticalScale(8) }
      ]}>
        <TextInput
          placeholderTextColor={theme.colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input, 
            props.multiline && { height: verticalScale(80), textAlignVertical: 'top' },
            style
          ]}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: verticalScale(8),
    width: '100%',
  },
  label: {
    fontSize: moderateScale(theme.typography.sizes.label),
    fontWeight: '500',
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.charcoal,
    marginBottom: verticalScale(6),
  },
  inputWrapper: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderRadius: theme.radii.button,
    height: verticalScale(50),
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(16),
  },
  input: {
    fontSize: moderateScale(theme.typography.sizes.body),
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.charcoal,
    padding: 0, // Reset default OS paddings
    width: '100%',
    height: '100%',
  },
  errorText: {
    fontSize: moderateScale(theme.typography.sizes.caption),
    color: theme.colors.danger,
    fontFamily: theme.typography.fontFamily.regular,
    marginTop: verticalScale(4),
  },
});

export default InputField;
