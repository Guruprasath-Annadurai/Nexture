import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { Card } from '@/components/Card';
import { Section } from '@/components/Section';
import { StatBlock } from '@/components/StatBlock';
import { colors } from '@/constants/colors';
import { 
  FileText, 
  Calendar, 
  BookOpen, 
  History, 
  PlusCircle, 
  FileEdit, 
  Award, 
  TrendingUp 
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    applications: 0,
    matchScore: 0,
    interviews: 0,
    views: 0
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        applications: 24,
        matchScore: 82,
        interviews: 5,
        views: 120
      });
    }, 1000);

    // Start the fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Create animation values for staggered animations
    const quickAccessItems = 4; // Number of quick access cards
    const recommendedItems = 2; // Number of recommended steps cards
    
    for (let i = 0; i < quickAccessItems + recommendedItems; i++) {
      cardAnims.push(new Animated.Value(0));
    }
    
    // Start staggered animations for cards
    Animated.stagger(
      100,
      cardAnims.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      )
    ).start();
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const quickAccessItems = [
    {
      title: "Resume Assistant",
      description: "Improve your resume with AI help.",
      icon: <FileText size={24} color={colors.primary} />,
      route: "/resume-assistant"
    },
    {
      title: "Interview Calendar",
      description: "View upcoming events and interviews.",
      icon: <Calendar size={24} color={colors.primary} />,
      route: "/calendar"
    },
    {
      title: "Learn Hub",
      description: "Courses and tips to level up fast.",
      icon: <BookOpen size={24} color={colors.primary} />,
      route: "/learn"
    },
    {
      title: "Application History",
      description: "View and manage past job applications.",
      icon: <History size={24} color={colors.primary} />,
      route: "/jobs/applied"
    }
  ];

  const recommendedSteps = [
    {
      title: "Add More Skills",
      description: "Boost your profile by adding more keywords from your target roles.",
      icon: <PlusCircle size={24} color={colors.primary} />,
      route: "/profile/edit"
    },
    {
      title: "Generate Cover Letter",
      description: "Let our AI craft a perfect letter for your next application.",
      icon: <FileEdit size={24} color={colors.primary} />,
      route: "/resume-assistant/cover-letter"
    }
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Dashboard' }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Welcome back, {user?.name?.split(' ')[0] || "User"} 👋</Text>
            <Text style={styles.subGreeting}>Here's your career dashboard</Text>
          </View>
        </Animated.View>
        
        <Animated.View style={{ opacity: fadeAnim }}>
          <Section 
            title="📈 Career Overview" 
            icon={<TrendingUp size={20} color={colors.primary} />}
            style={styles.section}
          >
            <View style={styles.statsGrid}>
              <StatBlock 
                label="Applications Sent" 
                value={stats.applications.toString()} 
                icon={<FileText size={24} color={colors.primaryLight} />}
                style={styles.statBlock}
              />
              
              <StatBlock 
                label="Avg. Match Score" 
                value={`${stats.matchScore}%`} 
                icon={<Award size={24} color={colors.primaryLight} />}
                style={styles.statBlock}
              />
              
              <StatBlock 
                label="Interviews" 
                value={stats.interviews.toString()} 
                icon={<Calendar size={24} color={colors.primaryLight} />}
                style={styles.statBlock}
              />
              
              <StatBlock 
                label="Profile Views" 
                value={stats.views.toString()} 
                icon={<TrendingUp size={24} color={colors.primaryLight} />}
                style={styles.statBlock}
              />
            </View>
          </Section>
        </Animated.View>
        
        <Section 
          title="⚡ Quick Access" 
          style={styles.section}
        >
          <View style={styles.quickAccessGrid}>
            {quickAccessItems.map((item, index) => (
              <Animated.View 
                key={item.title}
                style={{
                  opacity: cardAnims[index] || fadeAnim,
                  transform: [{ 
                    translateY: (cardAnims[index] || fadeAnim).interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }],
                  width: '48%'
                }}
              >
                <Link href={item.route} asChild>
                  <TouchableOpacity>
                    <Card style={styles.quickAccessCard}>
                      <View style={styles.cardIconContainer}>
                        {item.icon}
                      </View>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardDescription}>{item.description}</Text>
                    </Card>
                  </TouchableOpacity>
                </Link>
              </Animated.View>
            ))}
          </View>
        </Section>
        
        <Section 
          title="🔥 Recommended Next Steps" 
          style={styles.section}
        >
          {recommendedSteps.map((item, index) => (
            <Animated.View 
              key={item.title}
              style={{
                opacity: cardAnims[index + quickAccessItems.length] || fadeAnim,
                transform: [{ 
                  translateY: (cardAnims[index + quickAccessItems.length] || fadeAnim).interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }}
            >
              <Link href={item.route} asChild>
                <TouchableOpacity>
                  <Card style={styles.recommendedCard}>
                    <View style={styles.recommendedCardContent}>
                      <View style={styles.recommendedCardIcon}>
                        {item.icon}
                      </View>
                      <View style={styles.recommendedCardText}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardDescription}>{item.description}</Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              </Link>
            </Animated.View>
          ))}
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subGreeting: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBlock: {
    width: '48%',
    marginBottom: 0,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickAccessCard: {
    padding: 16,
    alignItems: 'center',
    height: 160,
    justifyContent: 'center',
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  recommendedCard: {
    marginBottom: 12,
    padding: 16,
  },
  recommendedCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendedCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recommendedCardText: {
    flex: 1,
  },
});