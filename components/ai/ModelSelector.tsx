import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useAIStore } from '@/stores/ai-store';
import { colors } from '@/constants/colors';
import { AIModel } from '@/types/ai';
import { Sparkles, Info } from 'lucide-react-native';

interface ModelSelectorProps {
  title?: string;
  compact?: boolean;
}

export function ModelSelector({ title = 'Choose AI model:', compact = false }: ModelSelectorProps) {
  const { selectedModel, supportedModels, setSelectedModel } = useAIStore();
  const [showInfo, setShowInfo] = React.useState(false);

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Sparkles size={16} color={colors.primary} />
        <Text style={styles.title}>{title}</Text>
        {!compact && (
          <TouchableOpacity onPress={toggleInfo} style={styles.infoButton}>
            <Info size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        {supportedModels.map((model) => (
          <Pressable
            key={model.id}
            style={[
              styles.modelButton,
              selectedModel === model.id && styles.selectedButton
            ]}
            onPress={() => setSelectedModel(model.id)}
          >
            <Text
              style={[
                styles.modelButtonText,
                selectedModel === model.id && styles.selectedButtonText
              ]}
            >
              {model.label}
            </Text>
          </Pressable>
        ))}
      </View>
      
      {!compact && (
        <View>
          {showInfo ? (
            <View style={styles.infoContainer}>
              {supportedModels.map((model) => (
                <View key={model.id} style={styles.modelInfoItem}>
                  <Text style={styles.modelInfoLabel}>{model.label}:</Text>
                  <Text style={styles.modelInfoDescription}>{model.description}</Text>
                </View>
              ))}
            </View>
          ) : selectedModel ? (
            <Text style={styles.description}>
              {supportedModels.find(m => m.id === selectedModel)?.description}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 6,
    flex: 1,
  },
  infoButton: {
    padding: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedButton: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  modelButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectedButtonText: {
    color: colors.primary,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoContainer: {
    marginTop: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
  },
  modelInfoItem: {
    marginBottom: 8,
  },
  modelInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  modelInfoDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});