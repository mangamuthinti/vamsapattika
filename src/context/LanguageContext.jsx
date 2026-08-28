import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { translateDynamicText, transliterateName } from '../utils/dynamicTranslate';

const LanguageContext = createContext(null);

const dictionaries = {
  en: {},
  hi: {
    'Vamsapattika': 'वंशपट्टिका',
    'Preserve your family history': 'अपने परिवार के इतिहास को सुरक्षित रखें',
    'Login': 'लॉगिन', 'Sign Up': 'साइन अप', 'Full Name': 'पूरा नाम',
    'Email': 'ईमेल', 'Password': 'पासवर्ड', 'Enter your name': 'अपना नाम दर्ज करें',
    'Enter your email': 'अपना ईमेल दर्ज करें', 'Enter your password': 'अपना पासवर्ड दर्ज करें',
    'Please wait...': 'कृपया प्रतीक्षा करें...', 'Continue with Google': 'Google के साथ जारी रखें',
    'OR': 'या', 'Powered by': 'द्वारा संचालित', 'Provegaa Tech Hub': 'Provegaa Tech Hub',
    'Add Photo': 'फोटो जोड़ें', 'Change BG': 'पृष्ठभूमि बदलें', 'Refresh': 'रिफ्रेश',
    'Export': 'निर्यात', 'Share': 'साझा करें', 'Download as PNG': 'PNG के रूप में डाउनलोड करें',
    'Download as PDF': 'PDF के रूप में डाउनलोड करें', 'Print / Save as PDF': 'प्रिंट / PDF के रूप में सहेजें',
    'WhatsApp': 'व्हाट्सऐप', 'Facebook': 'फेसबुक', 'Instagram': 'इंस्टाग्राम',
    'Twitter': 'ट्विटर', 'Copy Link': 'लिंक कॉपी करें', 'Trees': 'ट्री', 'Pricing': 'कीमत',
    'Profile': 'प्रोफ़ाइल', 'Settings': 'सेटिंग्स', 'Logout': 'लॉगआउट',
    'Create New Tree': 'नया ट्री बनाएं', 'Create': 'बनाएं', 'Enter tree name': 'ट्री का नाम दर्ज करें',
    'No trees found. Create your first tree below!': 'कोई ट्री नहीं मिला। नीचे अपना पहला ट्री बनाएं!',
    'Updated:': 'अपडेट किया गया:', 'Rename': 'नाम बदलें', 'Delete': 'हटाएं',
    'Edit Info': 'जानकारी संपादित करें', 'Add Spouse': 'जीवनसाथी जोड़ें', 'Add Child': 'बच्चा जोड़ें',
    'Remove': 'हटाएं', 'Upgrade Required': 'अपग्रेड आवश्यक है',
    "You've reached the limit of": 'आप इस प्लान की सीमा तक पहुंच गए हैं',
    'Recommended': 'अनुशंसित', 'Free for everyone': 'सभी के लिए निःशुल्क',
    'One-time payment': 'एक बार का भुगतान', 'Up to': 'अधिकतम', 'family cards': 'परिवार कार्ड',
    'Add photos & customize': 'फोटो जोड़ें और अनुकूलित करें', 'Export as PNG/PDF': 'PNG/PDF के रूप में निर्यात करें',
    'Priority support': 'प्राथमिकता सहायता', 'Customize': 'अनुकूलित करें', 'Choose your own limit': 'अपनी सीमा चुनें',
    'Number of cards:': 'कार्ड की संख्या:', 'Enter number (min 21)': 'संख्या दर्ज करें (न्यूनतम 21)',
    '₹30 per card': '₹30 प्रति कार्ड', 'Custom card limit': 'कस्टम कार्ड सीमा',
    'All Premium features': 'सभी प्रीमियम सुविधाएं', 'Flexible pricing': 'लचीली कीमत',
    'Flexible pricing (₹30/card)': 'लचीली कीमत (₹30/कार्ड)',
    'Everything in Premium, plus:': 'प्रीमियम की सभी सुविधाएं, साथ में:',
    'All features included. One-time payment. No recurring charges.': 'सभी सुविधाएं शामिल हैं। एक बार का भुगतान। कोई आवर्ती शुल्क नहीं।',
    'Pricing': 'कीमत', 'Choose the perfect plan for your Vamsapattika': 'अपने वंशपट्टिका के लिए सही प्लान चुनें',
    'Get started': 'शुरू करें', 'Current Plan': 'वर्तमान प्लान', 'Free Plan': 'निःशुल्क प्लान', 'Upgrade Now': 'अभी अपग्रेड करें',
    'Basic support': 'बेसिक सहायता', 'Premium support': 'प्रीमियम सहायता',
    'Please enter a number of cards (minimum 21)': 'कृपया कार्ड की संख्या दर्ज करें (न्यूनतम 21)',
    'This shape will be available in the upcoming release. Stay tuned!': 'यह आकार आगामी रिलीज़ में उपलब्ध होगा। जुड़े रहें!',
    'Please fill in Name and Gender (required fields)': 'कृपया नाम और लिंग भरें (आवश्यक फ़ील्ड)',
    'User': 'उपयोगकर्ता', 'No': 'नहीं', 'Yes': 'हाँ',
    'Name:': 'नाम:', 'Name': 'नाम', 'Gender:': 'लिंग:', 'Gender': 'लिंग',
    'Select Gender': 'लिंग चुनें', 'Male': 'पुरुष', 'Female': 'महिला', 'Other': 'अन्य',
    'Birth Date (optional):': 'जन्म तिथि (वैकल्पिक):', 'Death Date (optional):': 'मृत्यु तिथि (वैकल्पिक):',
    'Birth Date': 'जन्म तिथि', 'Death Date': 'मृत्यु तिथि', 'Enter Birth Date': 'जन्म तिथि दर्ज करें',
    'Enter Death Date': 'मृत्यु तिथि दर्ज करें', 'Occupation (optional):': 'व्यवसाय (वैकल्पिक):',
    'Occupation': 'व्यवसाय', 'Enter Occupation': 'व्यवसाय दर्ज करें', 'Marriage Date & Time:': 'विवाह की तारीख और समय:',
    'Marriage Date & Time': 'विवाह की तारीख और समय', 'Photo (optional):': 'फोटो (वैकल्पिक):',
    'Photo': 'फोटो', 'Edit Person Information': 'व्यक्ति की जानकारी संपादित करें',
    'Add New Family Member': 'नया परिवार सदस्य जोड़ें', 'Add Person': 'व्यक्ति जोड़ें', 'Update Person': 'व्यक्ति अपडेट करें',
    'Cancel': 'रद्द करें', 'Close': 'बंद करें', 'Preview': 'पूर्वावलोकन',
    'Rectangle': 'आयत', 'Rounded': 'गोल', 'Circle': 'वृत्त', 'Hexagon': 'षट्भुज',
    'Apple': 'सेब', 'Sunflower': 'सूरजमुखी', 'Rose': 'गुलाब', 'Border Color': 'बॉर्डर रंग',
    'Background Color': 'पृष्ठभूमि रंग', 'No Background': 'कोई पृष्ठभूमि नहीं', 'Width:': 'चौड़ाई:',
    'Properties': 'गुण', 'Select a person to view properties': 'गुण देखने के लिए किसी व्यक्ति का चयन करें',
    'BASIC INFO': 'मूल जानकारी', 'PHOTO': 'फोटो', 'PHOTO SHAPE': 'फोटो आकार', 'FRAME SHAPE': 'फ्रेम आकार',
    'COLORS': 'रंग', 'Gradient Colors': 'ग्रेडिएंट रंग', 'Custom Gradient': 'कस्टम ग्रेडिएंट',
    'Fill': 'भराव', 'Border': 'बॉर्डर', 'Text': 'टेक्स्ट', 'Color 1': 'रंग 1', 'Color 2': 'रंग 2',
    'Direction': 'दिशा', 'Diagonal': 'तिरछा', 'Diagonal ↘': 'तिरछा ↘', 'Left to Right →': 'बाएं से दाएं →',
    'Top to Bottom ↓': 'ऊपर से नीचे ↓', 'Diagonal ↗': 'तिरछा ↗', 'Right to Left ←': 'दाएं से बाएं ←',
    'Bottom to Top ↑': 'नीचे से ऊपर ↑', 'Bold': 'बोल्ड', 'Italic': 'इटैलिक', 'Underline': 'रेखांकित',
    'Strikethrough': 'स्ट्राइकथ्रू', 'Edit Info': 'जानकारी संपादित करें', 'No family data available': 'परिवार का डेटा उपलब्ध नहीं है',
    'Arial': 'Arial', 'Helvetica': 'Helvetica', 'Times New Roman': 'Times New Roman', 'Georgia': 'Georgia',
    'Courier New': 'Courier New', 'Verdana': 'Verdana', 'Comic Sans MS': 'Comic Sans MS',
    'Important:': 'महत्वपूर्ण:', 'Your Vamsapattika data is saved locally in your browser only.': 'आपका वंशपट्टिका डेटा केवल आपके ब्राउज़र में स्थानीय रूप से सहेजा जाता है।',
    'Upgrade': 'अपग्रेड', 'Starter': 'स्टार्टर', 'Pro': 'प्रो', 'Premium': 'प्रीमियम', 'Custom': 'कस्टम',
    '20+': '20+', 'Unlimited': 'असीमित'
  },
  te: {
    'Vamsapattika': 'వంశపట్టిక',
    'Preserve your family history': 'మీ కుటుంబ చరిత్రను భద్రపరచండి',
    'Login': 'లాగిన్', 'Sign Up': 'సైన్ అప్', 'Full Name': 'పూర్తి పేరు',
    'Email': 'ఈమెయిల్', 'Password': 'పాస్‌వర్డ్', 'Enter your name': 'మీ పేరు నమోదు చేయండి',
    'Enter your email': 'మీ ఈమెయిల్ నమోదు చేయండి', 'Enter your password': 'మీ పాస్‌వర్డ్ నమోదు చేయండి',
    'Please wait...': 'దయచేసి వేచి ఉండండి...', 'Continue with Google': 'Googleతో కొనసాగించండి',
    'OR': 'లేదా', 'Powered by': 'ద్వారా నిర్వహించబడుతుంది', 'Add Photo': 'ఫోటో జోడించండి',
    'Change BG': 'నేపథ్యాన్ని మార్చండి', 'Refresh': 'రిఫ్రెష్', 'Export': 'ఎగుమతి', 'Share': 'షేర్',
    'Download as PNG': 'PNGగా డౌన్‌లోడ్ చేయండి', 'Download as PDF': 'PDFగా డౌన్‌లోడ్ చేయండి',
    'Print / Save as PDF': 'ప్రింట్ / PDFగా సేవ్ చేయండి', 'WhatsApp': 'వాట్సాప్', 'Facebook': 'ఫేస్‌బుక్',
    'Instagram': 'ఇన్‌స్టాగ్రామ్', 'Twitter': 'ట్విట్టర్', 'Copy Link': 'లింక్ కాపీ చేయండి',
    'Trees': 'ట్రీలు', 'Pricing': 'ధర', 'Profile': 'ప్రొఫైల్', 'Settings': 'సెట్టింగ్స్', 'Logout': 'లాగ్ అవుట్',
    'Create New Tree': 'కొత్త ట్రీని సృష్టించండి', 'Create': 'సృష్టించండి', 'Enter tree name': 'ట్రీ పేరు నమోదు చేయండి',
    'No trees found. Create your first tree below!': 'ట్రీలు ఏవీ లేవు. క్రింద మీ మొదటి ట్రీని సృష్టించండి!',
    'Updated:': 'నవీకరించబడింది:', 'Rename': 'పేరు మార్చండి', 'Delete': 'తొలగించండి',
    'Edit Info': 'సమాచారాన్ని సవరించండి', 'Add Spouse': 'జీవిత భాగస్వామిని జోడించండి', 'Add Child': 'పిల్లను జోడించండి',
    'Remove': 'తొలగించండి', 'Upgrade Required': 'అప్‌గ్రేడ్ అవసరం', 'Recommended': 'సిఫార్సు చేయబడింది',
    'Free for everyone': 'అందరికీ ఉచితం', 'One-time payment': 'ఒక్కసారి చెల్లింపు', 'family cards': 'కుటుంబ కార్డులు',
    'Add photos & customize': 'ఫోటోలు జోడించి అనుకూలీకరించండి', 'Export as PNG/PDF': 'PNG/PDFగా ఎగుమతి చేయండి',
    'Priority support': 'ప్రాధాన్యత సహాయం', 'Customize': 'అనుకూలీకరించండి', 'Choose your own limit': 'మీ పరిమితిని ఎంచుకోండి',
    'Number of cards:': 'కార్డుల సంఖ్య:', 'Enter number (min 21)': 'సంఖ్య నమోదు చేయండి (కనీసం 21)',
    '₹30 per card': '₹30 ప్రతి కార్డుకు', 'Custom card limit': 'కస్టమ్ కార్డ్ పరిమితి',
    'All Premium features': 'అన్ని ప్రీమియం ఫీచర్లు', 'Flexible pricing': 'సౌకర్యవంతమైన ధర',
    'Flexible pricing (₹30/card)': 'సౌకర్యవంతమైన ధర (₹30/కార్డ్)', 'Everything in Premium, plus:': 'ప్రీమియంలోని అన్ని ఫీచర్లతో పాటు:',
    'All features included. One-time payment. No recurring charges.': 'అన్ని ఫీచర్లు ఉన్నాయి. ఒక్కసారి చెల్లింపు. పునరావృత ఛార్జీలు లేవు.',
    'Choose the perfect plan for your Vamsapattika': 'మీ వంశపట్టికకు సరైన ప్లాన్‌ను ఎంచుకోండి',
    'Get started': 'ప్రారంభించండి', 'Current Plan': 'ప్రస్తుత ప్లాన్', 'Free Plan': 'ఉచిత ప్లాన్', 'Upgrade Now': 'ఇప్పుడే అప్‌గ్రేడ్ చేయండి',
    'Basic support': 'ప్రాథమిక సహాయం', 'Premium support': 'ప్రీమియం సహాయం',
    'Please enter a number of cards (minimum 21)': 'దయచేసి కార్డుల సంఖ్యను నమోదు చేయండి (కనీసం 21)',
    'This shape will be available in the upcoming release. Stay tuned!': 'ఈ ఆకారం రాబోయే విడుదలలో అందుబాటులో ఉంటుంది. వేచి ఉండండి!',
    'Please fill in Name and Gender (required fields)': 'దయచేసి పేరు మరియు లింగాన్ని నమోదు చేయండి (అవసరమైన ఫీల్డ్‌లు)',
    'User': 'వినియోగదారు', 'No': 'కాదు', 'Yes': 'అవును',
    'Name:': 'పేరు:', 'Name': 'పేరు', 'Gender:': 'లింగం:', 'Gender': 'లింగం', 'Select Gender': 'లింగాన్ని ఎంచుకోండి',
    'Male': 'పురుషుడు', 'Female': 'స్త్రీ', 'Other': 'ఇతర', 'Birth Date (optional):': 'పుట్టిన తేదీ (ఐచ్ఛికం):',
    'Death Date (optional):': 'మరణ తేదీ (ఐచ్ఛికం):', 'Birth Date': 'పుట్టిన తేదీ', 'Death Date': 'మరణ తేదీ',
    'Enter Birth Date': 'పుట్టిన తేదీ నమోదు చేయండి', 'Enter Death Date': 'మరణ తేదీ నమోదు చేయండి',
    'Occupation (optional):': 'వృత్తి (ఐచ్ఛికం):', 'Occupation': 'వృత్తి', 'Enter Occupation': 'వృత్తిని నమోదు చేయండి',
    'Marriage Date & Time:': 'వివాహ తేదీ & సమయం:', 'Marriage Date & Time': 'వివాహ తేదీ & సమయం',
    'Photo (optional):': 'ఫోటో (ఐచ్ఛికం):', 'Photo': 'ఫోటో', 'Edit Person Information': 'వ్యక్తి సమాచారాన్ని సవరించండి',
    'Add New Family Member': 'కొత్త కుటుంబ సభ్యుడిని జోడించండి', 'Add Person': 'వ్యక్తిని జోడించండి',
    'Update Person': 'వ్యక్తిని నవీకరించండి', 'Cancel': 'రద్దు చేయండి', 'Close': 'మూసివేయండి', 'Preview': 'పరిదృశ్యం',
    'Rectangle': 'దీర్ఘచతురస్రం', 'Rounded': 'గుండ్రం', 'Circle': 'వృత్తం', 'Hexagon': 'షడ్భుజం',
    'Apple': 'ఆపిల్', 'Sunflower': 'సూర్యకాంతి', 'Rose': 'గులాబీ', 'Border Color': 'బోర్డర్ రంగు',
    'Background Color': 'నేపథ్య రంగు', 'No Background': 'నేపథ్యం లేదు', 'Width:': 'వెడల్పు:',
    'Properties': 'గుణాలు', 'Select a person to view properties': 'గుణాలను చూడటానికి ఒక వ్యక్తిని ఎంచుకోండి',
    'BASIC INFO': 'ప్రాథమిక సమాచారం', 'PHOTO': 'ఫోటో', 'PHOTO SHAPE': 'ఫోటో ఆకారం', 'FRAME SHAPE': 'ఫ్రేమ్ ఆకారం',
    'COLORS': 'రంగులు', 'Gradient Colors': 'గ్రేడియెంట్ రంగులు', 'Custom Gradient': 'కస్టమ్ గ్రేడియెంట్',
    'Fill': 'పూరణ', 'Border': 'బోర్డర్', 'Text': 'టెక్స్ట్', 'Color 1': 'రంగు 1', 'Color 2': 'రంగు 2',
    'Direction': 'దిశ', 'Diagonal ↘': 'వికర్ణం ↘', 'Left to Right →': 'ఎడమ నుండి కుడికి →',
    'Top to Bottom ↓': 'పై నుండి క్రిందికి ↓', 'Diagonal ↗': 'వికర్ణం ↗', 'Right to Left ←': 'కుడి నుండి ఎడమకు ←',
    'Bottom to Top ↑': 'క్రింది నుండి పైకి ↑', 'Bold': 'బోల్డ్', 'Italic': 'ఇటాలిక్', 'Underline': 'అండర్‌లైన్',
    'Strikethrough': 'స్ట్రైక్‌త్రూ', 'No family data available': 'కుటుంబ డేటా అందుబాటులో లేదు',
    'Important:': 'ముఖ్యమైనది:', 'Your Vamsapattika data is saved locally in your browser only.': 'మీ వంశపట్టిక డేటా మీ బ్రౌజర్‌లో మాత్రమే స్థానికంగా సేవ్ చేయబడుతుంది.',
    'Starter': 'స్టార్టర్', 'Pro': 'ప్రో', 'Premium': 'ప్రీమియం', 'Custom': 'కస్టమ్'
  }
};

