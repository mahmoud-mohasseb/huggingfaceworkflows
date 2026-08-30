import { getSavedHFToken } from "../../auth/tokenStore";

export interface VideoGenResult {
  videoUrl: string;
  previewImageUrl: string;
  modelUsed: string;
  source: 'hf-inference' | 'image-scene';
}

export async function executeVideoGenNode(
  prompt: string,
  modelId: string = "cerspense/zeroscope_v2_576w",
  hfToken?: string
): Promise<VideoGenResult> {
  const activeToken = hfToken || getSavedHFToken() || process.env.HF_ACCESS_TOKEN || process.env.HF_TOKEN || "";
  const targetModel = modelId || "cerspense/zeroscope_v2_576w";
  const cleanPrompt = (prompt || "Cosmic galaxy scene").trim();

  // Generate prompt-specific clean static image link without animation
  const staticImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt + ' cinematic movie scene 4k')}?width=768&height=432&nologo=true`;

  // 1. Primary Engine: Hugging Face Router Serverless Video Inference
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (activeToken && !activeToken.includes("demo")) {
      headers["Authorization"] = `Bearer ${activeToken}`;
    }

    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${targetModel}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ inputs: cleanPrompt }),
      }
    );

    if (response.ok) {
      const contentType = response.headers.get("content-type") || "image/jpeg";
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength > 1000) {
        const base64Img = `data:${contentType};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
        return {
          videoUrl: base64Img,
          previewImageUrl: base64Img,
          modelUsed: targetModel,
          source: 'hf-inference',
        };
      }
    }
  } catch (err: any) {
    console.warn("HF Router videoGen warning:", err?.message || err);
  }

  // 2. Direct clean static image link without animation
  return {
    videoUrl: staticImageUrl,
    previewImageUrl: staticImageUrl,
    modelUsed: targetModel,
    source: 'image-scene',
  };
}
