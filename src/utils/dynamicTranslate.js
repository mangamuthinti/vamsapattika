const cache = new Map();

// Common family/profile words that should be translated by meaning rather than
// transliterated by Google (for example "nurse" -> "परिचारिका", not "नर्स").
const semanticTranslations = {
  hi: {
    nurse: 'परिचारिका',
    doctor: 'चिकित्सक',
    teacher: 'शिक्षक',
    engineer: 'अभियंता',
    farmer: 'किसान',
    lawyer: 'वकील',
    police: 'पुलिस अधिकारी',
    policeman: 'पुलिस अधिकारी',
    policewoman: 'पुलिस अधिकारी',
    driver: 'चालक',
    businessman: 'व्यवसायी',
    businesswoman: 'व्यवसायी',
    homemaker: 'गृहिणी',
    housewife: 'गृहिणी',
    student: 'विद्यार्थी',
    professor: 'प्राध्यापक',
    principal: 'प्रधानाचार्य',
    manager: 'प्रबंधक',
    accountant: 'लेखाकार',
    architect: 'वास्तुकार',
    artist: 'कलाकार',
    singer: 'गायक',
    actor: 'अभिनेता',
    actress: 'अभिनेत्री',
    writer: 'लेखक',
    journalist: 'पत्रकार',
    scientist: 'वैज्ञानिक',
    pilot: 'पायलट',
    chef: 'रसोइया',
    cook: 'रसोइया',
    electrician: 'बिजली मिस्त्री',
    mechanic: 'मैकेनिक',
    carpenter: 'बढ़ई',
    tailor: 'दर्जी',
    retired: 'सेवानिवृत्त',
    unemployed: 'बेरोज़गार'
  },
  te: {
    nurse: 'శుశ్రూషకురాలు',
    doctor: 'వైద్యుడు',
    teacher: 'ఉపాధ్యాయుడు',
    engineer: 'ఇంజనీర్',
    farmer: 'రైతు',
    lawyer: 'న్యాయవాది',
    police: 'పోలీసు అధికారి',
    policeman: 'పోలీసు అధికారి',
    policewoman: 'పోలీసు అధికారి',
    driver: 'డ్రైవర్',
    businessman: 'వ్యాపారవేత్త',
    businesswoman: 'వ్యాపారవేత్త',
    homemaker: 'గృహిణి',
    housewife: 'గృహిణి',
    student: 'విద్యార్థి',
    professor: 'ఆచార్యుడు',
    principal: 'ప్రధానోపాధ్యాయుడు',
    manager: 'మేనేజర్',
    accountant: 'లెక్కల అధికారి',
    architect: 'వాస్తుశిల్పి',
    artist: 'కళాకారుడు',
    singer: 'గాయకుడు',
    actor: 'నటుడు',
    actress: 'నటి',
    writer: 'రచయిత',
    journalist: 'పాత్రికేయుడు',
    scientist: 'శాస్త్రవేత్త',
    pilot: 'విమాన చోదకుడు',
    chef: 'వంట నిపుణుడు',
    cook: 'వంటవాడు',
    electrician: 'విద్యుత్ మేస్త్రీ',
    mechanic: 'యంత్ర మెకానిక్',
    carpenter: 'వడ్రంగి',
    tailor: 'దర్జీ',
    retired: 'పదవీ విరమణ చేసినవారు',
    unemployed: 'నిరుద్యోగి'
  }
};



// Proper-name transliteration is different from translation. A person's name
// should keep the same pronunciation in Hindi/Telugu, not be translated as
// an English word. Google Input Tools provides transliteration suggestions.
const nameCache = new Map();
const pendingNameTranslations = new Map();

const commonNameTransliterations = {
  hi: {
    sai: 'साई',
    saibaba: 'साईबाबा',
    ravi: 'रवि',
    raj: 'राज',
    ram: 'राम',
    sita: 'सीता',
    prasad: 'प्रसाद',
    anil: 'अनिल',
    sunil: 'सुनील',
    priya: 'प्रिया',
    pooja: 'पूजा',
    poojaa: 'पूजा',
    manga: 'मंगा',
  },
  te: {
    sai: 'సాయి',
    saibaba: 'సాయిబాబా',
    ravi: 'రవి',
    raj: 'రాజ్',
    ram: 'రామ్',
    sita: 'సీత',
    prasad: 'ప్రసాద్',
    anil: 'అనిల్',
    sunil: 'సునీల్',
    priya: 'ప్రియ',
    pooja: 'పూజ',
    poojaa: 'పూజ',
    manga: 'మంగా',
  }
};

export async function transliterateName(text, language) {
  const original = String(text ?? '').trim();
  if (!original || language === 'en') return original;

  const key = `${language}::${original}`;
  if (nameCache.has(key)) return nameCache.get(key);

  const common = commonNameTransliterations[language]?.[original.toLowerCase()];
  if (common) {
    nameCache.set(key, common);
    return common;
  }

  if (pendingNameTranslations.has(key)) {
    return pendingNameTranslations.get(key);
  }

  const promise = (async () => {
    try {
      // Google Input Tools transliterates pronunciation rather than
      // translating meaning (e.g. Sai -> साई / సాయి).
      const url =
        `https://inputtools.google.com/request?` +
        `text=${encodeURIComponent(original)}` +
        `&itc=${encodeURIComponent(`${language}-t-i0-und`)}` +
        `&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Google transliteration failed: ${response.status}`);

      const data = await response.json();
      const suggestions = data?.[1]?.[0]?.[1];
      const result = Array.isArray(suggestions) && suggestions[0]
        ? suggestions[0]
        : original;

      nameCache.set(key, result);
      return result;
    } catch (error) {
      console.warn('Name transliteration failed:', error);
      nameCache.set(key, original);
      return original;
    }
  })().finally(() => pendingNameTranslations.delete(key));

  pendingNameTranslations.set(key, promise);
  return promise;
}

const getCacheKey = (text, language) => `${language}::${text.trim()}`;

export async function translateDynamicText(text, language) {
  const original = String(text ?? '').trim();
  if (!original || language === 'en') return text;

  const key = getCacheKey(original, language);
  if (cache.has(key)) return cache.get(key);

  // Exact semantic translation first. This prevents Google from returning
  // transliterations such as "नर्स" when the product needs a meaning-based
  // translation such as "परिचारिका".
  const semantic = semanticTranslations[language]?.[original.toLowerCase()];
  if (semantic) {
    cache.set(key, semantic);
    return semantic;
  }

  try {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx` +
      `&sl=auto&tl=${encodeURIComponent(language)}&dt=t&q=${encodeURIComponent(original)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Translate request failed: ${response.status}`);
    }

    const data = await response.json();
    const translated = Array.isArray(data?.[0])
      ? data[0].map((part) => part?.[0] || '').join('')
      : original;

    const result = translated || original;
    cache.set(key, result);
    return result;
  } catch (error) {
    console.warn('Dynamic Google translation failed:', error);
    return original;
  }
}
