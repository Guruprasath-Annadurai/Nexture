import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'filled' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const getButtonStyle = () => {
    let buttonStyle: any = [styles.buttonBase];
    
    // Add size styles
    if (size === 'small') buttonStyle.push(styles.buttonSmall);
    if (size === 'large') buttonStyle.push(styles.buttonLarge);
    
    // Add variant styles
    if (variant === 'primary') buttonStyle.push(styles.buttonPrimary);
    if (variant === 'secondary') buttonStyle.push(styles.buttonSecondary);
    if (variant === 'outline') buttonStyle.push(styles.buttonOutline);
    if (variant === 'filled') buttonStyle.push(styles.buttonFilled);
    if (variant === 'text') buttonStyle.push(styles.buttonText);
    
    // Add disabled styles
    if (disabled) {
      if (variant === 'outline') {
        buttonStyle.push(styles.buttonOutlineDisabled);
      } else if (variant === 'text') {
        buttonStyle.push(styles.buttonTextDisabled);
      } else {
        buttonStyle.push(styles.buttonDisabled);
      }
    }
    
    // Add full width style
    if (fullWidth) buttonStyle.push(styles.buttonFullWidth);
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let textStyleArray: any = [styles.buttonTextStyle];
    
    // Add size styles
    if (size === 'small') textStyleArray.push(styles.buttonTextSmall);
    if (size === 'large') textStyleArray.push(styles.buttonTextLarge);
    
    // Add variant styles
    if (variant === 'primary') textStyleArray.push(styles.buttonTextPrimary);
    if (variant === 'secondary') textStyleArray.push(styles.buttonTextSecondary);
    if (variant === 'outline') textStyleArray.push(styles.buttonTextOutline);
    if (variant === 'filled') textStyleArray.push(styles.buttonTextFilled);
    if (variant === 'text') textStyleArray.push(styles.buttonTextText);
    
    // Add disabled styles
    if (disabled) {
      if (variant === 'outline' || variant === 'text') {
        textStyleArray.push(styles.buttonTextOutlineDisabled);
      } else {
        textStyleArray.push(styles.buttonTextDisabled);
      }
    }
    
    return textStyleArray;
  };
  
  const getIconColor = () => {
    if (disabled) {
      return colors.disabled;
    }
    
    if (variant === 'primary' || variant === 'secondary' || variant === 'filled') {
      return colors.white;
    }
    
    if (variant === 'outline') {
      return colors.primary;
    }
    
    if (variant === 'text') {
      return colors.primary;
    }
    
    return colors.white;
  };
  
  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'text' ? colors.primary : colors.white}
          size="small"
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonFilled: {
    backgroundColor: colors.primaryLight,
  },
  buttonText: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  buttonOutlineDisabled: {
    borderColor: colors.disabled,
  },
  buttonTextDisabled: {
    backgroundColor: 'transparent',
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonTextStyle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextSmall: {
    fontSize: 14,
  },
  buttonTextLarge: {
    fontSize: 18,
  },
  buttonTextPrimary: {
    color: colors.white,
  },
  buttonTextSecondary: {
    color: colors.white,
  },
  buttonTextOutline: {
    color: colors.primary,
  },
  buttonTextFilled: {
    color: colors.primary,
  },
  buttonTextText: {
    color: colors.primary,
  },
  buttonTextDisabled: {
    color: colors.white,
  },
  buttonTextOutlineDisabled: {
    color: colors.disabled,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});