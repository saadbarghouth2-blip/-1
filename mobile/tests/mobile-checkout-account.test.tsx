import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import CheckoutScreen from '../app/checkout/index';
import i18n, { i18nReady } from '../src/i18n';

const mockPush = jest.fn();
const mockSaveCheckoutDraft = jest.fn().mockResolvedValue({ reference: 'draft-1' });
const mockSaveProfile = jest.fn().mockResolvedValue({});
const mockUseAuth = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../src/features/cart/CartProvider', () => ({
  useCart: () => ({
    items: [
      {
        product: {
          id: 'nova-330-40',
          name: {
            ar: 'نوفا',
            en: 'Nova 330ml',
          },
          price: 12,
          image: '/nova.jpg',
          brandId: 'nova',
          brand: 'Nova',
          brandAr: 'نوفا',
          category: 'small',
          size: '330ml',
          quantity: 40,
        },
        quantity: 15,
      },
    ],
    subtotal: 180,
  }),
}));

jest.mock('../src/features/auth/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../src/services/location', () => ({
  getCurrentDeviceLocation: jest.fn(),
  reverseGeocode: jest.fn(),
}));

jest.mock('../src/services/paymentBridge', () => ({
  saveCheckoutDraft: (...args: unknown[]) => mockSaveCheckoutDraft(...args),
}));

describe('mobile checkout account flow', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    mockSaveCheckoutDraft.mockClear();
    mockSaveProfile.mockClear();
    await i18nReady;
    await i18n.changeLanguage('en');
  });

  it('lets the shopper continue as guest without requiring account sign-in', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isConfigured: true,
      isProfileLoading: false,
      isReady: true,
      profile: null,
      saveProfile: mockSaveProfile,
      session: null,
    });

    render(<CheckoutScreen />);

    expect(screen.getByTestId('checkout-auth-email-input')).toBeTruthy();

    fireEvent.press(screen.getByTestId('checkout-auth-guest-button'));

    expect(screen.queryByTestId('checkout-auth-email-input')).toBeNull();
    expect(screen.getByTestId('checkout-auth-reopen-button')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('checkout-name-input'), 'Guest User');
    fireEvent.changeText(screen.getByTestId('checkout-phone-input'), '0500000000');
    fireEvent.changeText(screen.getByTestId('checkout-address-input'), 'Riyadh');
    fireEvent.press(screen.getByTestId('checkout-continue-button'));

    await waitFor(() => {
      expect(mockSaveProfile).not.toHaveBeenCalled();
      expect(mockSaveCheckoutDraft).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/checkout/payment');
    });
  });

  it('prefills saved profile details and stores them again before payment', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isConfigured: true,
      isProfileLoading: false,
      isReady: true,
      profile: {
        id: 'user-1',
        email: 'maha@example.com',
        fullName: 'Maha',
        phone: '0500000000',
        defaultAddress: 'Riyadh',
        defaultLat: 24.7,
        defaultLng: 46.6,
        locale: 'en',
        createdAt: '2026-04-16T00:00:00.000Z',
        updatedAt: '2026-04-16T00:00:00.000Z',
      },
      saveProfile: mockSaveProfile,
      session: {
        userId: 'user-1',
        email: 'maha@example.com',
      },
    });

    render(<CheckoutScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('checkout-name-input').props.value).toBe('Maha');
      expect(screen.getByTestId('checkout-phone-input').props.value).toBe('0500000000');
      expect(screen.getByTestId('checkout-address-input').props.value).toBe('Riyadh');
      expect(screen.getByTestId('checkout-email-input').props.value).toBe('maha@example.com');
    });

    expect(screen.getByTestId('checkout-email-input').props.editable).toBe(false);

    act(() => {
      fireEvent.press(screen.getByTestId('checkout-continue-button'));
    });

    await waitFor(() => {
      expect(mockSaveProfile).toHaveBeenCalledWith({
        fullName: 'Maha',
        phone: '0500000000',
        defaultAddress: 'Riyadh',
        defaultLat: 24.7,
        defaultLng: 46.6,
        locale: 'en',
      });
      expect(mockSaveCheckoutDraft).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/checkout/payment');
    });
  });
});
