import { useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { colors } from '@/constants/colors';
import type { KnownSkill } from '@/services/skills-service';

interface SkillsSelectProps {
  visible: boolean;
  skills: KnownSkill[];
  selectedSkills: KnownSkill[];
  onSelect: (skills: KnownSkill[]) => void;
  onClose: () => void;
}

export function SkillsSelect({
  visible,
  skills,
  selectedSkills,
  onSelect,
  onClose,
}: SkillsSelectProps) {
  const [search, setSearch] = useState('');

  const filteredSkills = skills.filter(skill =>
    skill.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSkill = (skill: KnownSkill) => {
    const isSelected = selectedSkills.includes(skill);
    const newSkills = isSelected
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    onSelect(newSkills);
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
            <Text style={styles.title}>Select Skills</Text>
            <Button
              title="Done"
              variant="outline"
              size="small"
              onPress={onClose}
            />
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search skills..."
              style={styles.searchInput}
            />
          </View>

          {selectedSkills.length > 0 && (
            <ScrollView
              horizontal
              style={styles.selectedContainer}
              contentContainerStyle={styles.selectedContent}
              showsHorizontalScrollIndicator={false}
            >
              {selectedSkills.map(skill => (
                <View key={skill} style={styles.selectedSkill}>
                  <Text style={styles.selectedSkillText}>{skill}</Text>
                  <X
                    size={16}
                    color={colors.primary}
                    onPress={() => toggleSkill(skill)}
                  />
                </View>
              ))}
            </ScrollView>
          )}

          <ScrollView style={styles.list}>
            {filteredSkills.map(skill => (
              <Button
                key={skill}
                title={skill}
                variant={selectedSkills.includes(skill) ? 'primary' : 'outline'}
                style={styles.skillButton}
                onPress={() => toggleSkill(skill)}
              />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    flex: 1,
  },
  selectedContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedContent: {
    padding: 16,
    gap: 8,
  },
  selectedSkill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  selectedSkillText: {
    fontSize: 14,
    color: colors.primary,
  },
  list: {
    padding: 16,
  },
  skillButton: {
    marginBottom: 8,
  },
});