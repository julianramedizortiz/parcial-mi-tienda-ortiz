module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Permite importar los archivos .sql generados por drizzle-kit
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
