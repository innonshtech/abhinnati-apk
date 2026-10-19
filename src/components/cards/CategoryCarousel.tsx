import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';

export const CategoryCarousel: React.FC = () => {
  const { preferredLanguage } = useAuthStore();
  const isMr = preferredLanguage === 'mr';
  const [categories, setCategories] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    api.getCategories().then((data) => {
      if (!Array.isArray(data)) return;
      setCategories(
        data.map((category: any) => ({
          id: category.id || category.slug,
          title: isMr ? (category.nameMr || category.name_mr) : (category.nameEn || category.name_en),
        }))
      );
    }).catch(() => {});
  }, [isMr]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {categories.map((cat) => (
          <Pressable key={cat.id} style={styles.item}>
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
