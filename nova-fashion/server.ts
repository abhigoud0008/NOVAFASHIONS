import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client to prevent startup crashes if key is omitted
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST API logic
app.get("/api/health", (req, res) => {
  res.json({ status: "online", time: new Date().toISOString() });
});

// AI Stylist recommendations endpoint
app.post("/api/stylist", async (req, res) => {
  const { mood, occasion, preferredCategory, currency = "USD" } = req.body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // Graceful local simulated AI responses for offline or unconfigured API keys
      console.log("Gemini API key not found or placeholder - using mock fallback AI.");
      const fallbacks = [
        {
          advice: `Based on your desire for a ${mood || "futuristic"} silhouette for ${occasion || "everyday wear"}, we recommend pairing technical lightweight ventilation layers with protective modular hard-shells. Maintain a high-contrast palette with bright neon underlays and carbon obsidian drops.`,
          recommendedProductIds: ["nova-001", "nova-005", "nova-008"],
          suggestedOutfitTitle: "CHRONO COGNITIVE DEPLOYER"
        },
        {
          advice: `For ${occasion || "high-tech meetings"}, focus on asymmetrical structure. A combination of structured garments wearing titanium optical accessories delivers maximum avant-garde balance.`,
          recommendedProductIds: ["nova-002", "nova-003", "nova-006"],
          suggestedOutfitTitle: "SPECTRAL MATRIX URBANITE"
        },
        {
          advice: `A sleek, active and mobile setup tailored to a ${mood || "cyberpunk"} atmosphere. The heavy neoprene armor combined with responsive segmented air soles ensures high protection and effortless agility.`,
          recommendedProductIds: ["nova-004", "nova-005", "nova-007"],
          suggestedOutfitTitle: "KINETIC SHIELD RUNNER"
        }
      ];

      // Select matching fallback based on preferences or random
      let selected = fallbacks[0];
      if (preferredCategory === "Accessories" || preferredCategory === "Tops") {
        selected = fallbacks[1];
      } else if (mood === "rebellious" || mood === "sporty" || preferredCategory === "Footwear") {
        selected = fallbacks[2];
      }

      // Briefly timeout to simulate network
      await new Promise(resolve => setTimeout(resolve, 800));
      return res.json(selected);
    }

    const promptText = `Provide custom styling recommendations for a luxury futuristic fashion brand called NOVA FASHION.
User metadata:
- Preferred mood: ${mood || 'Sleek & Cyberpunk'}
- Occasion/Context: ${occasion || 'Neo-City Urban Exploration'}
- Target interest category: ${preferredCategory || 'Outerwear/Mix'}

Choose 2 to 3 product IDs from our official inventory: "nova-001" (HOLO-GATEWAY PARKA), "nova-002" (CYBER-LUME SHIELD VISOR), "nova-003" (VOID-WEAVE DECONSTRUCTED COAT), "nova-004" (KINETIC CARGO STRAP TROUSERS), "nova-005" (AERO-CHRONO CHUNKY RUNNERS), "nova-006" (VERTEX WAVE COMPRESSION SLEEVE), "nova-007" (CYBER-SHELL ARMOR HOODIE), "nova-008" (ECLIPSE MULTI-UTILITY BACKPACK).

Deliver a stylish, highly creative recommendation text. Be descriptive and refer to cybernetic materials and high-fashion aesthetics.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: "You are the advanced, highly elegant AI head fashion stylist 'NOVA AI' for NOVA FASHION. You guide users to coordinate premium futuristic silhouettes, referring to technical details (electro-chromic materials, titanium accents, nanotech weave). Keep tone extremely polished, luxurious, helpful, and avant-garde.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advice: { 
              type: Type.STRING, 
              description: "A customized 2-3 sentence paragraph of styling advice, talking about color pairings and futuristic silhouettes." 
            },
            recommendedProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "JSON array containing exactly 2 or 3 product IDs chosen from our catalog matching user's vibe."
            },
            suggestedOutfitTitle: { 
              type: Type.STRING, 
              description: "A cool, high-end, cyberpunk outfit combination name, e.g., 'VOID ECLIPSE SPECTRE' or 'THERMAL MATRIX ROUTER'." 
            }
          },
          required: ["advice", "recommendedProductIds", "suggestedOutfitTitle"]
        }
      }
    });

    const resultText = response.text ? response.text.trim() : "{}";
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini API server endpoint error:", error);
    res.status(500).json({ 
      error: "Failed to generate styling advice.",
      details: error.message,
      advice: "We detected high ocular frequency changes. To protect your terminal, here is a premium styling option: pair our HOLO-GATEWAY PARKA with CYBER-LUME SHIELD VISOR for a light-shifting protective silhouette.",
      recommendedProductIds: ["nova-001", "nova-002"],
      suggestedOutfitTitle: "GLITCH PROTOCOL OVERLAY"
    });
  }
});

// Configure Vite middleware or Static files serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Booting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Booting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NOVA FASHION server executing flawlessly on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
