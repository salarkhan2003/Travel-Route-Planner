const fs = require('fs');
const pf = fs.readFileSync('app/(tabs)/profile.tsx', 'utf8');
const bk = fs.readFileSync('app/(tabs)/booking.tsx', 'utf8');

const getUsedStyles = (code, prefix) => {
  const matches = [...code.matchAll(new RegExp(prefix + '\\.([a-zA-Z0-9_]+)', 'g'))];
  return [...new Set(matches.map(m => m[1]))];
};

const getDefinedStyles = (code) => {
  const match = code.match(/StyleSheet\.create\(\{([\s\S]+)\}\);/);
  if (!match) return [];
  return [...match[1].matchAll(/([a-zA-Z0-9_]+)\s*:/g)].map(m => m[1]);
};

console.log("Profile used but not defined:");
getUsedStyles(pf, 'ps').forEach(s => {
  if (!getDefinedStyles(pf).includes(s)) console.log(s);
});

console.log("Booking used but not defined:");
getUsedStyles(bk, 's').forEach(s => {
  if (!getDefinedStyles(bk).includes(s)) console.log(s);
});
