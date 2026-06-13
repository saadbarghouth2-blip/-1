import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  buildContactWhatsAppLink,
  BUSINESS_ADDRESS_AR,
  BUSINESS_ADDRESS_EN,
  CONTACT_CONFIG,
  localizeText,
  sendContactEmail,
} from '@riq/shared';
import { ActionButton } from '../src/components/ActionButton';
import { AccountEntryButton } from '../src/components/AccountEntryButton';
import { FaqAccordion } from '../src/components/FaqAccordion';
import { LanguageToggle } from '../src/components/LanguageToggle';
import { PageHeader } from '../src/components/PageHeader';
import { ScreenBackground } from '../src/components/ScreenBackground';
import { storefrontContent } from '../src/content/storefront';
import { openExternalUrl } from '../src/services/linking';
import { theme } from '../src/theme';

const MAPS_LINK = 'https://maps.google.com/?q=Riyadh%20Saudi%20Arabia';

export default function ContactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    if (!form.name || !form.email || !form.message) {
      Alert.alert(
        isRTL ? 'بيانات ناقصة' : 'Missing fields',
        isRTL
          ? 'الاسم والبريد والرسالة مطلوبين.'
          : 'Name, email, and message are required.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await sendContactEmail({
        ...form,
        isRTL,
      });
      Alert.alert(
        isRTL ? 'تم الإرسال' : 'Sent',
        isRTL
          ? 'وصلتنا رسالتك بنجاح.'
          : 'Your message has been sent successfully.'
      );
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      Alert.alert(
        isRTL ? 'تعذر الإرسال' : 'Unable to send',
        isRTL
          ? 'جرّب واتساب أو أعد المحاولة لاحقًا.'
          : 'Try WhatsApp or retry in a moment.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsApp = () =>
    openExternalUrl(
      buildContactWhatsAppLink(
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          message:
            form.message ||
            (isRTL
              ? 'استفسار جديد من التطبيق'
              : 'A new inquiry from the app'),
        },
        isRTL
      )
    );

  const quickActions = [
    {
      id: 'call',
      title: isRTL ? 'اتصال مباشر' : 'Call now',
      body: CONTACT_CONFIG.phoneNumbers.map((phone) => phone.display).join(' / '),
      icon: 'call-outline' as const,
      action: () => openExternalUrl(CONTACT_CONFIG.phoneHref),
    },
    {
      id: 'whatsapp',
      title: isRTL ? 'واتساب' : 'WhatsApp',
      body: isRTL ? 'أسرع قناة متابعة' : 'Usually the fastest follow-up path',
      icon: 'logo-whatsapp' as const,
      action: openWhatsApp,
    },
    {
      id: 'email',
      title: isRTL ? 'بريد' : 'Email',
      body: CONTACT_CONFIG.email,
      icon: 'mail-outline' as const,
      action: () => openExternalUrl(CONTACT_CONFIG.emailHref),
    },
    {
      id: 'maps',
      title: isRTL ? 'الموقع' : 'Maps',
      body: isRTL ? BUSINESS_ADDRESS_AR : BUSINESS_ADDRESS_EN,
      icon: 'location-outline' as const,
      action: () => openExternalUrl(MAPS_LINK),
    },
  ];

  const faqs = storefrontContent.sharedFaqs.map((item) => ({
    id: item.id,
    question: localizeText(item.question, isRTL),
    answer: localizeText(item.answer, isRTL),
  }));

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 14) + 10 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title={t('contact.title')}
          subtitle={t('contact.subtitle')}
          align={isRTL ? 'right' : 'left'}
          backButton={{ onPress: () => router.back(), testID: 'contact-back-button' }}
        >
          <>
            <AccountEntryButton testID="contact-account-action" />
            <LanguageToggle />
          </>
        </PageHeader>

        <View style={styles.section}>
          <PageHeader
            title={isRTL ? 'قنوات التواصل السريعة' : 'Fast contact channels'}
            subtitle={
              isRTL
                ? 'اختر القناة الأقرب لاحتياجك بدل البحث داخل عدة شاشات.'
                : 'Choose the channel that fits your need without bouncing through extra screens.'
            }
            align={isRTL ? 'right' : 'left'}
          />
          <View style={styles.quickActionsGrid}>
            {quickActions.map((item) => (
              <Pressable
                key={item.id}
                testID={`contact-quick-${item.id}`}
                onPress={item.action}
                style={styles.quickActionCard}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name={item.icon} size={20} color={theme.colors.accent} />
                </View>
                <Text style={[styles.quickActionTitle, isRTL && styles.alignRight]}>
                  {item.title}
                </Text>
                <Text style={[styles.quickActionBody, isRTL && styles.alignRight]}>
                  {item.body}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <PageHeader
            title={isRTL ? 'لماذا هذه الصفحة أوضح' : 'Why this contact flow is clearer'}
            subtitle={
              isRTL
                ? 'محتوى مختصر يوضح ما الذي سيحدث بعد التواصل.'
                : 'Short content that explains what happens after you reach out.'
            }
            align={isRTL ? 'right' : 'left'}
          />
          <View style={styles.cardStack}>
            {storefrontContent.contact.responseHighlights.map((item) => (
              <View key={item.id} style={styles.infoCard}>
                <Text style={[styles.infoTitle, isRTL && styles.alignRight]}>
                  {localizeText(item.title, isRTL)}
                </Text>
                <Text style={[styles.infoBody, isRTL && styles.alignRight]}>
                  {localizeText(item.body, isRTL)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <PageHeader
            title={isRTL ? 'ابدأ من موضوع جاهز' : 'Start from a preset topic'}
            subtitle={
              isRTL
                ? 'اضغط على النوع المناسب وسنجهّز لك الموضوع ونص الرسالة مبدئيًا.'
                : 'Tap the request type and we will prefill the subject and message for you.'
            }
            align={isRTL ? 'right' : 'left'}
          />
          <View style={styles.cardStack}>
            {storefrontContent.contact.topicPresets.map((topic) => (
              <Pressable
                key={topic.id}
                testID={`contact-topic-${topic.id}`}
                onPress={() =>
                  setForm((current) => ({
                    ...current,
                    subject: topic.subject,
                    message: localizeText(topic.message, isRTL),
                  }))
                }
                style={styles.topicCard}
              >
                <Text style={[styles.topicTitle, isRTL && styles.alignRight]}>
                  {localizeText(topic.title, isRTL)}
                </Text>
                <Text style={[styles.topicBody, isRTL && styles.alignRight]}>
                  {localizeText(topic.description, isRTL)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.formCard}>
          <Field
            testID="contact-name-input"
            label={t('contact.name')}
            value={form.name}
            onChangeText={(value) => update('name', value)}
            isRTL={isRTL}
          />
          <Field
            testID="contact-email-input"
            label={t('contact.email')}
            value={form.email}
            onChangeText={(value) => update('email', value)}
            isRTL={isRTL}
            keyboardType="email-address"
          />
          <Field
            testID="contact-phone-input"
            label={t('contact.phone')}
            value={form.phone}
            onChangeText={(value) => update('phone', value)}
            isRTL={isRTL}
            keyboardType="phone-pad"
          />
          <Field
            testID="contact-subject-input"
            label={t('contact.subject')}
            value={form.subject}
            onChangeText={(value) => update('subject', value)}
            isRTL={isRTL}
          />
          <Field
            testID="contact-message-input"
            label={t('contact.message')}
            value={form.message}
            onChangeText={(value) => update('message', value)}
            isRTL={isRTL}
            multiline
          />
          <View style={[styles.formActions, isRTL && styles.actionsRtl]}>
            <ActionButton
              label={isSubmitting ? t('common.loading') : t('common.send')}
              onPress={submit}
            />
            <ActionButton
              label={isRTL ? 'فتح واتساب' : 'Open WhatsApp'}
              variant="secondary"
              onPress={openWhatsApp}
            />
          </View>
        </View>

        <View style={styles.section}>
          <PageHeader
            title={isRTL ? 'أسئلة شائعة قبل التواصل' : 'FAQ before you reach out'}
            subtitle={
              isRTL
                ? 'إجابات سريعة قد تختصر عليك وقت الرسالة نفسها.'
                : 'Quick answers that may save you time before sending the message.'
            }
            align={isRTL ? 'right' : 'left'}
          />
          <FaqAccordion
            items={faqs}
            isRTL={isRTL}
            initialOpenId={faqs[0]?.id}
            testIDPrefix="contact-faq"
          />
        </View>
      </ScrollView>
    </View>
  );
}

function Field({
  testID,
  label,
  value,
  onChangeText,
  isRTL,
  multiline,
  keyboardType,
}: {
  testID: string;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  isRTL: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.fieldLabel, isRTL && styles.alignRight]}>{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        textAlign={isRTL ? 'right' : 'left'}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    gap: 18,
  },
  section: {
    gap: 14,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: 8,
  },
  quickActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  quickActionBody: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  cardStack: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: 8,
  },
  infoTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  infoBody: {
    color: theme.colors.muted,
    lineHeight: 22,
  },
  topicCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: 8,
  },
  topicTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  topicBody: {
    color: theme.colors.muted,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: 14,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionsRtl: {
    flexDirection: 'row-reverse',
  },
  fieldLabel: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  input: {
    minHeight: 52,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.sand,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.colors.text,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  alignRight: {
    textAlign: 'right',
  },
});
