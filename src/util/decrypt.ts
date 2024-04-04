import fs from "fs";
const forge = require("node-forge");
export const decryptText = (encryptedText: string): Buffer => {
  const privateKeyPem = fs.readFileSync("src/asset/private_key.pem", "utf8");
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const encryptedData = forge.util.decode64(encryptedText);
  const decryptedData = privateKey.decrypt(encryptedData);

  return decryptedData;
};
