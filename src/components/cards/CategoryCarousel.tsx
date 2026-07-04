import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';

interface CategoryItemProps {
  title: string;
  isFocused?: boolean;
}

const categories = [
  { title: 'Food' },
  { title: 'Health' },
  { title: 'Education' },
  { title: 'Events' },
  { title: 'Services' },
];

export const CategoryCarousel: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {categories.map((cat, idx) => (
          <Pressable key={idx} style={styles.item}>
            <Text style={styles.itemText}>{cat.title}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginBottom: 12,
  },
  scrollContainer: {
    gap: 8,
  },
  item: {
    backgroundColor: '#FBE7CC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  itemText: {
    fontFamily: 'Mukta-Medium',
    fontSize: 12,
    color: '#2A2520',
  },
});
