import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/constants/colors';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onSelectTag: (tag: string) => void;
}

export function TagFilter({ tags, selectedTags, onSelectTag }: TagFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {tags.map((tag) => (
        <Pressable
          key={tag}
          style={[
            styles.tag,
            selectedTags.includes(tag) && styles.selectedTag,
          ]}
          onPress={() => onSelectTag(tag)}
        >
          <Text
            style={[
              styles.tagText,
              selectedTags.includes(tag) && styles.selectedTagText,
            ]}
          >
            {tag}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedTag: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedTagText: {
    color: colors.background,
    fontWeight: '500',
  },
});