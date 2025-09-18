// 需要确保已加载 CryptoJS，并且 window.avy 与加密时相同
function decryptVolunteerData(cipherText) {
  const AVY_KEY = window.avy;
  // cipherText 是加密时 .toString() 得到的 Base64 字符串
  const decrypted = CryptoJS.AES.decrypt(
    cipherText,
    CryptoJS.enc.Utf8.parse(AVY_KEY),
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }
  );
  // 转回 UTF-8 明文
  const plaintext = CryptoJS.enc.Utf8.stringify(decrypted);
  return plaintext; // 例如：'{"data":{...}}?timestrap=169...'
}

// 如果你想拿回加密前传入 encryptVolunteerData 的 JSON 字符串或对象：
function parseDecryptedParam(cipherText) {
  const plaintext = decryptVolunteerData(cipherText);
  // 去掉你加密时拼接的 '?timestrap=' 后缀
  const idx = plaintext.indexOf('?timestrap=');
  const jsonStr = idx >= 0 ? plaintext.slice(0, idx) : plaintext;

  // 如果原始传的是 JSON.stringify(rawData)，这里可直接还原为对象
  let obj;
  try {
    obj = JSON.parse(jsonStr);
  } catch (e) {
    // 如果原始传入是纯字符串而非 JSON，这里会抛错，就直接返回字符串
    return { raw: jsonStr, error: null };
  }
  return { json: obj, raw: jsonStr, error: null };
}

// 解密测试：
//// todo: 你的密文，形如 Rh/BfmEHRdiA3gS4...（省略）
const cipher = "";
const plain = decryptVolunteerData(cipher);
console.log('plaintext:', plain);
const { json } = parseDecryptedParam(cipher);
console.log('restored JSON:', json);