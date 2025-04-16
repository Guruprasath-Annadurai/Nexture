import { Modal, View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { Check, MapPin } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { Pressable } from 'react-native';

interface LocationPickerProps {
  visible: boolean;
  locations: string[];
  selectedLocation?: string;
  onSelect: (location?: string) => void;
  onClose: () => void;
}

export function LocationPicker({
  visible,
  locations,
  selectedLocation,
  onSelect,
  onClose,
}: LocationPickerProps) {
  const handleSelect = (location: string) => {
    onSelect(location === selectedLocation ? undefined : location);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Location</Text>
            <Button
              title="Done"
              variant="outline"
              size="small"
              onPress={onClose}
            />
          </View>

          <ScrollView style={styles.list}>
            <Pressable
              style={styles.item}
              onPress={() => handleSelect(undefined as any)}
            >
              <View style={styles.itemContent}>
                <MapPin size={20} color={colors.textSecondary} />
                <Text style={styles.itemText}>All Locations</Text>
              </View>
              {!selectedLocation && (
                <Check size={20} color={colors.primary} />
              )}
            </Pressable>

            {locations.map((location) => (
              <Pressable
                key={location}
                style={styles.item}
                onPress={() => handleSelect(location)}
              >
                <View style={styles.itemContent}>
                  <MapPin size={20} color={colors.textSecondary} />
                  <Text style={styles.itemText}>{location}</Text>
                </View>
                {location === selectedLocation && (
                  <Check size={20} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  list: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemText: {
    fontSize: 16,
    color: colors.text,
  },
});