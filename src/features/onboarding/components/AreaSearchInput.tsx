import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

interface AreaSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export const AreaSearchInput: React.FC<AreaSearchInputProps> = ({
  value,
  onChangeText,
  placeholder,
  disabled = false,
}) => {
  const inputRef = useRef<TextInput>(null);

  // Automatically focus on load (UX requirement)
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400); // Small delay to allow transition animations
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.searchBarContainer, disabled && styles.disabledContainer]}>
      <TextInput
        ref={inputRef}
        placeholder={placeholder}
        placeholderTextColor="#A89A82"
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        style={styles.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel="Search Area Locality or Pincode"
        accessibilityHint="Type to search for operational areas"
      />
      {value.length > 0 && !disabled && (
        <Pressable
          onPress={() => onChangeText('')}
          style={styles.clearBtn}
          hitSlop={10}
          accessibilityLabel="Clear search text"
        >
          <X size={16} color="#6B5F4E" />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0CFB0',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 10,
  },
  disabledContainer: {
    backgroundColor: '#F5EFEB',
    borderColor: '#E6DCC9',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Mukta-Regular',
    color: '#2A2520',
    padding: 0,
    height: '100%',
    lineHeight: 25,
  },
  clearBtn: {
    padding: 4,
  },
});

export default AreaSearchInput;
