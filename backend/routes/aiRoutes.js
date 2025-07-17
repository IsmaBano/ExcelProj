const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ExcelRecord = require('../models/excelRecord');
const axios = require('axios');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const generateTableFromJson = (data) => {
  if (!Array.isArray(data) || data.length === 0) return '';
  const keys = Object.keys(data[0]);
  const rows = data.slice(0, 30);
  const header = `| ${keys.join(' | ')} |`;
  const separator = `| ${keys.map(() => '---').join(' | ')} |`;
  const body = rows.map(row => `| ${keys.map(k => row[k] ?? '').join(' | ') } |`).join('\n');
  return `${header}\n${separator}\n${body}`;
};

const getColumnStats = (data) => {
  const stats = {};
  const sampleSize = Math.min(20, data.length);
  if (!Array.isArray(data) || data.length === 0) return stats;
  const keys = Object.keys(data[0]);

  for (const key of keys) {
    const values = data.map(row => row[key]).filter(val => val !== undefined && val !== null);
    const sample = values.slice(0, sampleSize);
    const numericCount = sample.filter(v => typeof v === 'number' || (!isNaN(v) && v !== '')).length;
    const dateCount = sample.filter(v => !isNaN(Date.parse(v))).length;

    stats[key] = {
      type: numericCount >= sampleSize * 0.7
        ? 'number'
        : dateCount >= sampleSize * 0.7
        ? 'date'
        : 'text',
      uniqueValues: new Set(sample).size,
    };
  }

  return stats;
};

router.post('/suggest/:recordId', protect, async (req, res) => {
  try {
    const { viewMode } = req.body; // Get 2D or 3D
    if (!GROQ_API_KEY) {
      return res.status(500).json({ success: false, message: 'GROQ API key missing' });
    }

    const record = await ExcelRecord.findById(req.params.recordId);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (!record.uploadedBy || record.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const jsonData = record.data;
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return res.status(400).json({ success: false, message: 'No data in record' });
    }

    const table = generateTableFromJson(jsonData);
    const columnStats = getColumnStats(jsonData);

    const is3D = viewMode === '3D';

    const prompt = `
You are a data visualization expert. Based on the table and column stats, suggest 3 ${is3D ? '3D' : '2D'} chart types.

Choose from:
${is3D
  ? 'points, bubbles, point+line'
  : 'bar, line, horizontalBar, area, sparkline'}

Rules:
- Respond in JSON array format.
- Only use existing columns.
- Only use ${is3D ? 'xColumn, yColumn, zColumn' : 'xColumn, yColumn'}.
- Do NOT include explanations outside the JSON.

Column stats:
${JSON.stringify(columnStats, null, 2)}

Data preview:
${table}

Respond in this JSON format:
[
  {
    "chartType": "${is3D ? 'bubbles' : 'bar'}",
    "xColumn": "ColumnA",
    "yColumn": "ColumnB"${is3D ? ',\n    "zColumn": "ColumnC"' : ''},
    "reason": "Your reasoning here"
  }
]
    `;

    const startTime = Date.now();
    const groqResponse = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`🤖 GROQ responded in ${Date.now() - startTime}ms`);

    const content = groqResponse.data.choices[0]?.message?.content?.trim();
    if (!content) return res.status(500).json({ success: false, message: 'Empty AI response' });

    let suggestions;
    try {
      const jsonMatch = content.match(/\[\s*{[\s\S]*}\s*\]/);
      if (!jsonMatch) throw new Error('No valid JSON array found');
      suggestions = JSON.parse(jsonMatch[0]);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response',
        raw: content,
      });
    }

    return res.json({ success: true, suggestions });

  } catch (error) {
    console.error('❌ AI Suggestion Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
