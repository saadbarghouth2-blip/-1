import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Trash2, Plus, Minus, ShoppingBag, 
  Truck, Shield, Clock, ChevronRight, Gift,
  Check, Sparkles, BarChart3, ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductImage from '../components/ProductImage';
import { formatSarPrice } from '../lib/utils';
import { FREE_DELIVERY_CARTONS, MIN_DELIVERY_CARTONS, getDeliveryPolicySummary, getDeliveryRuleState } from '../lib/deliveryRules';

export default function Cart() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const isRTL = i18n.language === 'ar';

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  const deliveryRule = getDeliveryRuleState(totalItems);
  const deliveryFee = deliveryRule.deliveryFee;
  const discount = promoApplied ? totalPrice * 0.1 : 0;
  const finalTotal = totalPrice + deliveryFee - discount;
  const freeDeliveryProgress = Math.min((totalItems / FREE_DELIVERY_CARTONS) * 100, 100);
  const distinctBrands = new Set(items.map((item) => item.product.brand)).size;
  const deliveryPolicy = getDeliveryPolicySummary(isRTL);
  const cartInsights = [
    {
      icon: ShoppingBag,
      label: isRTL ? 'عدد القطع' : 'Items in cart',
      value: `${totalItems}`,
      tone: 'from-sky-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      label: isRTL ? 'تنوع العلامات' : 'Brand variety',
      value: `${distinctBrands}`,
      tone: 'from-emerald-500 to-teal-500',
    },
    {
      icon: ShieldCheck,
      label: isRTL ? 'جاهزية الطلب' : 'Order readiness',
      value: deliveryRule.canDeliver ? (isRTL ? 'جاهز' : 'Ready') : (isRTL ? 'ناقص' : 'Short'),
      tone: 'from-indigo-500 to-blue-600',
    },
  ];
  const checkoutJourney = [
    {
      title: isRTL ? 'مراجعة الطلب' : 'Review order',
      desc: isRTL ? 'تأكيد الكميات والمنتجات المختارة قبل الإرسال.' : 'Confirm quantities and selected products before submission.',
    },
    {
      title: isRTL ? 'تأكيد وتجهيز' : 'Confirm and prepare',
      desc: isRTL ? 'يتم تجهيز طلبك بسرعة مع مراجعة الجودة.' : 'Your order is quickly prepared with a quality check.',
    },
    {
      title: isRTL ? 'توصيل سريع' : 'Fast delivery',
      desc: isRTL ? 'التوصيل يتم خلال النافذة الزمنية المناسبة لمنطقتك.' : 'Delivery arrives within the ideal time window for your area.',
    },
  ];

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'reek10') {
      setPromoApplied(true);
    }
  };


  if (items.length === 0) {
    return (
      <main className="min-h-screen relative z-10 py-16 sm:py-20">
        <div className="w-full px-3 sm:px-4 lg:px-8 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 sm:py-20"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 sm:w-32 sm:h-32 bg-[#edf4fa] rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <ShoppingBag className="w-10 h-10 sm:w-16 sm:h-16 text-[#153b66]" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
              {isRTL ? 'السلة فارغة في الوقت الحالي' : 'Your cart is empty right now'}
            </h1>
            <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base px-4">
              {isRTL 
                ? 'ابدأ بتصفح خيارات المياه المتنوعة واختر ما يناسب احتياجاتك'
                : 'Start browsing our range of water options and choose what fits your needs'}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#153b66] to-[#2b648c] text-white rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              <span>{isRTL ? 'تصفح المنتجات' : 'Browse Products'}</span>
              <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main ref={sectionRef} className="min-h-screen relative z-10 py-16 sm:py-20">
      <div className="w-full px-3 sm:px-4 lg:px-8 xl:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            {isRTL ? 'سلة التسوق' : 'Shopping Cart'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {isRTL 
              ? `لديك ${totalItems} ${totalItems === 1 ? 'منتج' : 'منتجات'} في سلتك`
              : `You have ${totalItems} ${totalItems === 1 ? 'item' : 'items'} in your cart`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.12 }}
          className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#153b66] via-[#255d8d] to-[#356f98] p-6 text-white shadow-[0_26px_70px_-32px_rgba(21,59,102,0.52)] sm:p-8">
            <div className="absolute -left-12 top-0 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                <span>{isRTL ? 'راجع طلبك قبل الدفع' : 'Review your order before payment'}</span>
              </div>
              <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
                {isRTL ? 'اعرف حالة طلبك بوضوح قبل إتمام الدفع' : 'Understand your order status clearly before checkout'}
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                {isRTL
                  ? 'هنا تقدر تراجع المنتجات والكميات، تعرف هل طلبك جاهز للتوصيل، وتشوف كم كرتونة متبقية للحصول على التوصيل المجاني.'
                  : 'Here you can review products and quantities, see whether your order is ready for delivery, and check how many cartons remain to unlock free delivery.'}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {cartInsights.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 14 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.18 + index * 0.06 }}
                    className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <div className={`mb-3 inline-flex rounded-2xl bg-gradient-to-r p-1.5 sm:p-2 ${item.tone}`}>
                      <item.icon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                    </div>
                    <div className="text-2xl font-bold">{item.value}</div>
                    <div className="text-sm text-white/80">{item.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.7rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-white/90">
                    {isRTL ? 'التقدم نحو التوصيل المجاني' : 'Progress to free delivery'}
                  </span>
                  <span className="font-bold text-white">
                    {deliveryRule.hasFreeDelivery
                      ? isRTL ? 'تم الوصول' : 'Unlocked'
                      : isRTL ? `${deliveryRule.cartonsToFreeDelivery} كرتونة متبقية` : `${deliveryRule.cartonsToFreeDelivery} cartons left`}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${freeDeliveryProgress}%` } : {}}
                    transition={{ duration: 0.8, delay: 0.25 }}
                    className="h-full rounded-full bg-gradient-to-r from-white via-sky-100 to-cyan-100"
                  />
                </div>
                <p className="mt-3 text-xs leading-6 text-white/80 sm:text-sm">
                  {deliveryRule.hasFreeDelivery
                    ? (isRTL ? 'طلبك مؤهل الآن لتوصيل مجاني، ويمكنك إتمام الشراء مباشرة.' : 'Your cart already qualifies for free delivery, so you can check out immediately.')
                    : (isRTL ? `أضف حتى ${FREE_DELIVERY_CARTONS} كرتونة للحصول على توصيل مجاني.` : `Add up to ${FREE_DELIVERY_CARTONS} cartons to unlock free delivery.`)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-sky-100 bg-white p-5 shadow-[0_22px_60px_-34px_rgba(15,23,42,0.28)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#153b66]">{isRTL ? 'بعد إرسال الطلب' : 'After placing the order'}</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {isRTL ? 'ماذا يحدث بعد تأكيد طلبك؟' : 'What happens after you confirm your order?'}
                </h3>
              </div>
              <Clock className="h-4 w-4 text-[#153b66] sm:h-5 sm:w-5" />
            </div>
            <div className="space-y-3">
              {checkoutJourney.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + index * 0.06 }}
                  className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-4"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl bg-[#edf4fa] font-bold text-[#153b66] sm:h-10 sm:w-10">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{step.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-gray-500">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-5 rounded-[1.6rem] bg-gradient-to-r from-slate-50 to-sky-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-[#153b66]">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-semibold">{isRTL ? 'معلومات مهمة قبل الطلب' : 'Important information before ordering'}</span>
              </div>
              <p className="text-sm leading-7 text-gray-600">
                {isRTL
                  ? 'قبل المتابعة، تأكد من الكميات ورسوم التوصيل وسياسة الأدوار. عند إرسال الطلب سنتواصل معك لتأكيد التفاصيل وموعد التوصيل المناسب.'
                  : 'Before continuing, review quantities, delivery fees, and floor policy. After you place the order, we will contact you to confirm the details and delivery slot.'}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart Items */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-3 sm:space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 100 : -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md flex gap-3 sm:gap-4"
                >
                  <Link to={`/product/${item.product.id}`} className="w-20 sm:w-24 flex-shrink-0">
                    <ProductImage
                      product={item.product}
                      isRTL={isRTL}
                      size="thumb"
                      className="w-full"
                    />
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="font-bold text-gray-800 hover:text-[#153b66] transition-colors text-sm sm:text-base line-clamp-1">
                        {isRTL ? item.product.name.ar : item.product.name.en}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                      {item.product.size} x {item.product.quantity}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[#153b66] font-bold text-sm sm:text-base">
                        {formatSarPrice(item.product.price, isRTL)}
                      </span>
                      {item.product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatSarPrice(item.product.originalPrice, isRTL)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                    
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </motion.button>
                      <span className="px-2 sm:px-4 py-1 sm:py-2 font-bold text-sm">{item.quantity}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={clearCart}
              className="text-red-500 hover:text-red-600 font-medium flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              {isRTL ? 'إفراغ السلة' : 'Clear Cart'}
            </motion.button>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg sticky top-20">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
                {isRTL ? 'ملخص الطلب' : 'Order Summary'}
              </h2>

              {/* Promo Code */}
              <div className="mb-4 sm:mb-6">
                {!showPromoInput ? (
                  <button
                    onClick={() => setShowPromoInput(true)}
                    className="flex items-center gap-2 text-[#153b66] text-sm hover:underline"
                  >
                    <Gift className="w-4 h-4" />
                    {isRTL ? 'لديك كود خصم؟' : 'Have a promo code?'}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder={isRTL ? 'أدخل الكود' : 'Enter code'}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#153b66] focus:ring-2 focus:ring-[#153b66]/20 outline-none"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={applyPromoCode}
                      className="px-3 py-2 bg-[#153b66] text-white rounded-lg text-sm font-medium"
                    >
                      {isRTL ? 'تطبيق' : 'Apply'}
                    </motion.button>
                  </div>
                )}
                {promoApplied && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-green-600 text-sm mt-2"
                  >
                    <Check className="w-4 h-4" />
                    {isRTL ? 'تم تطبيق خصم 10%' : '10% discount applied'}
                  </motion.div>
                )}
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span>{formatSarPrice(totalPrice, isRTL)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>{isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                  <span className={deliveryFee === 0 ? 'text-green-500' : ''}>
                    {deliveryFee === 0 ? isRTL ? 'مجاني' : 'Free' : formatSarPrice(deliveryFee, isRTL)}
                  </span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600 text-sm sm:text-base">
                    <span>{isRTL ? 'الخصم' : 'Discount'}</span>
                    <span>-{formatSarPrice(discount, isRTL)}</span>
                  </div>
                )}
                {deliveryFee === 0 && (
                  <div className="text-xs sm:text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                    {isRTL ? '✓ لقد حصلت على توصيل مجاني!' : '✓ You got free delivery!'}
                  </div>
                )}
                {!deliveryRule.canDeliver && (
                  <div className="text-xs sm:text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
                    {isRTL
                      ? `الحد الأدنى للتوصيل ${MIN_DELIVERY_CARTONS} كراتين. أضف ${deliveryRule.cartonsToMinimum} كرتونة لإتمام الطلب.`
                      : `Minimum delivery order is ${MIN_DELIVERY_CARTONS} cartons. Add ${deliveryRule.cartonsToMinimum} more to check out.`}
                  </div>
                )}
                {deliveryRule.canDeliver && !deliveryRule.hasFreeDelivery && (
                  <div className="text-xs sm:text-sm text-[#153b66] bg-[#edf4fa] p-2 rounded-lg">
                    {isRTL
                      ? `رسوم التوصيل ${formatSarPrice(deliveryFee, isRTL)}. التوصيل مجاني من ${FREE_DELIVERY_CARTONS} كرتونة.`
                      : `Delivery fee is ${formatSarPrice(deliveryFee, isRTL)}. Free delivery starts at ${FREE_DELIVERY_CARTONS} cartons.`}
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-800">
                    <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                    <span className="text-[#153b66]">{formatSarPrice(finalTotal, isRTL)}</span>
                  </div>
                </div>
              </div>


              <motion.button
                onClick={() => navigate('/checkout')}
                disabled={!deliveryRule.canDeliver}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#153b66] to-[#2b648c] text-white rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-[#153b66]/20 hover:shadow-[#153b66]/40 transition-all mb-3 sm:mb-4 flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deliveryRule.canDeliver
                  ? (isRTL ? 'إتمام الدفع الإلكتروني' : 'Digital Checkout')
                  : (isRTL ? `أكمل ${MIN_DELIVERY_CARTONS} كراتين للتوصيل` : `Add ${MIN_DELIVERY_CARTONS} cartons to deliver`)}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </motion.button>

              {deliveryRule.canDeliver ? (
                <button
                  type="button"
                  onClick={() => navigate('/checkout?channel=whatsapp')}
                  className="mb-3 flex w-full items-center justify-center rounded-xl border-2 border-green-200 bg-green-50 py-3 font-semibold text-green-700 transition-colors hover:bg-green-100 sm:py-4"
                >
                  {isRTL ? 'إرسال الطلب عبر واتساب' : 'Send order via WhatsApp'}
                </button>
              ) : (
                <div className="mb-3 flex w-full items-center justify-center rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-3 text-center text-sm font-semibold text-amber-700 sm:py-4">
                  {isRTL
                    ? `إرسال الطلب متاح عند الوصول إلى ${MIN_DELIVERY_CARTONS} كراتين.`
                    : `Order submission is available from ${MIN_DELIVERY_CARTONS} cartons.`}
                </div>
              )}

              <Link
                to="/products"
                className="w-full py-2.5 sm:py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-[#153b66] hover:text-[#153b66] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span>{isRTL ? 'مواصلة التسوق' : 'Continue Shopping'}</span>
                <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>

              {/* Benefits */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                  <Truck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#153b66]" />
                  <span>{isRTL ? 'توصيل سريع لجميع المناطق' : 'Fast delivery to all areas'}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                  <Shield className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#153b66]" />
                  <span>{isRTL ? 'جودة مضمونة 100%' : '100% guaranteed quality'}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                  <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#153b66]" />
                  <span>{isRTL ? 'دعم على مدار الساعة' : '24/7 support'}</span>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 rounded-2xl border border-[#153b66]/10 bg-[#edf4fa]/70 p-4">
                <h3 className="mb-3 text-sm font-black text-[#153b66]">
                  {isRTL ? 'سياسة الطلب والتوصيل' : 'Order and delivery policy'}
                </h3>
                <div className="space-y-2">
                  {deliveryPolicy.slice(0, 5).map((item) => (
                    <div key={item} className="flex gap-2 text-xs leading-6 text-gray-600 sm:text-sm">
                      <Check className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-[#153b66]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                  {isRTL ? 'طرق الدفع المتاحة:' : 'Available payment methods:'}
                </p>
                <div className="flex gap-2 sm:gap-3">
                  <div className="w-10 h-6 sm:w-12 sm:h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">Visa</div>
                  <div className="w-10 h-6 sm:w-12 sm:h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">MC</div>
                  <div className="w-10 h-6 sm:w-12 sm:h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">Mada</div>
                  <div className="w-10 h-6 sm:w-12 sm:h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">COD</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