const normalize = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

// Fast, local translations. Unknown text is translated asynchronously by
// Google Translate's public translation endpoint below.
const translatePhrase = (value, language) => {
  if (value == null || value === '') return value;
  const key = normalize(value);
  if (language === 'en') return key;

  const dict = dictionaries[language] || {};
  if (dict[key]) return dict[key];

  if (language === 'hi') {
    let m = key.match(/^Updated:\s*(.+)$/i);
    if (m) return `अपडेट किया गया: ${m[1]}`;
    m = key.match(/^Up to (.+) family cards$/i);
    if (m) return `अधिकतम ${m[1]} परिवार कार्ड`;
    m = key.match(/^You've reached the limit of (.+) cards on the (.+) plan$/i);
    if (m) return `आप ${m[2]} प्लान के ${m[1]} कार्ड की सीमा तक पहुंच गए हैं`;
    m = key.match(/^Profile feature coming soon!$/i);
    if (m) return 'प्रोफ़ाइल सुविधा जल्द उपलब्ध होगी!';
    m = key.match(/^Settings feature coming soon!$/i);
    if (m) return 'सेटिंग्स सुविधा जल्द उपलब्ध होगी!';
    m = key.match(/^Upgrade to (.+) plan for ₹(.+)?$/i);
    if (m) return `₹${m[2] || ''} में ${m[1]} प्लान पर अपग्रेड करें?`;
  }

  if (language === 'te') {
    let m = key.match(/^Updated:\s*(.+)$/i);
    if (m) return `నవీకరించబడింది: ${m[1]}`;
    m = key.match(/^Up to (.+) family cards$/i);
    if (m) return `గరిష్టంగా ${m[1]} కుటుంబ కార్డులు`;
    m = key.match(/^You've reached the limit of (.+) cards on the (.+) plan$/i);
    if (m) return `మీరు ${m[2]} ప్లాన్‌లోని ${m[1]} కార్డుల పరిమితిని చేరుకున్నారు`;
    m = key.match(/^Profile feature coming soon!$/i);
    if (m) return 'ప్రొఫైల్ ఫీచర్ త్వరలో అందుబాటులోకి వస్తుంది!';
    m = key.match(/^Settings feature coming soon!$/i);
    if (m) return 'సెట్టింగ్స్ ఫీచర్ త్వరలో అందుబాటులోకి వస్తుంది!';
    m = key.match(/^Upgrade to (.+) plan for ₹(.+)?$/i);
    if (m) return `₹${m[2] || ''}కు ${m[1]} ప్లాన్‌కు అప్‌గ్రేడ్ చేయాలా?`;
  }

  return null;
};

const asyncCache = new Map();
const pendingTranslations = new Map();

const translateWithGoogle = async (text, language) => {
  const value = normalize(text);
  if (!value || language === 'en') return value;

  const local = translatePhrase(value, language);
  if (local) return local;

  const key = `${language}::${value}`;
  if (asyncCache.has(key)) return asyncCache.get(key);
  if (pendingTranslations.has(key)) return pendingTranslations.get(key);

  const promise = translateDynamicText(value, language)
    .then(result => {
      const translated = normalize(result || value) || value;
      asyncCache.set(key, translated);
      return translated;
    })
    .catch(() => value)
    .finally(() => pendingTranslations.delete(key));

  pendingTranslations.set(key, promise);
  return promise;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem('vamsapattika-language') || 'en'
  );

  // Every text node keeps its original English value here. This lets us
  // switch Hindi -> Telugu -> English without translating an already
  // translated string.
  const originals = useRef(new WeakMap());
  const attributeOriginals = useRef(new WeakMap());
  const applying = useRef(false);
  const frame = useRef(null);
  const translationRun = useRef(0);
  const pendingLanguage = useRef(null);

  const applyTranslations = async (targetLanguage) => {
    if (applying.current) {
      pendingLanguage.current = targetLanguage;
      return;
    }
    applying.current = true;
    const runId = ++translationRun.current;

    try {
      const root = document.getElementById('root') || document.body;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let node;

      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent || !node.nodeValue.trim()) continue;
        if (parent.closest('.vamsapattika-language')) continue;
        // Never translate proper names or explicitly protected family data.
        if (parent.closest('[data-no-translate="true"]')) continue;
        if (parent.closest('script, style, noscript, textarea')) continue;
        nodes.push(node);
      }

      // Translate every visible text node, including family names,
      // occupations, tree names, menu items and modal content.
      const unique = new Map();
      nodes.forEach(textNode => {
        let original = originals.current.get(textNode);
        if (original === undefined) {
          original = textNode.nodeValue;
          originals.current.set(textNode, original);
        }
        const core = normalize(original);
        if (core && !unique.has(core)) unique.set(core, original);
      });

      // Small concurrency limit so a large family tree does not fire hundreds
      // of requests at the same time.
      const entries = [...unique.entries()];
      const translatedMap = new Map();
      let index = 0;
      const worker = async () => {
        while (index < entries.length) {
          const current = entries[index++];
          const core = current[0];
          const translated = await translateWithGoogle(core, targetLanguage);
          translatedMap.set(core, translated || core);
        }
      };
      await Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]);

      if (runId !== translationRun.current) return;

      nodes.forEach(textNode => {
        const original = originals.current.get(textNode) || textNode.nodeValue;
        const leading = original.match(/^\s*/)?.[0] || '';
        const trailing = original.match(/\s*$/)?.[0] || '';
        const core = normalize(original);
        const translated = targetLanguage === 'en'
          ? core
          : (translatedMap.get(core) || core);
        textNode.nodeValue = leading + translated + trailing;
      });

      // Translate placeholders, titles, aria labels and image alt text too.
      const elements = root.querySelectorAll('[placeholder], [title], [aria-label], [alt]');
      for (const el of elements) {
        if (el.closest('.vamsapattika-language')) continue;
        if (el.closest('[data-no-translate="true"]')) continue;

        for (const attr of ['placeholder', 'title', 'aria-label', 'alt']) {
          if (!el.hasAttribute(attr)) continue;

          let attrs = attributeOriginals.current.get(el);
          if (!attrs) {
            attrs = {};
            attributeOriginals.current.set(el, attrs);
          }

          if (attrs[attr] === undefined) attrs[attr] = el.getAttribute(attr);
          const original = attrs[attr] || '';
          if (!original.trim()) continue;

          const translated = await translateWithGoogle(original, targetLanguage);
          if (runId !== translationRun.current) return;
          el.setAttribute(attr, translated || original);
        }
      }
    } finally {
      applying.current = false;
      if (pendingLanguage.current && pendingLanguage.current !== targetLanguage) {
        const nextLanguage = pendingLanguage.current;
        pendingLanguage.current = null;
        scheduleTranslation(nextLanguage);
      } else {
        pendingLanguage.current = null;
      }
    }
  };

  const scheduleTranslation = (targetLanguage) => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      applyTranslations(targetLanguage);
    });
  };

  const setLanguage = (next) => {
    if (!['en', 'hi', 'te'].includes(next)) return;
    localStorage.setItem('vamsapattika-language', next);
    translationRun.current += 1;
    pendingLanguage.current = next;
    setLanguageState(next);
    scheduleTranslation(next);
  };

  useEffect(() => {
    scheduleTranslation(language);

    const root = document.getElementById('root') || document.body;
    const observer = new MutationObserver(() => {
      if (!applying.current) scheduleTranslation(language);
    });

    // Watch only structural changes. We intentionally do NOT watch
    // characterData because changing translated text would create a loop.
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (frame.current) cancelAnimationFrame(frame.current);
      translationRun.current += 1;
    };
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (text) => translatePhrase(text, language) || text,
    translateDynamic: (text) => translateWithGoogle(text, language),
    // Proper names use transliteration, not meaning-based translation.
    translateName: (text) => transliterateName(text, language)
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
};
