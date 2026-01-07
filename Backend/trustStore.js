// trustStore.js
export const trustStore = new Map();

/*
 Each entry:
 {
   articleHash,
   history: [
     { probabilityReal, credibility, timestamp }
   ],
   nft: { ipfsCid, tokenId, transactionHash } | null
 }
*/
