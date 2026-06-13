import { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brands, getProductsByBrand, localizeText } from '@riq/shared';
import { useCart } from '../../src/features/cart/CartProvider';
import {
  getDiscountedProducts,
  getFeaturedProducts,
  getSpotlightBrands,
} from '../../src/features/catalog/selectors';
import { storefrontContent } from '../../src/content/storefront';
import { ActionButton } from '../../src/components/ActionButton';
import { BrandCard } from '../../src/components/BrandCard';
import { FaqAccordion } from '../../src/components/FaqAccordion';
import { LanguageToggle } from '../../src/components/LanguageToggle';
import { PageHeader } from '../../src/components/PageHeader';
import { ProductCard } from '../../src/components/ProductCard';
import { ScreenBackground } from '../../src/components/ScreenBackground';
import { theme } from '../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const showcaseRailRef = useRef<ScrollView>(null);
  const showcaseRailOffsetRef = useRef(0);
  const { t, i18n } = useTranslation();
  const { addToCart, totalItems } = useCart();
  const isRTL = i18n.language === 'ar';
  const featuredProducts = getFeaturedProducts();
  const spotlightBrands = getSpotlightBrands();
  const discountedProducts = getDiscountedProducts();
  const homeShowcaseProducts = [...discountedProducts, ...featuredProducts]
    .filter((product, index, collection) => (
      collection.findIndex((entry) => entry.id === product.id) === index
    ))
    .slice(0, 6);
  const teaserFaqs = storefrontContent.sharedFaqs.slice(0, 3).map((item) => ({
    id: item.id,
    question: localizeText(item.question, isRTL),
    answer: localizeText(item.answer, isRTL),
  }));
  const cartShortcutRoute = totalItems > 0 ? '/cart' : '/offers';
  const cartShortcutLabel = totalItems > 0
    ? (isRTL ? `راجع السلة (${totalItems})` : `Review cart (${totalItems})`)
    : t('tabs.offers');
  const showcaseCardWidth = Math.min(Math.max(width - 74, 244), 308);
  const showcaseSnapInterval = showcaseCardWidth + 12;
  const showcaseHint = isRTL
    ? 'اسحب لاكتشاف المزيد من المنتجات المميزة والمخفضة'
    : 'Swipe to explore more featured and discounted products';

  const scrollShowcaseRail = (direction: 'previous' | 'next') => {
    const nextOffset = Math.max(
      0,
      showcaseRailOffsetRef.current + (direction === 'next' ? showcaseSnapInterval : -showcaseSnapInterval)
    );

    showcaseRailOffsetRef.current = nextOffset;
    showcaseRailRef.current?.scrollTo({
      x: nextOffset,
      animated: true,
    });
  };

  const quickLinks = [
    {
      id: 'products',
      title: t('tabs.products'),
      body: isRTL
        ? 'ادخل مباشرة على الكتالوج الكامل لو العميل يريد مقارنة سريعة بين الأحجام والعلامات.'
        : 'Jump straight into the full catalog for a faster comparison across sizes and brands.',
      icon: 'grid-outline' as const,
      route: '/products',
    },
    {
      id: 'cart',
      title: totalItems > 0 ? (isRTL ? `السلة (${totalItems})` : `Cart (${totalItems})`) : t('tabs.cart'),
      body: isRTL
        ? 'راجع العناصر التي اختارها العميل وكمّل الطلب بدون الرجوع لخطوات كثيرة.'
        : 'Review the selected items and continue the order without extra hunting.',
      icon: 'cart-outline' as const,
      route: '/cart',
    },
    {
      id: 'offers',
      title: t('tabs.offers'),
      body: isRTL
        ? 'كل المنتجات المخفضة مجمعة في صفحة واحدة بدل حملات منفصلة أو عناصر قديمة.'
        : 'All discounted products now live together in one page instead of legacy campaign cards.',
      icon: 'pricetags-outline' as const,
      route: '/offers',
    },
    {
      id: 'contact',
      title: isRTL ? 'التواصل' : 'Contact',
      body: isRTL
        ? 'اختر أسرع قناة دعم حسب نوع سؤالك أو طلبك.'
        : 'Choose the fastest support channel based on your request.',
      icon: 'chatbubble-ellipses-outline' as const,
      route: '/contact',
    },
  ];

  return (
    <View style={styles.root}>
      <ScreenBackground />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 14) + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          overline={t('home.overline')}
          title={t('home.title')}
          subtitle={t('home.subtitle')}
          align={isRTL ? 'right' : 'left'}
          action={{
            label: isRTL ? 'حسابي' : 'Account',
            onPress: () => router.push('/account'),
            variant: 'secondary',
            testID: 'home-account-action',
          }}
        >
          <LanguageToggle />
        </PageHeader>

        <View style={[styles.heroCard, isRTL && styles.alignEnd]}>
          <Text style={[styles.heroStat, isRTL && styles.alignRight]}>
            {featuredProducts.length}+
          </Text>
          <Text style={[styles.heroLabel, isRTL && styles.alignRight]}>
            {t('home.statsProducts')}
          </Text>
          <Text style={[styles.heroSubLabel, isRTL && styles.alignRight]}>
            {brands.length}+ {t('home.statsBrands')} • {discountedProducts.length}{' '}
            {isRTL ? 'عناصر بعروض' : 'discounted picks'} • {totalItems}{' '}
            {isRTL ? 'في السلة' : 'in cart'}
          </Text>
          <View style={[styles.heroActions, isRTL && styles.heroActionsRtl]}>
            <ActionButton
              label={t('tabs.products')}
              onPress={() => router.push('/products')}
            />
            <ActionButton
              label={cartShortcutLabel}
              variant="secondary"
              onPress={() => router.push(cartShortcutRoute as never)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.showcaseShell}>
          <PageHeader
              title={isRTL ? 'منتجات مميزة من الكتالوج' : 'Featured catalog picks'}
              subtitle={
                isRTL
                  ? 'أحجام واضحة، عدد العبوات ظاهر، وأسعار فعلية من نفس كتالوج الإكسل المشترك.'
                  : 'Clearer sizes, visible pack counts, and live pricing from the shared spreadsheet-backed catalog.'
              }
              align={isRTL ? 'right' : 'left'}
            >
              <View style={styles.showcaseHeaderActions}>
                <Pressable
                  testID="home-showcase-more"
                  onPress={() => router.push('/offers')}
                  style={styles.showcaseMoreLink}
                >
                  <Text style={styles.showcaseMoreText}>
                    {isRTL ? 'المزيد' : 'More'}
                  </Text>
                </Pressable>
                <View style={[styles.showcaseNav, isRTL && styles.showcaseNavRtl]}>
                  <Pressable
                    testID="home-showcase-prev"
                    onPress={() => scrollShowcaseRail('previous')}
                    style={styles.showcaseNavButton}
                  >
                    <Ionicons
                      name={isRTL ? 'chevron-forward' : 'chevron-back'}
                      size={18}
                      color={theme.colors.accent}
                    />
                  </Pressable>
                  <Pressable
                    testID="home-showcase-next"
                    onPress={() => scrollShowcaseRail('next')}
                    style={styles.showcaseNavButton}
                  >
                    <Ionicons
                      name={isRTL ? 'chevron-back' : 'chevron-forward'}
                      size={18}
                      color={theme.colors.accent}
                    />
                  </Pressable>
                </View>
              </View>
            </PageHeader>
            <Text style={[styles.showcaseHint, isRTL && styles.alignRight]}>
              {showcaseHint}
            </Text>
            <ScrollView
              ref={showcaseRailRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.horizontalList, styles.showcaseRailContent]}
              decelerationRate="fast"
              snapToAlignment="start"
              snapToInterval={showcaseSnapInterval}
              onMomentumScrollEnd={(event) => {
                showcaseRailOffsetRef.current = event.nativeEvent.contentOffset.x;
              }}
            >
              {homeShowcaseProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isRTL={isRTL}
                  compact
                  compactWidth={showcaseCardWidth}
                  showcase
                  entranceDelayMs={index * 90}
                  onPress={() => router.push(`/product/${product.id}`)}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </ScrollView>
            <View style={[styles.showcaseFooterActions, isRTL && styles.heroActionsRtl]}>
              <ActionButton
                label={t('tabs.products')}
                onPress={() => router.push('/products')}
                style={styles.showcaseFooterButton}
              />
              <ActionButton
                label={cartShortcutLabel}
                variant="secondary"
                onPress={() => router.push(cartShortcutRoute as never)}
                style={styles.showcaseFooterButton}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <PageHeader
            title={isRTL ? 'أساس التجربة' : 'What this app now covers'}
            subtitle={
              isRTL
                ? 'محتوى أقوى من الموقع بصياغة أخف للموبايل مع الحفاظ على مسار الطلب الحالي.'
                : 'Richer website coverage in a simpler phone-native form while keeping the current order flow.'
            }
            align={isRTL ? 'right' : 'left'}
          />
          <View style={styles.infoGrid}>
            {storefrontContent.home.trustBadges.map((item) => (
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
            title={isRTL ? 'تنقل سريع' : 'Quick links'}
            subtitle={
              isRTL
                ? 'روابط واضحة للصفحات الثانوية المهمة داخل التطبيق.'
                : 'Clear shortcuts into the secondary pages that complete the mobile journey.'
            }
            align={isRTL ? 'right' : 'left'}
          />
          <View style={styles.quickLinksWrap}>
            {quickLinks.map((link) => (
              <Pressable
                key={link.id}
                testID={`home-link-${link.id}`}
                onPress={() => router.push(link.route as never)}
                style={styles.quickLinkCard}
              >
                <View style={styles.quickLinkIcon}>
                  <Ionicons
                    name={link.icon}
                    size={20}
                    color={theme.colors.accent}
                  />
                </View>
                <Text style={[styles.quickLinkTitle, isRTL && styles.alignRight]}>
                  {link.title}
                </Text>
                <Text style={[styles.quickLinkBody, isRTL && styles.alignRight]}>
                  {link.body}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <PageHeader
            title={isRTL ? 'كيف تطلب من التطبيق' : 'How to order in the app'}
            subtitle={
              isRTL
                ? '\u062b\u0644\u0627\u062b \u062e\u0637\u0648\u0627\u062a \u0642\u0635\u064a\u0631\u0629 \u0645\u0646 \u0627\u0644\u062a\u0635\u0641\u062d \u062d\u062a\u0649 \u0627\u0644\u062a\u062d\u0648\u064a\u0644.'
                : 'A short three-step path from browsing to bank transfer.'
            }
            align={isRTL ? 'right' : 'left'}
          />
          <View style={styles.stepsWrap}>
            {storefrontContent.home.howToOrder.map((item, index) => (
              <View key={item.id} style={styles.stepCard}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepTitle, isRTL && styles.alignRight]}>
                  {localizeText(item.title, isRTL)}
                </Text>
                <Text style={[styles.stepBody, isRTL && styles.alignRight]}>
                  {localizeText(item.body, isRTL)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <PageHeader
            title={t('home.brands')}
            subtitle={
              isRTL
                ? 'علامات أقوى داخل الكتالوج مع انتقال مباشر إلى منتجات كل علامة.'
                : 'Brands with stronger presence across the catalog and direct entry into their products.'
            }
            align={isRTL ? 'right' : 'left'}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {spotlightBrands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                productCount={getProductsByBrand(brand.name).length}
                isRTL={isRTL}
                onPress={() => router.push(`/brand/${brand.id}`)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <PageHeader
            title={isRTL ? 'استخدامات يغطيها التطبيق' : 'Use cases this app now covers'}
            subtitle={
              isRTL
                ? 'تنظيم أوضح للمنازل والمكاتب والضيافة بدل الاكتفاء بعرض المنتجات فقط.'
                : 'A clearer structure for homes, offices, and hospitality instead of listing products alone.'
            }
            align={isRTL ? 'right' : 'left'}
          />
          <View style={styles.infoGrid}>
            {storefrontContent.home.deliveryCoverage.map((item) => (
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
            title={isRTL ? 'ملاحظات من الاستخدام' : 'What the mobile flow improves'}
            subtitle={
              isRTL
                ? 'أبرز الانطباعات التي يعالجها هذا التوسيع داخل التطبيق.'
                : 'A quick read on the main experience improvements inside the app.'
            }
            align={isRTL ? 'right' : 'left'}
          />
          <View style={styles.testimonialStack}>
            {storefrontContent.home.testimonials.map((item) => (
              <View key={item.id} style={styles.testimonialCard}>
                <Text style={[styles.testimonialTitle, isRTL && styles.alignRight]}>
                  {localizeText(item.title, isRTL)}
                </Text>
                <Text style={[styles.testimonialBody, isRTL && styles.alignRight]}>
                  {localizeText(item.body, isRTL)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <PageHeader
            title={isRTL ? 'أسئلة سريعة' : 'Quick FAQ'}
            subtitle={
              isRTL
                ? 'أكثر الأسئلة التي تساعدك قبل متابعة الطلب أو التواصل.'
                : 'A few answers that reduce hesitation before checkout or support.'
            }
            align={isRTL ? 'right' : 'left'}
          />
          <FaqAccordion
            items={teaserFaqs}
            isRTL={isRTL}
            initialOpenId={teaserFaqs[0]?.id}
            testIDPrefix="home-faq"
          />
          <View style={[styles.heroActions, isRTL && styles.heroActionsRtl]}>
            <ActionButton
              label={t('common.contact')}
              variant="secondary"
              onPress={() => router.push('/contact')}
            />
            <ActionButton
              label={t('common.about')}
              onPress={() => router.push('/about')}
            />
          </View>
        </View>

        <View style={styles.bottomCta}>
          <Text style={[styles.bottomTitle, isRTL && styles.alignRight]}>
            {isRTL
              ? 'كل المسارات الأساسية موجودة داخل التطبيق الآن'
              : 'The key storefront paths now live inside the app'}
          </Text>
          <Text style={[styles.bottomBody, isRTL && styles.alignRight]}>
            {isRTL
              ? '\u062a\u0635\u0641\u062d \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a\u060c \u0631\u0627\u062c\u0639 \u0627\u0644\u0639\u0631\u0648\u0636\u060c \u0627\u0642\u0631\u0623 \u0639\u0646 \u0627\u0644\u0645\u062a\u062c\u0631\u060c \u062a\u0648\u0627\u0635\u0644 \u0628\u0633\u0631\u0639\u0629\u060c \u0648\u0623\u0643\u0645\u0644 \u0627\u0644\u0637\u0644\u0628 \u0628\u062a\u062d\u0648\u064a\u0644 \u0628\u0646\u0643\u064a \u064a\u062f\u0648\u064a.'
              : 'Browse products, review offers, learn about the store, reach support quickly, and finish the order with manual bank transfer.'}
          </Text>
          <View style={[styles.heroActions, isRTL && styles.heroActionsRtl]}>
            <ActionButton
              label={t('common.checkout')}
              onPress={() => router.push('/checkout')}
            />
            <ActionButton
              label={t('tabs.offers')}
              variant="secondary"
              onPress={() => router.push('/offers')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 120,
    gap: 24,
  },
  heroCard: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.card,
    padding: 22,
  },
  heroStat: {
    color: theme.colors.white,
    fontSize: 40,
    fontWeight: '900',
  },
  heroLabel: {
    color: '#dfefff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  heroSubLabel: {
    color: '#b6d3ea',
    fontSize: 13,
    lineHeight: 22,
    marginTop: 10,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  heroActionsRtl: {
    flexDirection: 'row-reverse',
  },
  section: {
    gap: 14,
  },
  horizontalList: {
    gap: 12,
  },
  showcaseShell: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: 14,
  },
  showcaseHeaderActions: {
    alignItems: 'flex-end',
    gap: 10,
  },
  showcaseMoreLink: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  showcaseMoreText: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '800',
  },
  showcaseNav: {
    flexDirection: 'row',
    gap: 8,
  },
  showcaseNavRtl: {
    flexDirection: 'row-reverse',
  },
  showcaseNavButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  showcaseHint: {
    color: theme.colors.accentSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    marginTop: -2,
  },
  showcaseRailContent: {
    paddingRight: 4,
  },
  showcaseFooterActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  showcaseFooterButton: {
    flexGrow: 1,
    minWidth: 132,
  },
  infoGrid: {
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
  quickLinksWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickLinkCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: 8,
  },
  quickLinkIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinkTitle: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  quickLinkBody: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  stepsWrap: {
    gap: 12,
  },
  stepCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: 10,
  },
  stepBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.sandStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: theme.colors.accent,
    fontSize: 15,
    fontWeight: '800',
  },
  stepTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  stepBody: {
    color: theme.colors.muted,
    lineHeight: 22,
  },
  testimonialStack: {
    gap: 12,
  },
  testimonialCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: 8,
  },
  testimonialTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  testimonialBody: {
    color: theme.colors.muted,
    lineHeight: 22,
  },
  bottomCta: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: 10,
  },
  bottomTitle: {
    color: theme.colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  bottomBody: {
    color: theme.colors.muted,
    lineHeight: 22,
  },
  alignRight: {
    textAlign: 'right',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
});
