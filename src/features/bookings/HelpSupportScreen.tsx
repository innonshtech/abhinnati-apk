import React from 'react';
import { StyleSheet, Text, View, Pressable, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '../../store/useAuthStore';
import { RootStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomChevronLeft, CustomChevronRight } from '../../components/common/Icons';

type NavigationProp = StackNavigationProp<RootStackParamList, 'HelpSupport'>;

export const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { preferredLanguage } = useAuthStore();

  const isMr = preferredLanguage === 'mr';

  const strings = {
    title: isMr ? 'मदत आणि सहकार्य' : 'Help & Support',
    popularTopics: isMr ? 'लोकप्रिय विषय' : 'Popular topics',
    stillNeedHelp: isMr ? 'अजूनही मदत हवी आहे?' : 'Still need help?',
    chatWithTeam: isMr ? 'आमच्या टीमसोबत चॅट करा' : 'Chat with our team',
    hours: '· 9AM - 9PM',
    startChat: isMr ? 'चॅट सुरू करा' : 'Start chat',
    faq1: isMr ? 'मी सेवा कशी बुक करू?' : 'How do I book a service?',
    faq2: isMr ? 'रद्द करणे आणि परतावा' : 'Cancellations & refunds',
    faq3: isMr ? 'पेमेंट आणि पावत्या' : 'Payments & receipts',
    faq4: isMr ? 'विक्रेता पडताळणी' : 'Vendor verification',
    faq5: isMr ? 'समस्या नोंदवा' : 'Report a problem',
  };

  const handleTopicPress = (topic: string) => {
    Alert.alert(isMr ? 'मदत विषय' : 'Help Topic', topic);
  };

  const handleStartChat = () => {
    Alert.alert(isMr ? 'चॅट सुरू होत आहे...' : 'Starting Chat...');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={15}>
          <CustomChevronLeft size={20} color="#2A2520" strokeWidth={3} />
          <Text style={styles.backText}>{strings.title}</Text>
        </Pressable>
      </View>

      {/* Header Divider */}
      <View style={styles.headerDivider} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section: Popular Topics */}
        <Text style={styles.sectionLabel}>{strings.popularTopics}</Text>

        {/* Topic 1 */}
        <Pressable onPress={() => handleTopicPress(strings.faq1)} style={styles.topicCard}>
          <Text style={styles.topicText}>{strings.faq1}</Text>
          <CustomChevronRight size={14} color="#C9A877" strokeWidth={3.5} />
        </Pressable>

        {/* Topic 2 */}
        <Pressable onPress={() => handleTopicPress(strings.faq2)} style={styles.topicCard}>
          <Text style={styles.topicText}>{strings.faq2}</Text>
          <CustomChevronRight size={14} color="#C9A877" strokeWidth={3.5} />
        </Pressable>

        {/* Topic 3 */}
        <Pressable onPress={() => handleTopicPress(strings.faq3)} style={styles.topicCard}>
          <Text style={styles.topicText}>{strings.faq3}</Text>
          <CustomChevronRight size={14} color="#C9A877" strokeWidth={3.5} />
        </Pressable>

        {/* Topic 4 */}
        <Pressable onPress={() => handleTopicPress(strings.faq4)} style={styles.topicCard}>
          <Text style={styles.topicText}>{strings.faq4}</Text>
          <CustomChevronRight size={14} color="#C9A877" strokeWidth={3.5} />
        </Pressable>

        {/* Topic 5 */}
        <Pressable onPress={() => handleTopicPress(strings.faq5)} style={styles.topicCard}>
          <Text style={styles.topicText}>{strings.faq5}</Text>
          <CustomChevronRight size={14} color="#C9A877" strokeWidth={3.5} />
        </Pressable>

        {/* Section: Still Need Help? */}
        <Text style={[styles.sectionLabel, styles.marginSection]}>{strings.stillNeedHelp}</Text>

        {/* Chat Support Card */}
        <View style={styles.chatCard}>
          <View style={styles.chatHeaderRow}>
            <Text style={styles.chatTitleText}>{strings.chatWithTeam}</Text>
            <Text style={styles.chatHoursText}>{strings.hours}</Text>
          </View>

          <Pressable onPress={handleStartChat} style={styles.chatBtn}>
            <Text style={styles.chatBtnText}>{strings.startChat}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6EC',
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 98,
    backgroundColor: '#FBF6EC',
    zIndex: 10,
  },
  backBtn: {
    position: 'absolute',
    left: 22,
    top: 58,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#2A2520',
    marginLeft: 6,
    lineHeight: 25,
  },
  headerDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 98,
    height: 1,
    backgroundColor: '#EFE3CC',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 112, // adjusted to prevent header overlapping while maintaining a tight gap
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#6B5F4E',
    marginBottom: 4,
    lineHeight: 22,
  },
  marginSection: {
    marginTop: 16, // aligns Still Need Help to Y=438 layout coords
  },
  topicCard: {
    width: 357,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3CC',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8, // aligns successive topic cards perfectly with Y spacing
  },
  topicText: {
    fontSize: 15,
    fontFamily: 'Mukta-Medium',
    fontWeight: '500',
    color: '#2A2520',
    lineHeight: 25,
  },
  chatCard: {
    width: 357,
    height: 98,
    backgroundColor: '#FDF1DF',
    borderWidth: 1.2,
    borderColor: '#E58A2B',
    borderRadius: 16,
    padding: 16,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  chatTitleText: {
    fontSize: 15,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#2A2520',
    lineHeight: 25,
  },
  chatHoursText: {
    fontSize: 12,
    fontFamily: 'Mukta-Regular',
    color: '#6B5F4E',
    marginLeft: 4,
    lineHeight: 20,
  },
  chatBtn: {
    width: 325,
    height: 34,
    backgroundColor: '#2A2520',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBtnText: {
    fontSize: 14,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 23,
  },
});

export default HelpSupportScreen;
