export const templates = {
  garden: {
    id: "garden",
    name: "Garden Romance",
    price: "RM 99",
    priceRaw: 99,
    description: "Soft pastel watercolor garden flowers, hand-drawn floral ornaments, and elegant warm gold falling sways.",
    background: "/src/assets/templates/garden/background.webp",
    overlay: "/src/assets/templates/garden/overlay.webp",
    thumbnail: "/src/assets/templates/garden/thumbnail.webp",
    mood: "romantic, floral, classic",
    style: "pastel pink, warm gold, watercolor",
    decorations: [
      { type: "petal", char: "🌸", style: "top: 25%; left: 35%; animation-delay: 0s;" },
      { type: "petal", char: "🌸", style: "top: 55%; left: 75%; animation-delay: 1.2s;" }
    ],
    particleType: "garden",
    colors: {
      background: "#fdfbf7",
      primary: "#f0b4b9",
      dark: "#a8936d",
      gold: "#dfc384",
      text: "#2d2a26",
      muted: "#8c7251"
    }
  },
  royal: {
    id: "royal",
    name: "Royal Malay",
    price: "RM 99",
    priceRaw: 99,
    description: "Bespoke luxury gold frame borders, classic Malay royal elements, and elegant glowing golden sparkles.",
    background: "/src/assets/templates/royal/background.webp",
    overlay: null,
    thumbnail: "/src/assets/templates/royal/thumbnail.webp",
    mood: "bespoke, royal, majestic",
    style: "gold, cream, luxury",
    decorations: [
      { type: "shimmer" }
    ],
    particleType: "royal",
    colors: {
      background: "#f7f3eb",
      primary: "#ecdcb9",
      dark: "#a8936d",
      gold: "#dfc384",
      text: "#131211",
      muted: "#a8936d"
    }
  },
  islamic: {
    id: "islamic",
    name: "Islamic Minimal",
    price: "RM 99",
    priceRaw: 99,
    description: "Bespoke Mosque architectural arch framing, serene sage-green accents, and soft falling gold-leaf particles.",
    background: "/src/assets/templates/islamic/background.webp",
    overlay: null,
    thumbnail: "/src/assets/templates/islamic/thumbnail.webp",
    mood: "calm, peaceful, elegant, modern Islamic wedding",
    style: "sage green, cream, soft gold, clean arch design",
    decorations: [
      { type: "arch" }
    ],
    particleType: "islamic",
    colors: {
      background: "#F7F9F7",
      primary: "#6A8F73",
      dark: "#3E5F4F",
      gold: "#C6A964",
      text: "#1F1F1F",
      muted: "#6B6B6B"
    }
  }
};
