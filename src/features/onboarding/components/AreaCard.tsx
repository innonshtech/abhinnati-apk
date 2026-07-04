import React, { useEffect } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';
import { Area } from '../../../api/mockData';

interface AreaCardProps {
  area: Area;
  selected: boolean;
  onPress: () => void;
  isMarathi: boolean;
}

export const AreaCard: React.FC<AreaCardProps> = React.memo(({
  area,
  selected,
  onPress,
  isMarathi,
}) => {
  const name = isMarathi ? area.name_mr : area.name_en;
  
  // Animation value for checkmark fade and slide
  const animatedSelection = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    animatedSelection.value = withTiming(selected ? 1 : 0, { duration: 200 });
  }, [selected]);

  const animatedCheckStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedSelection.value,
      transform: [
        { translateX: interpolate(animatedSelection.value, [0, 1], [10, 0]) }
      ]
    };
  });

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.cardContainer,
        selected ? styles.selectedCard : styles.simpleCard
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${name}, ${area.city || ''}`}
    >
      <Text style={[
        styles.cardText,
        selected ? styles.selectedText : styles.simpleText
      ]}>
        {name}
      </Text>
      
      <Animated.View style={[styles.checkWrapper, animatedCheckStyle]}>
        <Text style={styles.checkText}>✓</Text>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  selectedCard: {
    backgroundColor: '#FDF1DF',
    borderWidth: 1.5,
    borderColor: '#E58A2B',
  },
  simpleCard: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardText: {
    fontSize: 16,
    lineHeight: 27,
  },
  selectedText: {
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#2A2520',
  },
  simpleText: {
    fontFamily: 'Mukta-Regular',
    fontWeight: '400',
    color: '#3D362E',
  },
  checkWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontFamily: 'Mukta-Bold',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 30,
    color: '#E58A2B',
  },
});

AreaCard.displayName = 'AreaCard';

export default AreaCard;
