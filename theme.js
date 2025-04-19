export const theme = {
  colors: {
    primary: '#40E0D0', // Teal
    secondary: '#64B4FF', // Sky blue
    background: {
      dark: '#0F2027', // Deep blue-black
      medium: '#203A43', // Slate blue
      light: '#2C5364', // Navy blue
    },
    text: {
      light: '#E0F7FA', // Ice blue
      muted: '#B8F0F9', // Light cyan
    },
    accents: {
      success: '#4CAF50', // Green
      warning: '#FFCE6A', // Amber
      error: '#FF7979', // Soft red
    },
    borderWhite: "rgba(255, 255, 255, 0.1)",
    glassWhite: "rgba(255, 255, 255, 0.08)",
  },
  gradients: {
    primary: 'linear-gradient(90deg, #40E0D0 0%, #64B4FF 100%)',
    background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
  },
  shadows: {
    small: '0 4px 10px rgba(0, 0, 0, 0.1)',
    medium: '0 8px 20px rgba(0, 0, 0, 0.15)',
    large: '0 15px 30px rgba(0, 0, 0, 0.2)',
    glow: '0 0 15px rgba(64, 224, 208, 0.3)',
  },
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '20px',
    pill: '50px',
  },
  fonts: {
    heading: "'Montserrat', sans-serif",
    body: "'Open Sans', sans-serif",
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  }
};
