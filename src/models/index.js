import { readdirSync } from 'fs';
import { basename, extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const models = {};

// Lấy tất cả file .js trong thư mục models (trừ index.js chính nó)
const files = readdirSync(__dirname).filter(
  (file) =>
    file !== basename(__filename) &&
    extname(file) === '.js'
);

for (const file of files) {
  const modulePath = join(__dirname, file);
  const moduleUrl = pathToFileURL(modulePath);
  const { default: model } = await import(moduleUrl.href);
  if (model && model.name) {
    models[model.name] = model;
  }
}

// Gọi associate nếu có
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

export { models };