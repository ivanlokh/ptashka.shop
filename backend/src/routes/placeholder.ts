import { Router } from 'express';

const router = Router();

// Simple placeholder image generator (SVG)
router.get('/placeholder/:width/:height', async (req, res) => {
  console.log('Placeholder route called:', req.params);
  try {
    const { width, height } = req.params;
    const w = parseInt(width) || 300;
    const h = parseInt(height) || 300;
    
    // Create a simple SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
          ${w} × ${h}
        </text>
      </svg>
    `;
    
    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000'
    });
    
    res.send(svg);
  } catch (error) {
    console.error('Placeholder generation error:', error);
    res.status(500).json({ error: 'Failed to generate placeholder image' });
  }
});

export default router;
