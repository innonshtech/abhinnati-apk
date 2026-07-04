import React from 'react';
import { View, StyleSheet, TextInput, StyleProp, ViewStyle, TextInputProps } from 'react-native';
import { Search } from 'lucide-react-native';
import { theme } from '../../theme';

interface SearchBarProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  containerStyle,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Search
        size={17}
        color="#A89A82"
        style={styles.searchIcon}
      />
      <TextInput
        placeholderTextColor="#A89A82"
        style={styles.searchInput}
        returnKeyType="search"
        {...textInputProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E0CFB0',
    width: '100%',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 25,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#2A2520',
    height: '100%',
    padding: 0,
    includeFontPadding: false,
  },
});

export default SearchBar;
