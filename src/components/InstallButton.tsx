import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  clearDeferredInstallPrompt,
  getAndroidAppUrl,
  getIosAppUrl,
  isStandaloneDisplayMode,
  subscribeToDeferredInstallPrompt,
  supportsIosManualInstall,
  type BeforeInstallPromptEvent,
} from '../lib/pwa';

export function InstallButton() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIosManualGuide, setShowIosManualGuide] = useState(false);

  useEffect(() => {
    setIsStandalone(isStandaloneDisplayMode());
    const unsubscribe = subscribeToDeferredInstallPrompt((prompt) => {
      setDeferredPrompt(prompt);
      if (prompt && !isStandalone) {
        setShowAndroidPrompt(true);
      }
    });

    return unsubscribe;
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        clearDeferredInstallPrompt();
        setShowAndroidPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleCloseAndroidPrompt = () => {
    setShowAndroidPrompt(false);
  };

  const handleOpenIosGuide = () => {
    setShowIosManualGuide(true);
  };

  const handleCloseIosGuide = () => {
    setShowIosManualGuide(false);
  };

  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Android Auto Install Prompt */}
      <AnimatePresence>
        {showAndroidPrompt && deferredPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'ثبّت التطبيق' : 'Install App'}
                </h3>
                <button
                  onClick={handleCloseAndroidPrompt}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className={`text-gray-600 text-sm mb-6 ${isRTL ? 'text-right' : ''}`}>
                {isRTL
                  ? 'ثبّت متجر ريق على شاشتك الرئيسية للوصول السريع والسهل.'
                  : 'Install Riq Store on your home screen for quick and easy access.'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseAndroidPrompt}
                  className={`flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium ${
                    isRTL ? 'text-right' : ''
                  }`}
                >
                  {isRTL ? 'لاحقًا' : 'Later'}
                </button>
                <button
                  onClick={handleInstallClick}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  {isRTL ? 'ثبّت الآن' : 'Install Now'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button for iOS and Manual Installation */}
      {(supportsIosManualInstall() || getAndroidAppUrl() || getIosAppUrl()) && !showAndroidPrompt && (
        <motion.button
          onClick={supportsIosManualInstall() ? handleOpenIosGuide : handleInstallClick}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-40 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isRTL ? 'تحميل التطبيق' : 'Download App'}
        >
          <Download size={24} />
          <span className="hidden sm:inline text-sm font-semibold">
            {isRTL ? 'تحميل' : 'Download'}
          </span>
        </motion.button>
      )}

      {/* iOS Manual Installation Guide Modal */}
      <AnimatePresence>
        {showIosManualGuide && supportsIosManualInstall() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="sticky top-0 bg-white border-b flex items-center justify-between p-6">
                <h3 className={`text-lg font-semibold text-gray-900 ${isRTL ? 'text-right flex-1' : ''}`}>
                  {isRTL ? 'كيفية التثبيت' : 'How to Install'}
                </h3>
                <button
                  onClick={handleCloseIosGuide}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h4 className={`font-semibold text-blue-900 ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'على iPhone/iPad:' : 'On iPhone/iPad:'}
                  </h4>
                  <ol className={`space-y-2 text-sm text-blue-800 ${isRTL ? 'text-right' : ''}`}>
                    <li>1. {isRTL ? 'انقر على قائمة المشاركة (Share)' : 'Tap the Share button'}</li>
                    <li>2. {isRTL ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Select "Add to Home Screen"'}</li>
                    <li>3. {isRTL ? 'أكمل التثبيت' : 'Complete the setup'}</li>
                  </ol>
                </div>

                {getAndroidAppUrl() && (
                  <div className="border-t pt-4">
                    <h4 className={`font-semibold text-gray-900 mb-2 ${isRTL ? 'text-right' : ''}`}>
                      {isRTL ? 'تطبيق Android الأصلي:' : 'Native Android App:'}
                    </h4>
                    <a
                      href={getAndroidAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      {isRTL ? 'تحميل من Google Play' : 'Download on Google Play'}
                    </a>
                  </div>
                )}

                {getIosAppUrl() && (
                  <div className="border-t pt-4">
                    <h4 className={`font-semibold text-gray-900 mb-2 ${isRTL ? 'text-right' : ''}`}>
                      {isRTL ? 'تطبيق iOS الأصلي:' : 'Native iOS App:'}
                    </h4>
                    <a
                      href={getIosAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      {isRTL ? 'تحميل من App Store' : 'Download on App Store'}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
