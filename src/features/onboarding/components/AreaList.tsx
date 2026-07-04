import React, { useRef, useEffect } from 'react';
import { StyleSheet, FlatList, View, Text } from 'react-native';
import { Area } from '../../../api/mockData';
import AreaCard from './AreaCard';

interface AreaListProps {
  data: Area[];
  selectedArea: Area | null;
  onSelectArea: (area: Area) => void;
  isMarathi: boolean;
  emptyTitle: string;
  emptySubtitle: string;
}

export const AreaList: React.FC<AreaListProps> = ({
  data,
  selectedArea,
  onSelectArea,
  isMarathi,
  emptyTitle,
  emptySubtitle,
}) => {
  const listRef = useRef<FlatList<Area>>(null);

  // Auto-scroll to selected area when it changes
  useEffect(() => {
    if (!selectedArea || data.length === 0) return;
    
    const index = data.findIndex(item => item.id === selectedArea.id);
    if (index !== -1) {
      // Small timeout to guarantee flatlist rendering completes
      const timer = setTimeout(() => {
        try {
          listRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5, // Center the selected item in view
          });
        } catch (err) {
          // Fallback if index fails layout measurement
          listRef.current?.scrollToOffset({
            offset: index * 52, // 48px height + 4px margin
            animated: true,
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedArea, data]);

  const renderItem = ({ item }: { item: Area }) => {
    const isSelected = selectedArea?.id === item.id;
    return (
      <View style={styles.cardWrapper}>
        <AreaCard
          area={item}
          selected={isSelected}
          onPress={() => onSelectArea(item)}
          isMarathi={isMarathi}
        />
        {/* Subtle divider line for non-selected rows */}
        {!isSelected && <View style={styles.divider} />}
      </View>
    );
  };

  return (
    <FlatList
      ref={listRef}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.listContent}
      getItemLayout={(data, index) => ({
        length: 56, // height (48) + margins (4 vertical margin spacing)
        offset: 56 * index,
        index,
      })}
      onScrollToIndexFailed={(info) => {
        // Fallback offset scroll if layout measurement is not ready
        listRef.current?.scrollToOffset({
          offset: info.index * 56,
          animated: true,
        });
      }}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptySub}>{emptySubtitle}</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFE3CC',
    marginHorizontal: 0,
    marginTop: 2,
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#2A2520',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'Mukta-Regular',
    color: '#6B5F4E',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AreaList;
