import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BANK_TRANSFER_DETAILS, formatSarPrice } from '@riq/shared';
import { ActionButton } from '../../src/components/ActionButton';
import { LanguageToggle } from '../../src/components/LanguageToggle';
import { PageHeader } from '../../src/components/PageHeader';
import { ScreenBackground } from '../../src/components/ScreenBackground';
import { EmailOtpCard } from '../../src/features/auth/EmailOtpCard';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useCart } from '../../src/features/cart/CartProvider';
import { buildCheckoutPayload } from '../../src/features/checkout/buildCheckoutPayload';
import { getCurrentDeviceLocation, reverseGeocode } from '../../src/services/location';
import { saveCheckoutDraft } from '../../src/services/paymentBridge';
import { theme } from '../../src/theme';

const DEFAULT_LAT = 24.7136;
const DEFAULT_LNG = 46.6753;

export default function CheckoutScreen() {
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const { items, subtotal } = useCart();
  const {
    isAuthenticated,
    isConfigured,
    isProfileLoading,
    isReady: isAuthReady,
    profile,
    saveProfile,
    session,
  } = useAuth();
  const isRTL = i18n.language === 'ar';
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [authPromptDismissed, setAuthPromptDismissed] = useState(false);
  const [profilePrefillApplied, setProfilePrefillApplied] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });

  const deliveryFee = subtotal >= 100 ? 0 : 15;
  const finalTotal = subtotal + deliveryFee;

  useEffect(() => {
    if (!isAuthenticated) {
      setProfilePrefillApplied(false);
      return;
    }

    if (!isAuthReady || isProfileLoading || profilePrefillApplied) {
      return;
    }

    setForm((current) => ({
      ...current,
      name: profile?.fullName || current.name,
      phone: profile?.phone || current.phone,
      email: session?.email || current.email,
      address: profile?.defaultAddress || current.address,
      notes: current.notes,
      lat: profile?.defaultLat ?? current.lat,
      lng: profile?.defaultLng ?? current.lng,
    }));
    setProfilePrefillApplied(true);
  }, [
    isAuthReady,
    isAuthenticated,
    isProfileLoading,
    profile,
    profilePrefillApplied,
    session?.email,
  ]);

  const update = (key: keyof typeof form, value: string | number) =>
    setForm((current) => ({ ...current, [key]: value }));

  const useCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const location = await getCurrentDeviceLocation();
      setForm((current) => ({
        ...current,
        lat: location.lat,
        lng: location.lng,
        address: location.address || current.address,
      }));
    } catch {
      Alert.alert(
        isRTL ? 'تعذر تحديد الموقع' : 'Unable to access location',
        isRTL
          ? 'اسمح بالوصول للموقع أو اكتب العنوان يدويًا.'
          : 'Allow location access or type the address manually.'
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleMapCoordinate = async (latitude: number, longitude: number) => {
    update('lat', latitude);
    update('lng', longitude);
    const address = await reverseGeocode(latitude, longitude);
    if (address) {
      update('address', address);
    }
  };

  const continueToPayment = async () => {
    setProfileSaveError('');

    if (!items.length || !form.name || !form.phone || !form.address) {
      Alert.alert(
        isRTL ? 'بيانات ناقصة' : 'Incomplete details',
        isRTL
          ? 'الاسم والجوال والعنوان مطلوبة قبل الدفع.'
          : 'Name, phone, and address are required before payment.'
      );
      return;
    }

    if (isAuthenticated) {
      try {
        await saveProfile({
          fullName: form.name,
          phone: form.phone,
          defaultAddress: form.address,
          defaultLat: form.lat,
          defaultLng: form.lng,
          locale: isRTL ? 'ar' : 'en',
        });
      } catch (error) {
        setProfileSaveError(
          error instanceof Error
            ? error.message
            : (isRTL
                ? 'تعذر حفظ بيانات الحساب الآن. حاول مرة أخرى قبل متابعة الدفع.'
                : 'Unable to save your account details right now. Please retry before payment.')
        );
        return;
      }
    }

    const payload = buildCheckoutPayload({
      locale: isRTL ? 'ar' : 'en',
      customerName: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      notes: form.notes,
      lat: form.lat,
      lng: form.lng,
      items,
    });

    await saveCheckoutDraft(payload);
    router.push('/checkout/payment');
  };

  const renderAccountBlock = () => {
    if (!isAuthReady) {
      return (
        <View style={styles.accountCard}>
          <Text style={[styles.accountTitle, isRTL && styles.alignRight]}>
            {isRTL ? 'جارٍ تجهيز حالة الحساب' : 'Preparing account status'}
          </Text>
          <Text style={[styles.accountBody, isRTL && styles.alignRight]}>
            {isRTL
              ? 'نراجع إذا كان لديك حساب محفوظ على هذا الجهاز حتى نملأ البيانات تلقائيًا.'
              : 'Checking whether a saved account is already available on this device.'}
          </Text>
        </View>
      );
    }

    if (isAuthenticated) {
      return (
        <View style={styles.accountCard}>
          <Text style={[styles.accountTitle, isRTL && styles.alignRight]}>
            {isRTL ? 'تم تسجيل الدخول للحساب' : 'Signed in for saved checkout'}
          </Text>
          <Text style={[styles.accountBody, isRTL && styles.alignRight]}>
            {isRTL
              ? `أنت مسجل بواسطة ${session?.email ?? 'حسابك'}. سنحفظ بيانات الطلب هذه داخل التطبيق ونملأ معلوماتك بشكل أسرع في المرات القادمة.`
              : `You are signed in as ${session?.email ?? 'your account'}. This checkout can save your details for faster future orders.`}
          </Text>
          <View style={styles.accountMetaWrap}>
            <View style={styles.accountMetaBadge}>
              <Text style={styles.accountMetaLabel}>
                {isRTL ? 'الاسم المحفوظ' : 'Saved name'}
              </Text>
              <Text style={styles.accountMetaValue}>{profile?.fullName || form.name || '—'}</Text>
            </View>
            <View style={styles.accountMetaBadge}>
              <Text style={styles.accountMetaLabel}>
                {isRTL ? 'الجوال المحفوظ' : 'Saved phone'}
              </Text>
              <Text style={styles.accountMetaValue}>{profile?.phone || form.phone || '—'}</Text>
            </View>
          </View>
          <ActionButton
            testID="checkout-open-account-button"
            label={isRTL ? 'فتح صفحة الحساب' : 'Open account'}
            variant="secondary"
            onPress={() => router.push('/account')}
          />
          {profileSaveError ? (
            <Text style={[styles.errorText, isRTL && styles.alignRight]}>{profileSaveError}</Text>
          ) : null}
        </View>
      );
    }

    if (!authPromptDismissed) {
      return (
        <EmailOtpCard
          isRTL={isRTL}
          title={
            isRTL
              ? 'سجّل بالإيميل لحفظ بياناتك وطلباتك'
              : 'Sign in with email to save your details and orders'
          }
          body={
            isConfigured
              ? (isRTL
                  ? 'التسجيل اختياري بالكامل. إذا سجلت الآن سيظهر لك سجل الطلبات لاحقًا وتُحفظ بياناتك الأساسية لهذا الجهاز.'
                  : 'This is completely optional. Sign in now to keep your basics saved and review your successful mobile orders later.')
              : (isRTL
                  ? 'حفظ الحسابات يحتاج تفعيل مفاتيح Supabase في إعدادات التطبيق. يمكنك الآن إكمال الطلب كضيف.'
                  : 'Saved accounts need Supabase keys configured for the app. You can still continue as a guest right now.')
          }
          testIDPrefix="checkout-auth"
          guestLabel={isRTL ? 'إكمال الطلب كضيف' : 'Continue as guest'}
          onGuestPress={() => setAuthPromptDismissed(true)}
        />
      );
    }

    return (
      <View style={styles.accountCard}>
        <Text style={[styles.accountTitle, isRTL && styles.alignRight]}>
          {isRTL ? 'ستكمل هذا الطلب كضيف' : 'Continuing this checkout as a guest'}
        </Text>
        <Text style={[styles.accountBody, isRTL && styles.alignRight]}>
          {isRTL
            ? 'يمكنك متابعة الطلب الآن بدون تسجيل. وإذا رغبت لاحقًا، افتح الحساب أو عد إلى خيار تسجيل الإيميل لحفظ بياناتك وطلباتك.'
            : 'You can finish this order without signing in. If you change your mind later, reopen the email sign-in option and save your details.'}
        </Text>
        <ActionButton
          testID="checkout-auth-reopen-button"
          label={isRTL ? 'فتح تسجيل الإيميل' : 'Open email sign-in'}
          variant="secondary"
          onPress={() => setAuthPromptDismissed(false)}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PageHeader
          title={t('checkout.title')}
          subtitle={t('checkout.subtitle')}
          align={isRTL ? 'right' : 'left'}
          action={{
            label: isRTL ? 'حسابي' : 'Account',
            onPress: () => router.push('/account'),
            variant: 'secondary',
            testID: 'checkout-account-action',
          }}
        >
          <LanguageToggle />
        </PageHeader>

        {renderAccountBlock()}

        <View style={styles.card}>
          <Field
            testID="checkout-name-input"
            label={isRTL ? 'الاسم' : 'Name'}
            value={form.name}
            onChangeText={(value) => update('name', value)}
            isRTL={isRTL}
          />
          <Field
            testID="checkout-phone-input"
            label={isRTL ? 'الجوال' : 'Phone'}
            value={form.phone}
            onChangeText={(value) => update('phone', value)}
            isRTL={isRTL}
            keyboardType="phone-pad"
          />
          <Field
            testID="checkout-email-input"
            label={isRTL ? 'البريد' : 'Email'}
            value={form.email}
            onChangeText={(value) => update('email', value)}
            isRTL={isRTL}
            keyboardType="email-address"
            editable={!isAuthenticated}
          />
          <Field
            testID="checkout-address-input"
            label={isRTL ? 'العنوان' : 'Address'}
            value={form.address}
            onChangeText={(value) => update('address', value)}
            isRTL={isRTL}
            multiline
          />
          <Field
            testID="checkout-notes-input"
            label={isRTL ? 'ملاحظات' : 'Notes'}
            value={form.notes}
            onChangeText={(value) => update('notes', value)}
            isRTL={isRTL}
            multiline
          />
          <ActionButton
            testID="checkout-use-location-button"
            label={loadingLocation ? t('common.loading') : t('common.locateMe')}
            variant="secondary"
            onPress={useCurrentLocation}
          />
        </View>

        <View style={styles.card}>
          <Text style={[styles.mapTitle, isRTL && styles.alignRight]}>
            {isRTL ? 'ثبّت العنوان من الخريطة' : 'Confirm the address on the map'}
          </Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: form.lat,
              longitude: form.lng,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
            region={{
              latitude: form.lat,
              longitude: form.lng,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
            onPress={(event) =>
              handleMapCoordinate(
                event.nativeEvent.coordinate.latitude,
                event.nativeEvent.coordinate.longitude
              )
            }
          >
            <Marker
              coordinate={{
                latitude: form.lat,
                longitude: form.lng,
              }}
              draggable
              onDragEnd={(event) =>
                handleMapCoordinate(
                  event.nativeEvent.coordinate.latitude,
                  event.nativeEvent.coordinate.longitude
                )
              }
            />
          </MapView>
        </View>

        <View style={styles.card}>
          <Row
            label={isRTL ? 'المجموع الفرعي' : 'Subtotal'}
            value={formatSarPrice(subtotal, isRTL)}
            isRTL={isRTL}
          />
          <Row
            label={isRTL ? 'رسوم التوصيل' : 'Delivery fee'}
            value={formatSarPrice(deliveryFee, isRTL)}
            isRTL={isRTL}
          />
          <Row
            label={isRTL ? 'الإجمالي النهائي' : 'Final total'}
            value={formatSarPrice(finalTotal, isRTL)}
            isRTL={isRTL}
            strong
          />
          <ActionButton
            testID="checkout-continue-button"
            label={t('common.placeOrder')}
            onPress={continueToPayment}
          />
        </View>

        <View style={styles.card}>
          <Text style={[styles.bankTitle, isRTL && styles.alignRight]}>
            {isRTL ? 'بيانات التحويل البنكي' : 'Bank transfer details'}
          </Text>
          <Text style={[styles.bankSubtitle, isRTL && styles.alignRight]}>
            {isRTL ? BANK_TRANSFER_DETAILS.bankNameAr : BANK_TRANSFER_DETAILS.bankNameEn}
          </Text>
          <BankLine
            label={isRTL ? 'اسم صاحب الحساب' : 'Account holder'}
            value={isRTL ? BANK_TRANSFER_DETAILS.accountNameAr : BANK_TRANSFER_DETAILS.accountNameEn}
            isRTL={isRTL}
          />
          <BankLine
            label={isRTL ? 'رقم الحساب' : 'Account number'}
            value={BANK_TRANSFER_DETAILS.accountNumber}
            isRTL={isRTL}
            ltr
          />
          <BankLine label="IBAN" value={BANK_TRANSFER_DETAILS.iban} isRTL={isRTL} ltr />
          <Text style={[styles.bankNote, isRTL && styles.alignRight]}>
            {isRTL
              ? 'بعد التحويل، تواصل معنا عبر واتساب لتأكيد الطلب وإرفاق إيصال التحويل.'
              : 'After transferring, contact us on WhatsApp to confirm the order and attach the transfer receipt.'}
          </Text>
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
  editable = true,
}: {
  testID: string;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  isRTL: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  editable?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.fieldLabel, isRTL && styles.alignRight]}>{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize="none"
        textAlign={isRTL ? 'right' : 'left'}
        style={[styles.input, multiline && styles.multiline, !editable && styles.inputDisabled]}
      />
    </View>
  );
}

function Row({
  label,
  value,
  isRTL,
  strong,
}: {
  label: string;
  value: string;
  isRTL: boolean;
  strong?: boolean;
}) {
  return (
    <View style={[styles.row, isRTL && styles.rowRtl]}>
      <Text style={[styles.rowLabel, strong && styles.strongText]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.strongValue]}>{value}</Text>
    </View>
  );
}

function BankLine({
  label,
  value,
  isRTL,
  ltr,
}: {
  label: string;
  value: string;
  isRTL: boolean;
  ltr?: boolean;
}) {
  return (
    <View style={styles.bankLine}>
      <Text style={[styles.bankLabel, isRTL && styles.alignRight]}>{label}</Text>
      <Text style={[styles.bankValue, isRTL && styles.alignRight, ltr && styles.ltr]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 18,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: 14,
  },
  accountCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: 14,
  },
  accountTitle: {
    color: theme.colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  accountBody: {
    color: theme.colors.muted,
    lineHeight: 22,
  },
  accountMetaWrap: {
    flexDirection: 'row',
    gap: 10,
  },
  accountMetaBadge: {
    flex: 1,
    backgroundColor: theme.colors.sand,
    borderRadius: 20,
    padding: 14,
    gap: 6,
  },
  accountMetaLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  accountMetaValue: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  fieldLabel: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  input: {
    minHeight: 52,
    borderRadius: 20,
    backgroundColor: theme.colors.sand,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.colors.text,
  },
  inputDisabled: {
    opacity: 0.72,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  mapTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  map: {
    width: '100%',
    height: 260,
    borderRadius: 22,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rowLabel: {
    color: theme.colors.muted,
  },
  rowValue: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  strongText: {
    color: theme.colors.ink,
    fontWeight: '800',
  },
  strongValue: {
    color: theme.colors.accent,
    fontSize: 16,
  },
  bankTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  bankSubtitle: {
    color: theme.colors.accent,
    fontWeight: '800',
  },
  bankLine: {
    backgroundColor: theme.colors.sand,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  bankLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  bankValue: {
    color: theme.colors.text,
    fontWeight: '800',
    lineHeight: 22,
  },
  bankNote: {
    color: theme.colors.muted,
    lineHeight: 22,
    fontWeight: '600',
  },
  ltr: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  errorText: {
    color: theme.colors.danger,
    lineHeight: 22,
    fontWeight: '600',
  },
  alignRight: {
    textAlign: 'right',
  },
});
