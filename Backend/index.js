import express from "express";
import cors from "cors";
import axios from "axios";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

/* ================= APP SETUP ================= */

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* ================= ENV CONFIG ================= */

const VERBWIRE_API_KEY = process.env.VERBWIRE_API_KEY;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

const VERBWIRE_MINT_URL =
  "https://api.verbwire.com/v1/nft/mint/quickMintFromMetadata";

/* ================= SOURCE DB ================= */

let sourceDB = {};
try {
  sourceDB = JSON.parse(fs.readFileSync("./Credibility_Scores.json", "utf-8"));
  console.log("✅ Source DB loaded");
} catch {
  console.warn("⚠️ Source DB missing");
}

/* ================= STORES ================= */

const lifecycleStore = new Map();
const mintedNFTs = new Map();

/* ================= HELPERS ================= */

const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
};

const computeLengthScore = (text) => {
  const wc = text.split(/\s+/).length;
  if (wc < 20) return 0.3;
  if (wc < 100) return 0.7;
  return 1.0;
};

const credibilityLabel = (score) => {
  if (score >= 0.7) return "HIGH_CREDIBILITY";
  if (score <= 0.45) return "LOW_CREDIBILITY";
  return "UNCERTAIN";
};

/* ================= HEALTH CHECK ================= */

app.get("/health", (req, res) => {
  res.json({ status: "TrustMint backend running" });
});

/* ================= VERIFY NEWS ================= */

app.post("/api/verify-news", async (req, res) => {
  try {
    const { content, sourceUrl = "" } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const articleHash = crypto
      .createHash("sha256")
      .update(content)
      .digest("hex");

    /* ---- ML SERVICE (SAFE FALLBACK, NO FEATURE CHANGE) ---- */
    let probability = 0.5;
    let emi = 0;
    let certainty = 0;

    try {
      const ml = await axios.post(`${ML_SERVICE_URL}/verify`, {
        text: content,
      });

      probability = ml.data?.probability ?? 0.5;
      emi = ml.data?.emotional_manipulation?.emi_score ?? 0;
      certainty =
        ml.data?.linguistic_certainty?.certainty_ratio > 0.7
          ? ml.data.linguistic_certainty.certainty_ratio
          : 0;
    } catch {
      // ML service unavailable → fallback values already set
    }

    const domain = getDomain(sourceUrl);
    const sourceScore = domain
      ? sourceDB[domain]?.credibility_score ?? 0.45
      : 0.5;

    const lengthScore = computeLengthScore(content);
    const now = new Date().toISOString();

    if (!lifecycleStore.has(articleHash)) {
      lifecycleStore.set(articleHash, {
        firstVerifiedAt: now,
        lastVerifiedAt: now,
        verificationCount: 1,
      });
    } else {
      const entry = lifecycleStore.get(articleHash);
      entry.lastVerifiedAt = now;
      entry.verificationCount += 1;
    }

    const lifecycle = lifecycleStore.get(articleHash);
    const stability = lifecycle.verificationCount >= 2 ? 1 : 0.5;

    let trustScore =
      0.45 * probability +
      0.15 * sourceScore +
      0.15 * lengthScore +
      0.15 * stability -
      0.07 * emi -
      0.03 * certainty;

    trustScore = Math.max(0, Math.min(trustScore, 1));

    res.json({
      articleHash,
      trustScore: Number(trustScore.toFixed(3)),
      credibility: credibilityLabel(trustScore),
      eligibleForNFT: trustScore >= 0.5,
      lifecycle: {
        ...lifecycle,
        isStable: lifecycle.verificationCount >= 2,
      },
    });
  } catch (err) {
    console.error("Verification error:", err.message);
    res.status(500).json({ error: "Verification failed" });
  }
});

/* ================= NFT MINT ================= */

app.post("/api/mint-nft", async (req, res) => {
  try {
    if (!VERBWIRE_API_KEY) {
      return res
        .status(500)
        .json({ error: "Verbwire API key not configured" });
    }

    const { articleHash } = req.body;

    if (!lifecycleStore.has(articleHash)) {
      return res.status(404).json({ error: "Article not verified" });
    }

    if (mintedNFTs.has(articleHash)) {
      return res.json(mintedNFTs.get(articleHash));
    }

    const lifecycle = lifecycleStore.get(articleHash);

    const metadata = {
      name: "TrustMint Verified News",
      description: "On-chain proof of verified news credibility",
      attributes: [
        { trait_type: "Article Hash", value: articleHash },
        { trait_type: "First Verified", value: lifecycle.firstVerifiedAt },
        { trait_type: "Last Verified", value: lifecycle.lastVerifiedAt },
        { trait_type: "Verification Count", value: lifecycle.verificationCount },
      ],
    };

    const response = await axios.post(
      VERBWIRE_MINT_URL,
      {
        chain: "ethereum",
        contractType: "erc721",
        metadata,
      },
      {
        headers: {
          "X-API-Key": VERBWIRE_API_KEY,
        },
      }
    );

    const nft = {
      tokenId: response.data.tokenId,
      transactionHash: response.data.transactionHash,
      ipfsCid: response.data.ipfsCid,
    };

    mintedNFTs.set(articleHash, nft);
    res.json(nft);
  } catch (err) {
    console.error("Verbwire mint error:", err.message);
    res.status(500).json({ error: "NFT mint failed" });
  }
});

/* ================= START SERVER ================= */

app.listen(PORT, () =>
  console.log(`🚀 TrustMint backend running on port ${PORT}`)
);
