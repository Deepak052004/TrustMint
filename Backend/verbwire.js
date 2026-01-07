// verbwire.js
export async function mintTrustNFT(metadata) {
  // 🔴 MOCK MODE (until credentials)
  return {
    ipfsCid: `QmMock_${Date.now()}`,
    tokenId: Math.floor(Math.random() * 10000),
    transactionHash: `0xMOCK_${Date.now()}`,
    mode: "MOCK_VERBWIRE"
  };

  /*
  // 🔵 REAL MODE (when keys are provided)
  const res = await axios.post(
    "https://api.verbwire.com/v1/nft/mint/quickMint",
    {
      chain: "polygon",
      name: "Trusted Content Certificate",
      description: "AI-certified credible news",
      metadataUrl: metadata.ipfsUrl
    },
    {
      headers: { "X-API-Key": process.env.VERBWIRE_API_KEY }
    }
  );
  return res.data;
  */
}
