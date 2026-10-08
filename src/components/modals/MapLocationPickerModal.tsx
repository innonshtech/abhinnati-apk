import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  Pressable, 
  ActivityIndicator,
  Platform,
  ToastAndroid
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import { geoService } from '../../api/geoService';

interface MapLocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: { latitude: number; longitude: number; name: string }) => void;
  initialLocation?: { latitude: number; longitude: number } | null;
  isMarathi: boolean;
}

export const MapLocationPickerModal: React.FC<MapLocationPickerModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
  initialLocation,
  isMarathi
}) => {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.latitude || 19.0760, // Default to Mumbai
    longitude: initialLocation?.longitude || 72.8777,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState<string>('');

  const strings = {
    title: isMarathi ? 'नकाशावर लोकेशन निवडा' : 'Select on Map',
    confirmBtn: isMarathi ? 'हे लोकेशन निश्चित करा' : 'Confirm Location',
    fetching: isMarathi ? 'लोकेशन शोधत आहे...' : 'Fetching address...',
    movePin: isMarathi ? 'पिन हलवून अचूक लोकेशन निवडा' : 'Move the map to place the pin at your exact location',
  };

  // Called whenever the map finishes moving
  const handleRegionChangeComplete = async (newRegion: Region) => {
    setRegion(newRegion);
    setLoading(true);
    
    try {
      // Reverse geocode to get the locality name from these exact coordinates
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${newRegion.latitude}&lon=${newRegion.longitude}&format=json`, {
        headers: {
          'User-Agent': 'AbhinnatiApp/1.0 (contact@abhinnati.com)'
        }
      });
      const data = await res.json();
      
      if (data && data.address) {
        const name = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.name || data.address.city;
        setLocationName(name || 'Selected Location');
      } else {
        setLocationName('Selected Location');
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
      setLocationName('Selected Location');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onSelectLocation({
      latitude: region.latitude,
      longitude: region.longitude,
      name: locationName,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.backButton}>
            <ChevronLeft color="#2A2520" size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>{strings.title}</Text>
        </View>

        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            onRegionChangeComplete={handleRegionChangeComplete}
          />
          {/* Fixed center pin marker (Zomato style) */}
          <View style={styles.fixedMarker} pointerEvents="none">
            <MapPin size={40} color="#E58A2B" fill="#E58A2B" />
          </View>
        </View>

        {/* Bottom Panel */}
        <View style={styles.bottomPanel}>
          <Text style={styles.helperText}>{strings.movePin}</Text>
          
          <View style={styles.addressContainer}>
            {loading ? (
              <ActivityIndicator size="small" color="#E58A2B" />
            ) : (
              <Text style={styles.addressText} numberOfLines={2}>
                {locationName || strings.fetching}
              </Text>
            )}
          </View>

          <Pressable 
            style={[styles.confirmButton, loading && styles.disabledButton]} 
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text style={styles.confirmButtonText}>{strings.confirmBtn}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6EC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: 'Mukta-SemiBold',
    fontSize: 18,
    color: '#2A2520',
    marginLeft: 15,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fixedMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20, // Half of marker size
    marginTop: -40, // Full height so pin points exact center
    zIndex: 10,
  },
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 10,
  },
  helperText: {
    fontFamily: 'Mukta-Regular',
    fontSize: 13,
    color: '#6B5F4E',
    textAlign: 'center',
    marginBottom: 15,
  },
  addressContainer: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  addressText: {
    fontFamily: 'Mukta-SemiBold',
    fontSize: 18,
    color: '#2A2520',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#E58A2B',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#F3C494',
  },
  confirmButtonText: {
    fontFamily: 'Mukta-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default MapLocationPickerModal;
