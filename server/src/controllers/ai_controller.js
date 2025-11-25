const { execFile } = require('child_process');
const path = require('path');

exports.analyzeSentiment = (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'Missing text to analyze' });
  }

  const scriptPath = path.join(__dirname, '..', '..', 'ml_ai', 'predict.py');

  execFile('python3', [scriptPath, text], (err, stdout, stderr) => {
    if (err) {
      console.error('AI Error:', err);
      return res.status(500).json({ message: 'AI processing error' });
    }

    const result = (stdout || '').toString().trim();
    res.json({ sentiment: result });
  });
};
