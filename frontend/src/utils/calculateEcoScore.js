export function calculateEcoScore(product) {
  if (!product) return 0;

  const carbon = Number(product.carbon_per_unit || 0);
  const water = Number(product.water_usage || 0);
  const recyclability = (product.recyclability || '').toLowerCase();

  const carbonScore = Math.max(0, Math.min(100, 100 - carbon * 12));
  const waterScore = Math.max(0, Math.min(100, 100 - water / 10));
  const recyclabilityScore =
    recyclability === 'high' ? 95 : recyclability === 'medium' ? 65 : 30;
  const categoryBoost =
    product.sustainability_category === 'zero-waste'
      ? 8
      : product.sustainability_category === 'fair-trade'
        ? 6
        : product.sustainability_category === 'eco-friendly'
          ? 5
          : 0;

  const weighted = carbonScore * 0.4 + waterScore * 0.25 + recyclabilityScore * 0.35;
  return Math.max(0, Math.min(100, Math.round(weighted + categoryBoost)));
}

export function calculateDistanceKm(fromLat, fromLong, toLat, toLong) {
  const toRad = (n) => (n * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(toLat - fromLat);
  const dLon = toRad(toLong - fromLong);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
