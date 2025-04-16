import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Filter } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { LocationPicker } from './LocationPicker';
import { SkillsSelect } from './SkillsSelect';
import { colors } from '@/constants/colors';
import { useJobsStore } from '@/stores/jobs-store';
import type { KnownSkill } from '@/services/skills-service';

interface JobFiltersProps {
  locations: string[];
  availableSkills: KnownSkill[];
}

export function JobFilters({ locations, availableSkills }: JobFiltersProps) {
  const { filters, updateFilters, clearFilters } = useJobsStore();
  const [isLocationPickerVisible, setLocationPickerVisible] = useState(false);
  const [isSkillsSelectVisible, setSkillsSelectVisible] = useState(false);

  const handleLocationChange = useCallback(async (location?: string) => {
    await updateFilters({ location });
    setLocationPickerVisible(false);
  }, [updateFilters]);

  const handleSkillsChange = useCallback(async (skills: KnownSkill[]) => {
    await updateFilters({ skills });
    setSkillsSelectVisible(false);
  }, [updateFilters]);

  const hasFilters = filters.location || (filters.skills?.length ?? 0) > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Filter size={20} color={colors.textSecondary} />
          <Text style={styles.title}>Filters</Text>
        </View>
        {hasFilters && (
          <Button
            title="Clear"
            variant="outline"
            size="small"
            onPress={clearFilters}
          />
        )}
      </View>

      <View style={styles.filters}>
        <Button
          title={filters.location || "Select Location"}
          variant="outline"
          style={[
            styles.filterButton,
            filters.location && styles.activeFilter
          ]}
          textStyle={filters.location ? styles.activeFilterText : undefined}
          onPress={() => setLocationPickerVisible(true)}
        />

        <Button
          title={filters.skills?.length 
            ? `${filters.skills.length} Skills` 
            : "Select Skills"}
          variant="outline"
          style={[
            styles.filterButton,
            (filters.skills?.length ?? 0) > 0 && styles.activeFilter
          ]}
          textStyle={(filters.skills?.length ?? 0) > 0 ? styles.activeFilterText : undefined}
          onPress={() => setSkillsSelectVisible(true)}
        />
      </View>

      <LocationPicker
        visible={isLocationPickerVisible}
        locations={locations}
        selectedLocation={filters.location}
        onSelect={handleLocationChange}
        onClose={() => setLocationPickerVisible(false)}
      />

      <SkillsSelect
        visible={isSkillsSelectVisible}
        skills={availableSkills}
        selectedSkills={filters.skills ?? []}
        onSelect={handleSkillsChange}
        onClose={() => setSkillsSelectVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
  },
  activeFilter: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  activeFilterText: {
    color: colors.primary,
  },
});