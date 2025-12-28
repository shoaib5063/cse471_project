const fetch = require('node-fetch');

// Returns an array of label strings for the provided base64 image.
// Prefers Google Cloud Vision API when GOOGLE_VISION_API_KEY is set.
// If no key is present it returns an empty array.
const getLabels = async (imageBase64) => {
  const googleKey = process.env.GOOGLE_VISION_API_KEY;
  if (!googleKey) {
    console.warn('No GOOGLE_VISION_API_KEY set; visionService will return no labels.');
    return [];
  }

  try {
    const body = {
      requests: [
        {
          image: { content: imageBase64 },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 10 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 5 }
          ]
        }
      ]
    };

    const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${googleKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const txt = await res.text();
      console.warn('Vision API responded with error:', res.status, txt);
      return [];
    }

    const data = await res.json();
    const labels = [];
    const resp = data.responses && data.responses[0];
    if (resp) {
      if (Array.isArray(resp.labelAnnotations)) {
        resp.labelAnnotations.forEach(l => {
          if (l.description) labels.push(l.description);
        });
      }
      if (Array.isArray(resp.localizedObjectAnnotations)) {
        resp.localizedObjectAnnotations.forEach(o => {
          if (o.name) labels.push(o.name);
        });
      }
    }

    // Deduplicate and return
    return Array.from(new Set(labels)).slice(0, 5);
  } catch (err) {
    console.error('visionService.getLabels error:', err.message || err);
    return [];
  }
};

module.exports = { getLabels };
