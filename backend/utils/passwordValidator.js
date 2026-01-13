export function validatePassword(password) {
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const failedRules = Object.entries(rules)
    .filter(([_, valid]) => !valid)
    .map(([rule]) => rule);

  return {
    valid: failedRules.length === 0,
    failedRules,
  };
}
