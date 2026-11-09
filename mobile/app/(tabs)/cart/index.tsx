import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { buildOrderWhatsAppLink, formatSarPrice, getCartDeliveryRuleState } from '@riq/shared';
import { ActionButton } from '../../../src/components/ActionButton';
import { AccountEntryButton } from '../../../src/components/AccountEntryButton';
import { CartItemCard } from '../../../src/components/CartItemCard';
import { EmptyState } from '../../../src/components/EmptyState';
import { LanguageToggle } from '../../../src/components/LanguageToggle';
import { PageHeader } from '../../../src/components/PageHeader';
import { ScreenBackground } from '../../../src/components/ScreenBackground';
import { useCart } from '../../../src/features/cart/CartProvider';
import { openExternalUrl } from '../../../src/services/linking';
import { theme } from '../../../src/theme';

export default function CartScreen() {
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const { items, totalItems, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const isRTL = i18n.language === 'ar';
  const deliveryRule = getCartDeliveryRuleState(items);
  const deliveryFee = deliveryRule.deliveryFee;
  const finalTotal = subtotal + deliveryFee;

  if (!items.length) {
    return (
      <View style={{ flex: 1 }}>
        <ScreenBackground />
        <View style={styles.emptyContent}>
          <PageHeader
            title={t('cart.title')}
            subtitle={t('cart.subtitle')}
            align={isRTL ? 'right' : 'left'}
          >
            <>
              <AccountEntryButton testID="cart-empty-account-action" />
              <LanguageToggle />
            </>
          </PageHeader>
          <EmptyState
            title={t('cart.emptyTitle')}
            body={t('cart.emptyBody')}
            ctaLabel={t('tabs.products')}
            onPress={() => router.push('/products')}
          />
        </View>
      </View>
    );
  }

  const sendOrderToWhatsApp = async () => {
    try {
      await openExternalUrl(
        buildOrderWhatsAppLink({
          customerName: isRTL ? 'عميل التطبيق' : 'App customer',
          phone: '',
          items: items.map((item) => ({
            name: isRTL ? item.product.name.ar : item.product.name.en,
            quantity: item.quantity,
            unitPrice: item.product.price,
            lineTotal: item.product.price * item.quantity,
          })),
          totalItems,
          subtotal,
          deliveryFee,
          discount: 0,
          finalTotal,
          isRTL,
        })
      );
    } catch {
      Alert.alert(
        isRTL ? 'تعذر فتح واتساب' : 'Unable to open WhatsApp',
        isRTL ? 'حاول مرة أخرى بعد قليل.' : 'Please try again in a moment.'
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PageHeader
          title={t('cart.title')}
          subtitle={t('cart.subtitle')}
          align={isRTL ? 'right' : 'left'}
        >
          <>
            <AccountEntryButton testID="cart-account-action" />
            <LanguageToggle />
          </>
        </PageHeader>

        <View style={styles.list}>
          {items.map((item) => (
            <CartItemCard
              key={item.product.id}
              product={item.product}
              quantity={item.quantity}
              isRTL={isRTL}
              onIncrease={() => updateQuantity(item.product.id, item.quantity + 1)}
              onDecrease={() => updateQuantity(item.product.id, item.quantity - 1)}
              onRemove={() => removeFromCart(item.product.id)}
            />
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Row label={t('cart.subtotal')} value={formatSarPrice(subtotal, isRTL)} isRTL={isRTL} />
          <Row label={t('cart.delivery')} value={formatSarPrice(deliveryFee, isRTL)} isRTL={isRTL} />
          <Row label={t('cart.total')} value={formatSarPrice(finalTotal, isRTL)} isRTL={isRTL} strong />
          <Text style={[styles.note, isRTL && styles.alignRight]}>
            {deliveryRule.hasFreeDelivery
              ? (isRTL ? 'التوصيل مجاني لهذا الطلب.' : 'This order has free delivery.')
              : deliveryRule.canDeliver
                ? (isRTL
                    ? `رسوم التوصيل 25 ريال. المتبقي للمجاني: ${deliveryRule.getFreeDeliveryShortfall(true)}.`
                    : `Delivery costs 25 SAR. Remaining for free delivery: ${deliveryRule.getFreeDeliveryShortfall(false)}.`)
                : (isRTL
                    ? `أكمل الحد الأدنى: ${deliveryRule.getMinimumShortfall(true)}.`
                    : `Complete the minimum: ${deliveryRule.getMinimumShortfall(false)}.`)}
          </Text>
          <View style={[styles.actions, isRTL && styles.actionsRtl]}>
            <ActionButton
              testID="cart-clear-button"
              label={t('common.clear')}
              variant="secondary"
              onPress={clearCart}
            />
            <ActionButton
              testID="cart-checkout-button"
              label={t('common.checkout')}
              onPress={() => router.push('/checkout')}
              disabled={!deliveryRule.canDeliver}
            />
          </View>
          <ActionButton
            testID="cart-whatsapp-button"
            label={isRTL ? 'إرسال الطلب إلى واتساب' : 'Send order to WhatsApp'}
            variant="ghost"
            onPress={sendOrderToWhatsApp}
            disabled={!deliveryRule.canDeliver}
          />
        </View>
      </ScrollView>
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
    <View style={[styles.row, isRTL && styles.actionsRtl]}>
      <Text style={[styles.rowLabel, strong && styles.rowLabelStrong]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowValueStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 40,
    justifyContent: 'center',
    gap: 18,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 18,
  },
  list: {
    gap: 12,
  },
  summaryCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  rowValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  rowLabelStrong: {
    color: theme.colors.ink,
    fontWeight: '800',
  },
  rowValueStrong: {
    color: theme.colors.accent,
    fontSize: 16,
  },
  note: {
    color: theme.colors.accentSoft,
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionsRtl: {
    flexDirection: 'row-reverse',
  },
  alignRight: {
    textAlign: 'right',
  },
});
