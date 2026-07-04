import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  TextInput, 
  ActivityIndicator, 
  Modal, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../api/client';
import locationService from '../../features/onboarding/services/LocationService';
import { Area } from '../../api/mockData';
import { geoService } from '../../api/geoService';

interface SwitchAreaBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const SwitchAreaBottomSheet: React.FC<SwitchAreaBottomSheetProps> = ({
  visible,
  onClose
}) => {
  if (!visible) return null;

  const { preferredLanguage, activeArea, setActiveArea } = useAuthStore();
  const isMr = preferredLanguage === 'mr';

  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [operationalAreas, setOperationalAreas] = useState<Area[]>([]);
  const [suggestions, setSuggestions] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const strings = {
    title: isMr ? 'परिसर बदला' : 'Switch area',
    searchPlaceholder: isMr ? 'परिसर शोधा...' : 'Search locality',
    useCurrentLocation: isMr ? 'चालू लोकेशन वापरा' : 'Use current location',
    done: isMr ? 'पूर्ण झाले' : 'Done',
    loading: isMr ? 'लोकेशन जतन करत आहे...' : 'Locating your area...',
  };

  // Sync selectedArea with activeArea when visible
  useEffect(() => {
    if (visible && activeArea) {
      setSelectedArea(activeArea);
      setSearchText('');
    }
  }, [visible, activeArea]);

  // Fetch operational areas on mount
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areas = await locationService.getOperationalAreas();
        setOperationalAreas(areas);
      } catch (err) {
        console.error('[SwitchAreaBottomSheet] Error fetching areas:', err);
      }
    };
    fetchAreas();
  }, []);

  // Filter autocomplete suggestions
  useEffect(() => {
    if (!searchText.trim()) {
      setSuggestions([]);
      return;
    }
    
    const delayTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await locationService.searchAreas(searchText);
        setSuggestions(results);
      } catch (err) {
        console.error('[SwitchAreaBottomSheet] Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(delayTimer);
  }, [searchText]);

  // Handle GPS location fetch
  const handleGpsFetch = async () => {
    setGpsLoading(true);
    try {
      const result = await geoService.getCurrentLocation(true);
      if (result.success && result.latitude !== null && result.longitude !== null) {
        const locality = result.localityLabel || 'Detected Location';
        const city = result.address?.city || '';

        // Match existing area
        const matched = operationalAreas.find(a => 
          a.name_en.toLowerCase() === locality.toLowerCase() ||
          Math.abs(a.latitude - result.latitude!) < 0.05
        );

        if (matched) {
          setSelectedArea(matched);
        } else {
          const customArea: Area = {
            id: `gps_${result.latitude.toFixed(5)}_${result.longitude.toFixed(5)}`,
            name_en: locality,
            name_mr: locality,
            latitude: result.latitude,
            longitude: result.longitude,
            radius_km: 5.0,
            locality,
            city,
          };
          setSelectedArea(customArea);
        }
      }
    } catch (err) {
      console.error('[SwitchAreaBottomSheet] GPS error:', err);
    } finally {
      setGpsLoading(false);
    }
  };

  // Commit changes & save to profile
  const handleDone = async () => {
    if (!selectedArea) {
      onClose();
      return;
    }
    try {
      setLoading(true);
      const isPreSeeded = operationalAreas.some(a => a.id === selectedArea.id);
      const res = await api.updateProfile({ 
        activeAreaId: selectedArea.id,
        ...(!isPreSeeded ? {
          activeArea: {
            id: selectedArea.id,
            name: selectedArea.name_en || selectedArea.name_mr || 'Custom Location',
            city: selectedArea.city || 'Mumbai',
            latitude: selectedArea.latitude,
            longitude: selectedArea.longitude,
          }
        } : {})
      });
      
      if (res.success) {
        await setActiveArea(selectedArea);
      }
    } catch (err) {
      console.error('[SwitchAreaBottomSheet] Done error:', err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const getDisplayList = () => {
    if (searchText.trim()) {
      return suggestions.filter(a => selectedArea ? a.id !== selectedArea.id : true);
    }
    // Default list (Ravet, Bandra West, Bandra East, Khar, Santacruz)
    const defaults = ['area-bandra', 'area-bandra-east', 'area-khar', 'area-santacruz', 'area-baner', 'area-ravet'];
    return operationalAreas
      .filter(a => defaults.includes(a.id) && (selectedArea ? a.id !== selectedArea.id : true))
      .slice(0, 3);
  };

  const displayList = getDisplayList();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetWrapper}
            >
              <View style={styles.sheet}>
                {/* Drag handle */}
                <View style={styles.dragHandle} />

                {/* Title */}
                <Text style={styles.title}>{strings.title}</Text>

                {/* Search input bar */}
                <View style={styles.searchBar}>
                  <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder={strings.searchPlaceholder}
                    placeholderTextColor="#A89A82"
                    style={styles.searchInput}
                  />
                </View>

                {/* Use current location trigger */}
                <Pressable onPress={handleGpsFetch} style={styles.gpsTrigger}>
                  {gpsLoading ? (
                    <ActivityIndicator size="small" color="#9A5A12" style={{ marginRight: 6 }} />
                  ) : null}
                  <Text style={styles.gpsText}>{strings.useCurrentLocation}</Text>
                </Pressable>

                {/* Highlighted selected area card */}
                {selectedArea ? (
                  <View style={styles.selectedCard}>
                    <Text style={styles.selectedText}>
                      {isMr ? selectedArea.name_mr : selectedArea.name_en}
                    </Text>
                    {/* Orange Checkmark SVG */}
                    <Svg width={9} height={7} viewBox="0 0 9 7">
                      <Path 
                        d="M1 3.5l2.5 2.5L8 1" 
                        stroke="#E58A2B" 
                        strokeWidth={2} 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        fill="none" 
                      />
                    </Svg>
                  </View>
                ) : null}

                {/* Suggestion list */}
                <View style={styles.suggestionsContainer}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#E58A2B" style={{ marginTop: 20 }} />
                  ) : (
                    displayList.map((item, index) => {
                      const isLast = index === displayList.length - 1;
                      return (
                        <View key={item.id}>
                          <Pressable 
                            onPress={() => setSelectedArea(item)}
                            style={styles.suggestionRow}
                          >
                            <Text style={styles.suggestionText}>
                              {isMr ? item.name_mr : item.name_en}
                            </Text>
                          </Pressable>
                          {!isLast && <View style={styles.divider} />}
                        </View>
                      );
                    })
                  )}
                </View>

                {/* Done button */}
                <Pressable onPress={handleDone} style={styles.doneBtn}>
                  <Text style={styles.doneBtnText}>{strings.done}</Text>
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 23, 20, 0.55)', // Figma dark semi-transparent overlay
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
  },
  sheet: {
    width: 393,
    height: 560,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'relative',
  },
  dragHandle: {
    position: 'absolute',
    width: 40,
    height: 5,
    left: 176.5,
    top: 12,
    backgroundColor: '#D8CDB8',
    borderRadius: 3,
  },
  title: {
    position: 'absolute',
    width: 200,
    height: 30,
    left: 18,
    top: 32,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 30,
    color: '#2A2520',
  },
  searchBar: {
    position: 'absolute',
    width: 357,
    height: 46,
    left: 18,
    top: 72,
    backgroundColor: '#FBF6EC',
    borderWidth: 1,
    borderColor: '#E0CFB0',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  searchInput: {
    width: '100%',
    fontFamily: 'Mukta-Regular',
    fontSize: 15,
    color: '#2A2520',
    padding: 0,
  },
  gpsTrigger: {
    position: 'absolute',
    height: 25,
    left: 18,
    top: 133,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsText: {
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 25,
    color: '#9A5A12',
  },
  selectedCard: {
    position: 'absolute',
    width: 357,
    height: 50,
    left: 18,
    top: 170,
    backgroundColor: '#FDF1DF',
    borderWidth: 1.5,
    borderColor: '#E58A2B',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  selectedText: {
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 27,
    color: '#2A2520',
  },
  suggestionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 240,
    height: 170,
  },
  suggestionRow: {
    height: 40,
    paddingHorizontal: 22,
    justifyContent: 'center',
  },
  suggestionText: {
    fontFamily: 'Mukta-Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 27,
    color: '#3D362E',
  },
  divider: {
    height: 1,
    backgroundColor: '#EFE3CC',
    marginHorizontal: 18,
    marginVertical: 4,
  },
  doneBtn: {
    position: 'absolute',
    width: 357,
    height: 50,
    left: 18,
    top: 432,
    backgroundColor: '#2A2520',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 25,
    color: '#FFFFFF',
  },
});
