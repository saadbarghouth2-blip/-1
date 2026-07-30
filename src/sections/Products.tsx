import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, Filter, ChevronDown } from 'lucide-react';
import { categories, isDiscountedProduct, isOfferProduct, products, type Product } from '../data/products';
import { formatSarPrice } from '../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Products() {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const isRTL = i18n.language === 'ar';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const catalogProducts = products.filter((product) => !isOfferProduct(product));
  const filteredProducts =
    selectedCategory === 'all'
      ? catalogProducts
      : catalogProducts.filter((p) => p.category === selectedCategory);

  const currentCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <section
      id="products"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-[#edf4fa] to-white"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 bg-[#153b66]/10 text-[#153b66] rounded-full text-sm font-medium mb-4"
          >
            {isRTL ? 'تشكيلتنا' : 'Our Collection'}
          </motion.span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t('products.title')}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('products.subtitle')}
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          {/* Mobile Filter Dropdown */}
          <div className="md:hidden relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-md text-gray-700"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {isRTL ? currentCategory?.nameAr : currentCategory?.nameEn}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg overflow-hidden z-20"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-right hover:bg-[#edf4fa] transition-colors ${
                        selectedCategory === cat.id ? 'bg-[#edf4fa] text-[#153b66]' : 'text-gray-700'
                      }`}
                    >
                      {isRTL ? cat.nameAr : cat.nameEn}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Filter Tabs */}
          <div className="hidden md:flex flex-wrap justify-center gap-3">
            {categories.map((cat, index) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * index }}
                onClick={() => setSelectedCategory(cat.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-[#153b66] to-[#2b648c] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-[#edf4fa] shadow-md'
                }`}
              >
                {isRTL ? cat.nameAr : cat.nameEn}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{ y: -10 }}
                className={`group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ${
                  index % 3 === 0 ? 'lg:translate-y-8' : index % 3 === 2 ? 'lg:-translate-y-8' : ''
                }`}
              >
                {/* Product Image */}
                <div className="relative h-56 bg-gradient-to-br from-[#edf4fa] to-[#f0f9ff] overflow-hidden">
                  <motion.img
                    src={product.image}
                    alt={isRTL ? product.name.ar : product.name.en}
                    className="w-full h-full object-contain p-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.4 }}
                  />
                  {/* Discount Badge */}
                  {isDiscountedProduct(product) && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                      {Math.round(
                        ((product.originalPrice - product.price) / product.originalPrice) * 100
                      )}%
                      {isRTL ? ' خصم' : ' OFF'}
                    </div>
                  )}
                  {/* Bubbles on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-[#2b648c]/30 rounded-full"
                        style={{
                          left: `${20 + i * 15}%`,
                          bottom: '10%',
                        }}
                        animate={{
                          y: [0, -100],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {isRTL ? product.name.ar : product.name.en}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {isRTL ? product.description.ar : product.description.en}
                  </p>

                  {/* Size & Quantity */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span className="px-2 py-1 bg-[#edf4fa] rounded-lg">
                      {product.size}
                    </span>
                    <span>×</span>
                    <span>
                      {product.quantity} {isRTL ? 'عبوة' : t('products.bottles')}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-[#153b66]">
                      {formatSarPrice(product.price, isRTL)}
                    </span>
                    {typeof product.originalPrice === 'number' && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatSarPrice(product.originalPrice, isRTL)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#153b66] to-[#2b648c] text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm">{t('products.addToCart')}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedProduct(product)}
                      className="p-3 border-2 border-[#153b66] text-[#153b66] rounded-xl hover:bg-[#edf4fa] transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">💧</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {isRTL ? 'لا توجد منتجات' : 'No products found'}
            </h3>
            <p className="text-gray-500">
              {isRTL ? 'جرب فئة أخرى' : 'Try another category'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {isRTL ? selectedProduct.name.ar : selectedProduct.name.en}
                </DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="bg-gradient-to-br from-[#edf4fa] to-[#f0f9ff] rounded-2xl p-6">
                  <img
                    src={selectedProduct.image}
                    alt={isRTL ? selectedProduct.name.ar : selectedProduct.name.en}
                    className="w-full h-64 object-contain"
                  />
                </div>
                <div>
                  <p className="text-gray-600 mb-4">
                    {isRTL ? selectedProduct.description.ar : selectedProduct.description.en}
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('products.size')}</span>
                      <span className="font-medium">{selectedProduct.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        {isRTL ? 'الكمية' : 'Quantity'}
                      </span>
                      <span className="font-medium">{selectedProduct.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">{isRTL ? 'السعر' : 'Price'}</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#153b66]">
                          {formatSarPrice(selectedProduct.price, isRTL)}
                        </span>
                        {typeof selectedProduct.originalPrice === 'number' && (
                          <span className="block text-sm text-gray-400 line-through">
                            {formatSarPrice(selectedProduct.originalPrice, isRTL)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#153b66] to-[#2b648c] text-white rounded-xl font-medium"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {t('products.addToCart')}
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
