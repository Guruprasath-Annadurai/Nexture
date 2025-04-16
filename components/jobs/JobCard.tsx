import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Building2, MapPin, Briefcase, DollarSign, Zap, Info, Check, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { useState } from 'react';
import type { JobMatch } from '@/types/jobs';

export interface JobCardProps {
  job: JobMatch;
  onApply: () => void;
  onAutoApply: () => void;
}

export function JobCard({ job, onApply, onAutoApply }: JobCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSkills, setShowSkills] = useState(false);

  return (
    <Pressable onPress={() => router.push(`/jobs/${job.id}`)}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={styles.company}>
            <Building2 size={24} color={colors.primary} />
            <View>
              <Text style={styles.title}>{job.title}</Text>
              <Text style={styles.companyName}>{job.company}</Text>
            </View>
          </View>
          <Text style={[
            styles.matchScore,
            job.score >= 80 ? styles.highMatch :
            job.score >= 60 ? styles.mediumMatch :
            styles.lowMatch
          ]}>
            {job.score}% Match
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <MapPin size={16} color={colors.textLight} />
            <Text style={styles.detailText}>{job.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Briefcase size={16} color={colors.textLight} />
            <Text style={styles.detailText}>{job.type}</Text>
          </View>
          {job.salary && (
            <View style={styles.detailItem}>
              <DollarSign size={16} color={colors.textLight} />
              <Text style={styles.detailText}>{job.salary}</Text>
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {job.description}
        </Text>

        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <View style={styles.skills}>
            {job.requiredSkills.slice(0, 3).map((skill, index) => (
              <View 
                key={index} 
                style={[
                  styles.skill,
                  job.matchedSkills?.includes(skill) ? styles.matchedSkill : null
                ]}
              >
                <Text 
                  style={[
                    styles.skillText,
                    job.matchedSkills?.includes(skill) ? styles.matchedSkillText : null
                  ]}
                >
                  {skill}
                </Text>
              </View>
            ))}
            {job.requiredSkills.length > 3 && (
              <Pressable 
                style={styles.skill}
                onPress={() => setShowSkills(!showSkills)}
              >
                <Text style={styles.skillText}>
                  {showSkills ? "Show less" : `+${job.requiredSkills.length - 3} more`}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {showSkills && job.requiredSkills && (
          <View style={styles.expandedSkills}>
            {job.requiredSkills.slice(3).map((skill, index) => (
              <View 
                key={index} 
                style={[
                  styles.skill,
                  job.matchedSkills?.includes(skill) ? styles.matchedSkill : null
                ]}
              >
                <Text 
                  style={[
                    styles.skillText,
                    job.matchedSkills?.includes(skill) ? styles.matchedSkillText : null
                  ]}
                >
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        )}

        {job.matchedSkills && job.matchedSkills.length > 0 && (
          <View style={styles.skillsMatchContainer}>
            <Text style={styles.skillsMatchTitle}>Your matching skills:</Text>
            <View style={styles.matchedSkillsList}>
              {job.matchedSkills.slice(0, 3).map((skill, index) => (
                <View key={index} style={styles.matchedSkillItem}>
                  <Check size={14} color={colors.success} />
                  <Text style={styles.matchedSkillItemText}>{skill}</Text>
                </View>
              ))}
              {job.matchedSkills.length > 3 && (
                <Text style={styles.moreSkillsText}>+{job.matchedSkills.length - 3} more</Text>
              )}
            </View>
          </View>
        )}

        <Pressable 
          style={styles.explanationButton} 
          onPress={() => setShowExplanation(!showExplanation)}
        >
          <Info size={16} color={colors.primary} />
          <Text style={styles.explanationButtonText}>
            {showExplanation ? "Hide match explanation" : "Why is this a match?"}
          </Text>
        </Pressable>

        {showExplanation && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationText}>{job.reason}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Apply"
            onPress={onApply}
            style={styles.actionButton}
          />
          <Button
            title="Auto Apply"
            onPress={onAutoApply}
            variant="secondary"
            style={styles.actionButton}
            icon={<Zap size={16} color={colors.primary} />}
          />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  company: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  companyName: {
    fontSize: 16,
    color: colors.textLight,
  },
  matchScore: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  highMatch: {
    backgroundColor: colors.success + '20',
    color: colors.success,
  },
  mediumMatch: {
    backgroundColor: colors.warning + '20',
    color: colors.warning,
  },
  lowMatch: {
    backgroundColor: colors.error + '20',
    color: colors.error,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: colors.textLight,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  expandedSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skill: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  matchedSkill: {
    backgroundColor: colors.primaryLight,
  },
  skillText: {
    fontSize: 14,
    color: colors.textLight,
  },
  matchedSkillText: {
    color: colors.primary,
  },
  skillsMatchContainer: {
    marginTop: 4,
  },
  skillsMatchTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
  },
  matchedSkillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  matchedSkillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchedSkillItemText: {
    fontSize: 14,
    color: colors.success,
  },
  missingSkillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  missingSkillItemText: {
    fontSize: 14,
    color: colors.error,
  },
  moreSkillsText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  explanationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  explanationButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  explanationContainer: {
    backgroundColor: colors.primaryLight + '30',
    padding: 12,
    borderRadius: 8,
    marginTop: -8,
  },
  explanationText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});