// Production installs and CI do not need local Git hooks or Husky's dev dependency.
if (
  process.env.CI ||
  process.env.NODE_ENV === 'production' ||
  process.env.npm_config_production === 'true' ||
  process.env.HUSKY === '0'
)
  process.exit(0);

const { default: install } = await import('husky');
const message = install();
if (message) {
  console.error(message);
  process.exitCode = 1;
}
