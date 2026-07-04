import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChevronLeft } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { api, USE_MOCK_API } from '../../api/client';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'OtpVerify'>;
type RouteProps = RouteProp<RootStackParamList, 'OtpVerify'>;

export const OtpVerifyScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { preferredLanguage, login } = useAuthStore();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);

  const otpInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);

  const isMr = preferredLanguage === 'mr';
  const otpLength = 6;


  const strings = {
    phoneTitle: isMr ? 'मोबाईल नंबर प्रविष्ट करा' : 'Enter your mobile number',
    phoneSub: isMr ? 'पडताळणी करण्यासाठी आम्ही SMS द्वारे एक कोड पाठवू.' : 'We’ll send a code by SMS to verify it’s you.',
    phonePlaceholder: '9876 543 210',
    smsRates: isMr ? 'प्रमाणित SMS दर लागू होऊ शकतात.' : 'Standard SMS rates may apply.',
    otpTitle: isMr ? 'नंबर पडताळणी' : 'Verify your number',
    otpSub: isMr
      ? `पाठवलेला ${otpLength}-अंकी कोड प्रविष्ट करा `
      : `Enter the ${otpLength}-digit code sent to `,
    btnSend: isMr ? 'पुढे जा' : 'Continue',
    btnVerify: isMr ? 'Verify' : 'Verify',
    invalidPhone: isMr ? 'कृपया वैध १०-अंकी नंबर प्रविष्ट करा.' : 'Please enter a valid 10-digit number.',
    invalidOtp: isMr
      ? `कृपया वैध ${otpLength}-अंकी ओटीपी प्रविष्ट करा.`
      : `Please enter a valid ${otpLength}-digit OTP.`,
    apiError: isMr ? 'त्रुटी आली. पुन्हा प्रयत्न करा.' : 'Something went wrong. Please try again.',
    resendPrefix: isMr ? 'कोड पुन्हा पाठवा ' : 'Resend code in ',
    resendAction: isMr ? 'कोड पुन्हा पाठवा' : 'Resend code',
  };

  const getMaskedPhone = (phone: string) => {
    if (phone.length < 10) return `+91 ${phone}`;
    const start = phone.slice(0, 2);
    const end = phone.slice(7);
    return `+91 ${start}••• ••${end}`;
  };

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);
  const handleSendOtp = async (phoneOverride?: any) => {
    const rawPhone = (typeof phoneOverride === 'string') ? phoneOverride : phoneNumber;
    console.log('[OtpVerifyScreen] handleSendOtp called. phoneNumber:', rawPhone);
    let checkPhone = rawPhone;
    if (checkPhone.length === 9) {
      checkPhone = checkPhone + '0';
    }
    if (checkPhone.length !== 10 || isNaN(Number(checkPhone))) {
      setError(strings.invalidPhone);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const formattedPhone = `+91${checkPhone}`;
      const res = await api.requestOtp(formattedPhone);
      if (res.success) {
        setSessionId(res.sessionId);
        setStep('otp');
        setTimer(30);
      } else {
        setError(strings.apiError);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || strings.apiError);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeOverride?: any) => {
    const activeCode = (typeof codeOverride === 'string') ? codeOverride : otpCode;
    console.log('[OtpVerifyScreen] handleVerifyOtp called. activeCode:', activeCode);
    if (activeCode.length !== otpLength || isNaN(Number(activeCode))) {
      console.log('[OtpVerifyScreen] otp validation failed. length:', activeCode.length);
      setError(strings.invalidOtp);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const formattedPhone = `+91${phoneNumber}`;
      const res = await api.verifyOtp(sessionId, activeCode, formattedPhone);
      if (res.success) {
        let userId = `user-${Date.now()}`;
        let role: 'resident' | 'vendor' = res.role as any;
        let name = isMr ? 'अनामिक रहिवासी' : 'Resident Guest';

        if (phoneNumber === '9999999999') {
          userId = 'user-patil-owner';
          role = 'vendor';
          name = isMr ? 'पाटील प्लंबर (व्यावसायिक)' : 'Patil Plumbing (Owner)';
        }

        await login({
          id: userId,
          name,
          phone: formattedPhone,
          role,
        }, res.isNewUser);

        navigation.replace('NameSelect');
      } else {
        setError(strings.apiError);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || strings.apiError);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setOtpCode('');
    setTimer(30);
    await handleSendOtp();
  };

  const activeDotIndex = step === 'phone' ? 1 : 2; // 2nd dot active for phone step, 3rd dot active for OTP step
  const dotCount = 6;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.viewport}>
          
          {/* Back chevron button */}
          <Pressable
            onPress={() => {
              if (step === 'otp') {
                setStep('phone');
                setOtpCode('');
                setError('');
              } else {
                navigation.goBack();
              }
            }}
            style={styles.backButton}
            hitSlop={15}
          >
            <View style={styles.backChevron} />
          </Pressable>

          {/* Title */}
          <Text style={styles.title}>
            {step === 'phone' ? strings.phoneTitle : strings.otpTitle}
          </Text>

          {step === 'phone' ? (
            /* PHONE INPUT SCREEN VIEW */
            <View style={styles.stepContainer}>
              {/* Subtitle */}
              <Text style={styles.subtitle}>{strings.phoneSub}</Text>

              {/* Phone Input Box Card Container */}
              <Pressable
                onPress={() => phoneInputRef.current?.focus()}
                style={styles.inputContainer}
              >
                <Text style={styles.countryCode}>+91</Text>
                <View style={styles.separator} />
                <TextInput
                  ref={phoneInputRef}
                  value={phoneNumber}
                  onChangeText={(val) => {
                    setError('');
                    const cleaned = val.replace(/[^0-9]/g, '').slice(0, 10);
                    setPhoneNumber(cleaned);
                    if (cleaned.length >= 9) {
                      setTimeout(() => {
                        handleSendOtp(cleaned);
                      }, 400);
                    }
                  }}
                  placeholder={strings.phonePlaceholder}
                  placeholderTextColor="#A89A82"
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.phoneInput}
                  autoFocus
                />
              </Pressable>

              {/* SMS Rates Note */}
              <Text style={styles.ratesNote}>{strings.smsRates}</Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          ) : (
            /* OTP VERIFICATION SCREEN VIEW */
            <View style={styles.stepContainer}>
              {/* Subtitle */}
              <Text style={styles.subtitle}>
                {strings.otpSub}{getMaskedPhone(phoneNumber)}
              </Text>

              {/* OTP Input Boxes */}
              <TextInput
                ref={otpInputRef}
                value={otpCode}
                onChangeText={(val) => {
                  setError('');
                  const cleaned = val.replace(/[^0-9]/g, '').slice(0, otpLength);
                  setOtpCode(cleaned);
                  if (cleaned.length === otpLength) {
                    setTimeout(() => {
                      handleVerifyOtp(cleaned);
                    }, 400);
                  }
                }}
                keyboardType="number-pad"
                maxLength={otpLength}
                style={styles.hiddenTextInput}
                autoFocus
              />

              <Pressable
                onPress={() => otpInputRef.current?.focus()}
                style={styles.otpRow}
              >
                {Array.from({ length: otpLength }).map((_, index) => {
                  const digit = otpCode[index] || '';
                  const isFocused = otpCode.length === index;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.otpBox,
                        { width: otpLength === 6 ? 48 : 79 },
                        isFocused && styles.otpBoxFocused,
                        digit !== '' && styles.otpBoxFilled,
                      ]}
                    >
                      <Text style={styles.otpDigit}>{digit}</Text>
                    </View>
                  );
                })}
              </Pressable>

              {/* Resend Timer / Action Link */}
              <View style={styles.resendWrapper}>
                {timer > 0 ? (
                  <Text style={styles.resendTimer}>
                    {strings.resendPrefix}0:{String(timer).padStart(2, '0')}
                  </Text>
                ) : (
                  <Pressable onPress={handleResend}>
                    <Text style={styles.resendLink}>{strings.resendAction}</Text>
                  </Pressable>
                )}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          )}

          {/* Continue / Submit Button */}
          <Pressable
            onPress={step === 'phone' ? handleSendOtp : handleVerifyOtp}
            disabled={loading}
            style={styles.submitButton}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {step === 'phone' ? strings.btnSend : strings.btnVerify}
              </Text>
            )}
          </Pressable>

          {/* 5-Dot Pagination Indicators */}
          <View style={styles.indicatorWrapper}>
            {Array.from({ length: dotCount }).map((_, idx) => {
              const isActive = activeDotIndex === idx;
              return (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    isActive ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              );
            })}
          </View>

        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6EC', // Warm cream page background
  },
  flex: {
    flex: 1,
  },
  viewport: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FBF6EC',
  },
  backButton: {
    position: 'absolute',
    left: 22,
    top: 66,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backChevron: {
    width: 8,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#2A2520',
    transform: [{ rotate: '45deg' }],
  },
  title: {
    position: 'absolute',
    left: 52,
    top: 54,
    height: 37,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 37,
    color: '#2A2520',
    right: 22,
  },
  stepContainer: {
    flex: 1,
    position: 'relative',
  },
  subtitle: {
    position: 'absolute',
    left: 22,
    right: 22,
    top: 259,
    fontFamily: 'Mukta-Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#6B5F4E',
  },
  inputContainer: {
    position: 'absolute',
    left: 22,
    width: 349,
    height: 54,
    top: 288,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0CFB0',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    position: 'absolute',
    left: 16,
    top: 8,
    height: 37,
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 37,
    color: '#2A2520',
  },
  separator: {
    position: 'absolute',
    left: 64,
    top: 12,
    width: 1,
    height: 28,
    backgroundColor: '#E0CFB0',
  },
  phoneInput: {
    position: 'absolute',
    left: 80,
    right: 16,
    top: 8,
    height: 37,
    fontFamily: 'Mukta-Regular',
    fontWeight: '400',
    fontSize: 22,
    lineHeight: 37,
    color: '#2A2520',
    letterSpacing: 2,
    padding: 0,
  },
  ratesNote: {
    position: 'absolute',
    left: 22,
    top: 348,
    height: 20,
    fontFamily: 'Mukta-Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 20,
    color: '#A89A82',
  },
  errorText: {
    position: 'absolute',
    left: 22,
    right: 22,
    top: 380,
    fontSize: 13,
    fontFamily: 'Mukta-Regular',
    color: '#C0392B',
  },
  submitButton: {
    position: 'absolute',
    left: 22,
    width: 349,
    height: 50,
    top: 724,
    backgroundColor: '#2A2520',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    elevation: 5,
  },
  submitButtonText: {
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 25,
    color: '#FFFFFF',
  },
  indicatorWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 792,
    height: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#E58A2B',
  },
  inactiveDot: {
    width: 7,
    backgroundColor: '#E0CFB0',
  },
  hiddenTextInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  otpRow: {
    position: 'absolute',
    left: 22,
    width: 349,
    height: 54,
    top: 288,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpBox: {
    width: 79,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0CFB0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFocused: {
    borderWidth: 2,
    borderColor: '#E58A2B',
  },
  otpBoxFilled: {
    borderColor: '#E0CFB0',
  },
  otpDigit: {
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 37,
    color: '#2A2520',
  },
  resendWrapper: {
    position: 'absolute',
    left: 22,
    top: 356,
    height: 22,
  },
  resendTimer: {
    fontFamily: 'Mukta-Regular',
    fontSize: 13,
    lineHeight: 22,
    color: '#8A7C66',
  },
  resendLink: {
    fontFamily: 'Mukta-SemiBold',
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 22,
    color: '#E58A2B',
  },
});

export default OtpVerifyScreen;
